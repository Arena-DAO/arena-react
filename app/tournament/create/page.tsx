"use client";

import Profile from "@/components/Profile";
import CreateCompetitionForm from "@/components/competition/create/CreateCompetitionForm";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Input,
	Link,
	Progress,
	Select,
	SelectItem,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tooltip,
} from "@nextui-org/react";
import { addMonths } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
	Controller,
	FormProvider,
	useFieldArray,
	useForm,
} from "react-hook-form";
import { BsArrowLeft, BsPercent } from "react-icons/bs";
import { FiPlus, FiTrash } from "react-icons/fi";
import { toast } from "react-toastify";
import { ZodIssueCode, z } from "zod";
import { ArenaTournamentModuleClient } from "~/codegen/ArenaTournamentModule.client";
import {
	AddressSchema,
	CreateCompetitionSchema,
	DecimalSchema,
} from "~/config/schemas";
import {
	convertToEscrowInstantiate,
	convertToExpiration,
} from "~/helpers/SchemaHelpers";
import { getNumberWithOrdinal } from "~/helpers/UIHelpers";
import { useCategoryMap } from "~/hooks/useCategories";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

const EliminationTypeSchema = z.union([
	z.literal("double_elimination"),
	z.object({
		single_elimination: z.object({
			play_third_place_match: z.boolean(),
		}),
	}),
]);

const CreateTournamentSchema = CreateCompetitionSchema.extend({
	host: AddressSchema,
	distribution: z
		.object({ percentage: DecimalSchema })
		.array()
		.min(1, "Distribution is required")
		.superRefine((val, ctx) => {
			if (
				Math.round(val.reduce((acc, cur) => acc + cur.percentage, 0) * 100) /
					100 !==
				1
			) {
				ctx.addIssue({
					code: ZodIssueCode.custom,
					message: "Sum of percentages must equal 1",
				});
			}
		}),
	elimination_type: EliminationTypeSchema,
});
type CreateTournamentFormValues = z.infer<typeof CreateTournamentSchema>;

