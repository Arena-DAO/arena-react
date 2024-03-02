import {
	Box,
	Container,
	Grid,
	GridItem,
	Heading,
	Stack,
} from "@chakra-ui/layout";
import {
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	InputGroup,
	InputRightAddon,
	Select,
	useToast,
} from "@chakra-ui/react";
import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";
import CreateCompetitionForm from "@components/competition/CreateCompetitionForm";
import { CosmWasmClient, toBinary } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import moment from "moment-timezone";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import env from "~/config/env";
import {
	AddressSchema,
	CreateCompetitionSchema,
	DurationSchema,
} from "~/config/schemas";
import { useCategoriesContext } from "~/contexts/CategoriesContext";
import {
	convertToDuration,
	convertToExpiration,
	convertToRules,
	convertToRulesets,
} from "~/helpers/SchemaHelpers";
import { InstantiateMsg as ArenaEscrowInstantiateMsg } from "~/ts-codegen/arena/ArenaEscrow.types";
import { ArenaLeagueModuleClient } from "~/ts-codegen/arena/ArenaLeagueModule.client";
import { CompetitionInstantiateExt } from "~/ts-codegen/arena/ArenaLeagueModule.types";

interface LeagueFormProps {
	cosmwasmClient: CosmWasmClient;
}

const CreateLeagueSchema = CreateCompetitionSchema.extend({
	match_win_points: z.string(),
	match_draw_points: z.string(),
	match_lose_points: z.string(),
	round_duration: DurationSchema,
	host: AddressSchema,
});
type FormValues = z.infer<typeof CreateLeagueSchema>;

