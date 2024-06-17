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
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tooltip,
} from "@nextui-org/react";
import { addMonths } from "date-fns";
import { useRouter } from "next/navigation";
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
import { ArenaLeagueModuleClient } from "~/codegen/ArenaLeagueModule.client";
import {
	AddressSchema,
	CreateCompetitionSchema,
	DecimalSchema,
} from "~/config/schemas";
import Uint128Schema from "~/config/schemas/AmountSchema";
import {
	convertToEscrowInstantiate,
	convertToExpiration,
} from "~/helpers/SchemaHelpers";
import { getNumberWithOrdinal } from "~/helpers/UIHelpers";
import { useCategory } from "~/hooks/useCategory";
import { useEnv } from "~/hooks/useEnv";

const CreateLeagueSchema = CreateCompetitionSchema.extend({
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
	match_draw_points: Uint128Schema,
	match_lose_points: Uint128Schema,
	match_win_points: Uint128Schema,
});
type CreateLeagueFormValues = z.infer<typeof CreateLeagueSchema>;

const CreateLeague = () => {
	const { data: env } = useEnv();
	const { data: category } = useCategory();
	const { getSigningCosmWasmClient, address, isWalletConnected } = useChain(
		env.CHAIN,
	);
	const router = useRouter();
	const formMethods = useForm<CreateLeagueFormValues>({
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
			match_win_points: BigInt("3"),
			match_draw_points: BigInt("1"),
			match_lose_points: BigInt("0"),
		},
		resolver: zodResolver(CreateLeagueSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting, errors },
		control,
		watch,
	} = formMethods;

	const { fields, append, remove } = useFieldArray({
		control,
		name: "distribution",
	});

	const watchHost = watch("host");
	const percentages = watch("distribution");

	useEffect(() => {
		const value = formMethods.getValues("dues.0.addr");
		if (value === undefined && address) {
			formMethods.setValue("dues.0.addr", address);
		}
	}, [address, formMethods.getValues, formMethods.setValue]);

	const onSubmit = async (values: CreateLeagueFormValues) => {
		try {
			const cosmWasmClient = await getSigningCosmWasmClient();
			if (!address) throw "Could not get user address";

			const leagueModuleClient = new ArenaLeagueModuleClient(
				cosmWasmClient,
				address,
				env.ARENA_LEAGUE_MODULE_ADDRESS,
			);

			const msg = {
				categoryId: category?.category_id?.toString(),
				description: values.description,
				expiration: convertToExpiration(values.expiration),
				name: values.name,
				rules: values.rules.map((x) => x.rule),
				rulesets: values.rulesets.map((x) => x.ruleset_id.toString()),
				instantiateExtension: {
					distribution: values.distribution.map((x) => x.percentage.toString()),
					match_win_points: values.match_win_points.toString(),
					match_lose_points: values.match_lose_points.toString(),
					match_draw_points: values.match_draw_points.toString(),
					teams: values.membersFromDues
						? values.dues.map((x) => x.addr)
						: values.members.map((x) => x.address),
				},
				host: { existing: { addr: values.host } },
				escrow: convertToEscrowInstantiate(
					env.CODE_ID_ESCROW,
					values.dues,
					values.additionalLayeredFees,
				),
			};

			const result = await leagueModuleClient.createCompetition(msg);

			toast.success("The league was created");

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
					`/league/view?category=${category}&competitionId=${competitionId}`,
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
					<h1 className="title text-center text-5xl">Create a League</h1>
					{category && (
						<Tooltip content="Return to competitions">
							<Button
								isIconOnly
								as={Link}
								href={`/compete?category=${category.url}`}
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
						{watchHost && <Profile address={watchHost} />}
					</div>
					<CreateCompetitionForm>
						<>
							<Card>
								<CardHeader>Final Distribution</CardHeader>
								<CardBody className="space-y-4">
									<p>
										Define how the league's funds will be distributed after all
										matches are processed.
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
							<div className="grid grid-cols-12 gap-4">
								<Controller
									control={control}
									name="match_win_points"
									render={({ field }) => (
										<Input
											className="col-span-12 md:col-span-4"
											type="number"
											label="Points Per Win"
											isDisabled={isSubmitting}
											isInvalid={!!errors.match_win_points}
											errorMessage={errors.match_win_points?.message}
											{...field}
											value={field.value?.toString()}
											onChange={(e) => field.onChange(BigInt(e.target.value))}
										/>
									)}
								/>
								<Controller
									control={control}
									name="match_draw_points"
									render={({ field }) => (
										<Input
											className="col-span-12 md:col-span-4"
											type="number"
											label="Points Per Draw"
											isDisabled={isSubmitting}
											isInvalid={!!errors.match_draw_points}
											errorMessage={errors.match_draw_points?.message}
											{...field}
											value={field.value?.toString()}
											onChange={(e) => field.onChange(BigInt(e.target.value))}
										/>
									)}
								/>
								<Controller
									control={control}
									name="match_lose_points"
									render={({ field }) => (
										<Input
											className="col-span-12 md:col-span-4"
											type="number"
											label="Points Per Loss"
											isDisabled={isSubmitting}
											isInvalid={!!errors.match_lose_points}
											errorMessage={errors.match_lose_points?.message}
											{...field}
											value={field.value?.toString()}
											onChange={(e) => field.onChange(BigInt(e.target.value))}
										/>
									)}
								/>
							</div>
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

export default CreateLeague;