const CreateTournament = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { getSigningCosmWasmClient, address, isWalletConnected } = useChain(
		env.CHAIN,
	);
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: categories } = useCategoryMap();

	const category = searchParams?.get("category") ?? "";
	const categoryItem = categories.get(category);
	const category_id = categoryItem
		? "category_id" in categoryItem
			? categoryItem.category_id
			: undefined
		: undefined;
	const formMethods = useForm<CreateTournamentFormValues>({
		defaultValues: {
			expiration: {
				at_time: addMonths(new Date(), 1).toISOString(), // Default to a month from now
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
			],
			membersFromDues: false,
			members: [{ address: "" }],
			distribution: [{ percentage: 100 }],
			elimination_type: {
				single_elimination: { play_third_place_match: true },
			},
		},
		resolver: zodResolver(CreateTournamentSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting, errors, defaultValues },
		control,
		watch,
		setValue,
		getValues,
	} = formMethods;

	const { fields, append, remove } = useFieldArray({
		control,
		name: "distribution",
	});

	const watchHost = watch("host");
	const percentages = watch("distribution");
	const watchEliminationType = watch("elimination_type");
	const watchPlaysThirdPlaceMatch = watch(
		"elimination_type.single_elimination.play_third_place_match",
	);

	useEffect(() => {
		const value = getValues("dues.0.addr");
		if (value === undefined && address) {
			setValue("dues.0.addr", address);
		}
	}, [address, getValues, setValue]);

	const onSubmit = async (values: CreateTournamentFormValues) => {
		try {
			const cosmWasmClient = await getSigningCosmWasmClient();
			if (!address) throw "Could not get user address";

			const TournamentModuleClient = new ArenaTournamentModuleClient(
				cosmWasmClient,
				address,
				env.ARENA_TOURNAMENT_MODULE_ADDRESS,
			);

			const msg = {
				categoryId: category_id?.toString(),
				description: values.description,
				expiration: convertToExpiration(values.expiration),
				name: values.name,
				rules: values.rules.map((x) => x.rule),
				rulesets: values.rulesets.map((x) => x.ruleset_id.toString()),
				instantiateExtension: {
					distribution: values.distribution.map((x) => x.percentage.toString()),
					teams: values.membersFromDues
						? values.dues.map((x) => x.addr)
						: values.members.map((x) => x.address),
					elimination_type: values.elimination_type,
				},
				host: { existing: { addr: values.host } },
				escrow: convertToEscrowInstantiate(
					env.CODE_ID_ESCROW,
					values.dues,
					values.additionalLayeredFees,
				),
			};

			const result = await TournamentModuleClient.createCompetition(msg);

			toast.success("The tournament was created");

			let competitionId: string | undefined = undefined;
			for (const event of result.events) {
				for (const attribute of event.attributes) {
					if (attribute.key === "competition_id") {
						competitionId = attribute.value;
						break;
					}
				}
				if (competitionId) break;
			}

			if (competitionId)
				router.push(
					`/tournament/view?category=${category}&competitionId=${competitionId}`,
				);

			// biome-ignore lint/suspicious/noExplicitAny: try-catch
		} catch (e: any) {
			console.error(e);
			toast.error(e.toString());
		}
	};

	return (
		<FormProvider {...formMethods}>
			<form onSubmit={handleSubmit(async (data) => await onSubmit(data))}>
				<div className="mx-auto w-full max-w-screen-xl justify-center space-y-4 px-10">
					<h1 className="title text-center text-5xl">Create a Tournament</h1>
					{category && (
						<Tooltip content="Return to competitions">
							<Button
								isIconOnly
								as={Link}
								href={`/compete?category=${category}`}
							>
								<BsArrowLeft />
							</Button>
						</Tooltip>
					)}
					<div className="flex gap-4">
						<Controller
							control={control}
							name="host"
							render={({ field }) => (
								<Input
									className="max-w-3xl"
									type="text"
									label="Host"
									isDisabled={isSubmitting}
									isInvalid={!!errors.host}
									errorMessage={errors.host?.message}
									{...field}
								/>
							)}
						/>
						{watchHost && cosmWasmClient && (
							<Profile address={watchHost} cosmWasmClient={cosmWasmClient} />
						)}
					</div>
					<CreateCompetitionForm isMembersFromDuesVisible>
						<>
							<Select
								label="Elimination Type"
								isDisabled={isSubmitting}
								defaultSelectedKeys={["single_elimination"]}
								onChange={(e) => {
									switch (e.target.value) {
										case "single_elimination":
											setValue("elimination_type", {
												single_elimination: { play_third_place_match: true },
											});
											break;
										case "double_elimination":
											setValue("elimination_type", "double_elimination");
											break;
									}
								}}
							>
								<SelectItem value="single_elimination" key="single_elimination">
									Single Elimination
								</SelectItem>
								<SelectItem value="double_elimination" key="double_elimination">
									Double Elimination
								</SelectItem>
							</Select>
							{typeof watchEliminationType === "object" &&
								"single_elimination" in watchEliminationType && (
									<Switch
										aria-label="Play 3rd place match"
										isDisabled={isSubmitting}
										defaultSelected={
											defaultValues &&
											typeof defaultValues.elimination_type === "object" &&
											"single_elimination" in defaultValues.elimination_type
												? defaultValues?.elimination_type?.single_elimination
														?.play_third_place_match ?? false
												: false
										}
										isSelected={watchPlaysThirdPlaceMatch}
										onValueChange={(value) =>
											setValue(
												"elimination_type.single_elimination.play_third_place_match",
												value,
											)
										}
									>
										Play 3rd Place Match
									</Switch>
								)}
							<Card>
								<CardHeader>Final Distribution</CardHeader>
								<CardBody className="space-y-4">
									<p>
										Define how the tournament's funds will be distributed after
										all matches are processed.
									</p>
									<Table aria-label="Distribution" removeWrapper>
										<TableHeader>
											<TableColumn>Place</TableColumn>
											<TableColumn>Percentage</TableColumn>
											<TableColumn>Action</TableColumn>
										</TableHeader>
										<TableBody>
											{fields?.map((percentage, i) => (
												<TableRow key={percentage.id}>
													<TableCell>
														{getNumberWithOrdinal(i + 1)} place
													</TableCell>
													<TableCell>
														<Controller
															control={control}
															name={`distribution.${i}.percentage`}
															render={({ field }) => (
																<Input
																	type="number"
																	min="0"
																	max="100"
																	step="1"
																	label="Percentage"
																	isDisabled={isSubmitting}
																	isInvalid={
																		!!errors.distribution?.[i]?.percentage
																	}
																	errorMessage={
																		errors.distribution?.[i]?.percentage
																			?.message
																	}
																	endContent={<BsPercent />}
																	classNames={{ input: "text-right" }}
																	{...field}
																	value={field.value?.toString()}
																	onChange={(e) =>
																		field.onChange(
																			Number.parseFloat(e.target.value),
																		)
																	}
																	className="min-w-32"
																/>
															)}
														/>
													</TableCell>
													<TableCell>
														<Button
															isIconOnly
															aria-label="Delete Percentage"
															variant="faded"
															onClick={() => remove(i)}
															isDisabled={isSubmitting}
														>
															<FiTrash />
														</Button>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
									<div className="text-danger text-xs">
										<p>{errors.distribution?.message}</p>
										<p>{errors.distribution?.root?.message}</p>
									</div>
									<Progress
										aria-label="Total Percentage"
										value={percentages.reduce(
											(acc, x) => acc + x.percentage,
											0,
										)}
										color="primary"
										showValueLabel
									/>
								</CardBody>
								<CardFooter>
									<Button
										onClick={() => append({ percentage: 0 })}
										aria-label="Add Percentage"
										startContent={<FiPlus />}
										isDisabled={isSubmitting}
									>
										Add Percentage
									</Button>
								</CardFooter>
							</Card>
						</>
					</CreateCompetitionForm>
					<div className="flex">
						<Button
							type="submit"
							isDisabled={!isWalletConnected}
							isLoading={isSubmitting}
							className="ml-auto"
						>
							Submit
						</Button>
					</div>
				</div>
			</form>
		</FormProvider>
	);
};

export default CreateTournament;