function LeagueForm({ cosmwasmClient }: LeagueFormProps) {
	const router = useRouter();
	const categoryMap = useCategoriesContext();
	const category = router.query.category;
	if (!category) throw "No category provided";
	const categoryItem = categoryMap.get(category as string);
	if (!categoryItem || !("category_id" in categoryItem))
		throw "No category_id found";
	const toast = useToast();
	const { getSigningCosmWasmClient, address, isWalletConnected } = useChain(
		env.CHAIN,
	);

	const formMethods = useForm<FormValues>({
		defaultValues: {
			expiration: {
				expiration_units: "At Time",
				time: format(
					new Date(Date.now() + 7 * 4 * 24 * 60 * 60 * 1000), // Default to 4 weeks from now
					"yyyy-MM-dd'T'HH:mm",
				),
				timezone: moment.tz.guess(),
			},
			rules: [],
			dues: [
				{
					balance: {
						cw20: [],
						cw721: [],
						native: [],
					},
				},
				{
					balance: {
						cw20: [],
						cw721: [],
						native: [],
					},
				},
			],
			competition_dao_name: `Arena Competition DAO - ${categoryItem.title}`,
			competition_dao_description: `A DAO for handling an Arena Competition in ${categoryItem.title}.`,
			match_win_points: "3",
			match_lose_points: "0",
			match_draw_points: "1",
			round_duration: {
				duration_units: "Time",
				duration: 3 * 24 * 60 * 60, // Default to 3 days
			},
			host: address,
		},
		resolver: zodResolver(CreateCompetitionSchema),
	});
	const {
		handleSubmit,
		register,
		formState: { isSubmitting, errors },
		watch,
		getValues,
	} = formMethods;

	const watchHost = watch("host");
	const watchRoundDurationUnits = watch("round_duration.duration_units");

	const onSubmit = async (values: FormValues) => {
		try {
			const cosmwasmClient = await getSigningCosmWasmClient();
			if (!cosmwasmClient) throw "Could not get the CosmWasm client";
			if (!address) throw "Could not get user address";

			const moduleClient = new ArenaLeagueModuleClient(
				cosmwasmClient,
				address,
				env.ARENA_LEAGUE_MODULE_ADDRESS,
			);

			values = getValues();

			const msg = {
				categoryId: categoryItem.category_id!,
				description: values.description,
				expiration: convertToExpiration(values.expiration),
				name: values.name,
				rules: convertToRules(values.rules),
				rulesets: convertToRulesets(values.rulesets),
				instantiateExtension: {
					match_draw_points: values.match_draw_points,
					match_lose_points: values.match_lose_points,
					match_win_points: values.match_win_points,
					round_duration: convertToDuration(values.round_duration),
					teams: values.dues.map((x) => x.addr),
				} as CompetitionInstantiateExt,
				host: {
					existing: {
						addr: values.host,
					},
				},
				escrow: {
					code_id: env.CODE_ID_ESCROW,
					label: "Arena Escrow",
					msg: toBinary({
						dues: values.dues,
						whitelist: [env.ARENA_DAO_ADDRESS],
					} as ArenaEscrowInstantiateMsg),
				},
			};

			const result = await moduleClient.createCompetition(msg);

			toast({
				title: "Success",
				isClosable: true,
				status: "success",
				description: "The competition has been created.",
			});

			let id;
			for (const event of result.events) {
				for (const attribute of event.attributes) {
					if (attribute.key === "id") {
						id = attribute.value;
						break;
					}
				}
				if (id) break;
			}

			if (id) router.push(`/league/view?category=${category}&id=${id}`);
		} catch (e: any) {
			console.error(e);
			toast({
				status: "error",
				title: "Error",
				description: e.toString(),
				isClosable: true,
			});
		}
	};

	return (
		<FormProvider {...formMethods}>
			<form onSubmit={handleSubmit(async (data) => await onSubmit(data))}>
				<Stack>
					<FormControl isInvalid={!!errors.host}>
						<FormLabel>Host</FormLabel>
						<Input {...register("host")} readOnly />
						<FormErrorMessage>{errors.host?.message}</FormErrorMessage>
					</FormControl>
					<UserOrDAOCard cosmwasmClient={cosmwasmClient} address={watchHost} />
					<CreateCompetitionForm
						category_id={categoryItem.category_id!}
						cosmwasmClient={cosmwasmClient}
					/>
					<Grid
						templateColumns={{
							base: "1fr",
							sm: "repeat(2, 1fr)",
							xl: "repeat(3, 1fr)",
						}}
						gap="2"
						alignItems="flex-start"
					>
						<GridItem>
							<FormControl isInvalid={!!errors.match_win_points}>
								<FormLabel>Match Win Points</FormLabel>
								<Input
									type="number"
									{...register("match_win_points", {
										setValueAs: (x) => (x === "" ? undefined : x.toString()),
									})}
								/>
								<FormErrorMessage>
									{errors.match_win_points?.message}
								</FormErrorMessage>
							</FormControl>
						</GridItem>
						<GridItem>
							<FormControl isInvalid={!!errors.match_draw_points}>
								<FormLabel>Match Draw Points</FormLabel>
								<Input
									type="number"
									{...register("match_draw_points", {
										setValueAs: (x) => (x === "" ? undefined : x.toString()),
									})}
								/>
								<FormErrorMessage>
									{errors.match_draw_points?.message}
								</FormErrorMessage>
							</FormControl>
						</GridItem>
						<GridItem>
							<FormControl isInvalid={!!errors.match_lose_points}>
								<FormLabel>Match Lose Points</FormLabel>
								<Input
									type="number"
									{...register("match_lose_points", {
										setValueAs: (x) => (x === "" ? undefined : x.toString()),
									})}
								/>
								<FormErrorMessage>
									{errors.match_lose_points?.message}
								</FormErrorMessage>
							</FormControl>
						</GridItem>
					</Grid>
					<Grid
						templateColumns="repeat(12, 1fr)"
						gap="2"
						alignItems="flex-start"
					>
						<GridItem colSpan={{ base: 12, sm: 8, md: 6, lg: 4 }}>
							<FormControl isInvalid={!!errors.round_duration?.duration}>
								<FormLabel>Round Duration</FormLabel>
								<InputGroup>
									<Input
										type="number"
										textAlign="end"
										{...register("round_duration.duration", {
											setValueAs: (x) => (x === "" ? undefined : parseInt(x)),
										})}
									/>
									<InputRightAddon>
										{watchRoundDurationUnits === "Time" ? "seconds" : "blocks"}
									</InputRightAddon>
								</InputGroup>
								<FormErrorMessage>
									{errors.round_duration?.duration?.message}
								</FormErrorMessage>
							</FormControl>
						</GridItem>
						<GridItem colSpan={{ base: 12, sm: 4, lg: 2 }}>
							<FormControl isInvalid={!!errors.round_duration?.duration_units}>
								<FormLabel>Round Units</FormLabel>
								<Select {...register("round_duration.duration_units")}>
									<option value="Time">Time</option>
									<option value="Height">Height</option>
								</Select>
								<FormErrorMessage>
									{errors.round_duration?.duration_units?.message}
								</FormErrorMessage>
							</FormControl>
						</GridItem>
					</Grid>
					<Box mt="2">
						<Button
							type="submit"
							isDisabled={!isWalletConnected}
							isLoading={isSubmitting}
						>
							Submit
						</Button>
					</Box>
				</Stack>
			</form>
		</FormProvider>
	);
}

const CreateLeaguePage = () => {
	const { getCosmWasmClient } = useChain(env.CHAIN);

	const [cosmwasmClient, setCosmwasmClient] = useState<
		CosmWasmClient | undefined
	>(undefined);
	useEffect(() => {
		async function fetchClient() {
			setCosmwasmClient(await getCosmWasmClient());
		}
		fetchClient();
	}, [getCosmWasmClient]);

	return (
		<Container maxW={{ base: "full", md: "5xl" }} centerContent pb={10}>
			<Heading>Create a League</Heading>
			<Box w="100%">
				{cosmwasmClient && <LeagueForm cosmwasmClient={cosmwasmClient} />}
			</Box>
		</Container>
	);
};

export default CreateLeaguePage;
