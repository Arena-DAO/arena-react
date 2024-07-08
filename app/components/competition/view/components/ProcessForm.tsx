"use client";

import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Progress,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Textarea,
	useDisclosure,
} from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import type {} from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { BsPercent } from "react-icons/bs";
import { FiPlus, FiTrash } from "react-icons/fi";
import { toast } from "react-toastify";
import { ZodIssueCode, z } from "zod";
import { ArenaCoreQueryClient } from "~/codegen/ArenaCore.client";
import { arenaCoreQueryKeys } from "~/codegen/ArenaCore.react-query";
import { arenaEscrowQueryKeys } from "~/codegen/ArenaEscrow.react-query";
import { ArenaWagerModuleClient } from "~/codegen/ArenaWagerModule.client";
import {
	useArenaWagerModuleJailCompetitionMutation,
	useArenaWagerModuleProcessCompetitionMutation,
} from "~/codegen/ArenaWagerModule.react-query";
import { DistributionSchema } from "~/config/schemas";
import { useCategoryContext } from "~/contexts/CategoryContext";
import { getCompetitionQueryKey } from "~/helpers/CompetitionHelpers";
import { convertToDistribution } from "~/helpers/SchemaHelpers";
import { useEnv } from "~/hooks/useEnv";
import type { CompetitionResponse } from "~/types/CompetitionResponse";
import type { CompetitionType } from "~/types/CompetitionType";

type ProcessFormProps = {
	competitionType: CompetitionType;
	competitionId: string;
	moduleAddr: string;
} & (
	| {
			host: string;
			escrow?: string | null;
	  }
	| {
			is_expired: true;
	  }
);

const ProcessForm = ({
	competitionType,
	moduleAddr,
	competitionId,
	...props
}: ProcessFormProps) => {
	const ProcessFormSchema = z
		.object({
			distribution: DistributionSchema,
			title: z.string(),
			description: z.string(),
		})
		.superRefine((val, ctx) => {
			if ("is_expired" in props) {
				if (!val.title) {
					ctx.addIssue({
						code: ZodIssueCode.custom,
						path: ["title"],
						message: "Title is required",
					});
				}
				if (!val.description) {
					ctx.addIssue({
						code: ZodIssueCode.custom,
						path: ["description"],
						message: "Description is required",
					});
				}
			}
		});

	type ProcessFormValues = z.infer<typeof ProcessFormSchema>;

	const queryClient = useQueryClient();
	const { data: env } = useEnv();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const category = useCategoryContext();

	const processMutation = useArenaWagerModuleProcessCompetitionMutation();
	const jailMutation = useArenaWagerModuleJailCompetitionMutation();

	const {
		control,
		formState: { errors, isSubmitting },
		handleSubmit,
	} = useForm<ProcessFormValues>({
		resolver: zodResolver(ProcessFormSchema),
		defaultValues: {
			title: `Jailed Competition - ${competitionId}`,
			description:
				"The competition has expired, and the Arena DAO should determine if this result is correct.",
			distribution: {
				member_percentages: [],
			},
		},
	});
	const { fields, append, remove } = useFieldArray({
		control,
		name: "distribution.member_percentages",
	});
	const percentages = useWatch({
		control,
		name: "distribution.member_percentages",
	});
	const remainderAddr = useWatch({
		control,
		name: "distribution.remainder_addr",
	});

	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const onSubmit = async (values: ProcessFormValues) => {
		try {
			if (!address) throw "Could not get user address";

			const client = await getSigningCosmWasmClient();

			const competitionClient = new ArenaWagerModuleClient(
				client,
				address,
				moduleAddr,
			);

			const distribution = convertToDistribution(values.distribution);

			if ("is_expired" in props) {
				const arenaCoreClient = new ArenaCoreQueryClient(
					client,
					env.ARENA_CORE_ADDRESS,
				);

				// Should cache this locally
				const config = await arenaCoreClient.config();

				await jailMutation.mutateAsync(
					{
						client: competitionClient,
						msg: {
							competitionId,
							distribution,
							title: values.title,
							description: values.description,
						},
						args: {
							funds:
								config.deposit_info && "native" in config.deposit_info.denom
									? [
											{
												denom: config.deposit_info.denom.native,
												amount: config.deposit_info.amount,
											},
										]
									: undefined,
						},
					},
					{
						onSuccess: () => {
							toast.success("The competition has been jailed");

							queryClient.setQueryData<CompetitionResponse | undefined>(
								getCompetitionQueryKey(env, competitionType, competitionId),
								(old) => {
									if (old) {
										return { ...old, status: "jailed" };
									}
									return old;
								},
							);
						},
					},
				);
			} else {
				await processMutation.mutateAsync(
					{
						client: competitionClient,
						msg: {
							competitionId,
							distribution,
						},
					},
					{
						onSuccess: async (response) => {
							toast.success("The competition has been processed successfully");

							queryClient.setQueryData<CompetitionResponse | undefined>(
								getCompetitionQueryKey(env, competitionType, competitionId),
								(old) => {
									if (old) {
										return { ...old, status: "inactive" };
									}
									return old;
								},
							);

							if ("escrow" in props && props.escrow) {
								await queryClient.invalidateQueries(
									arenaEscrowQueryKeys.dumpState(props.escrow),
								);
								await queryClient.invalidateQueries(
									arenaEscrowQueryKeys.balances(props.escrow),
								);
							}

							if (category?.category_id) {
								const ratingAdjustmentsEvent = response.events.find((event) =>
									event.attributes.find(
										(attr) =>
											attr.key === "action" && attr.value === "adjust_ratings",
									),
								);
								if (ratingAdjustmentsEvent) {
									for (const attr of ratingAdjustmentsEvent.attributes) {
										if (attr.key === "action") continue;

										queryClient.setQueryData<string | undefined>(
											arenaCoreQueryKeys.queryExtension(
												env.ARENA_CORE_ADDRESS,
												{
													msg: {
														rating: {
															addr: attr.key,
															category_id: category.category_id.toString(),
														},
													},
												},
											),
											() => attr.value,
										);
									}
								}
							}
						},
					},
				);
			}
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};
	const tryOpen = () => {
		if ("is_expired" in props) {
			onOpen();
		} else {
			if (address === props.host) {
				onOpen();
			} else {
				toast.info("Only the host can process the competition");
			}
		}
	};

	const action = "is_expired" in props ? "Jail" : "Process";
	return (
		<>
			<Button onClick={tryOpen}>{action}</Button>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="5xl"
				scrollBehavior="outside"
			>
				<ModalContent>
					<ModalHeader>{action} Competition</ModalHeader>
					<ModalBody className="space-y-4">
						{"is_expired" in props && (
							<>
								<Controller
									control={control}
									name="title"
									render={({ field }) => (
										<Input
											label="Proposal Title"
											autoFocus
											isDisabled={isSubmitting}
											isInvalid={!!errors.title}
											errorMessage={errors.title?.message}
											{...field}
										/>
									)}
								/>
								<Controller
									control={control}
									name="description"
									render={({ field }) => (
										<Textarea
											label="Proposal Description"
											isDisabled={isSubmitting}
											isInvalid={!!errors.description}
											errorMessage={errors.description?.message}
											{...field}
										/>
									)}
								/>
							</>
						)}
						<p>
							List the addresses and share percentages of all members, and
							provide an address for receiving any remaining funds. If no
							members are provided, then funds will be refunded.
						</p>
						<div className="flex items-center space-x-2">
							{remainderAddr && (
								<Profile
									address={remainderAddr}
									justAvatar
									className="min-w-max"
								/>
							)}
							<Controller
								control={control}
								name="distribution.remainder_addr"
								render={({ field }) => (
									<Input
										label="Remainder Address"
										autoFocus
										isDisabled={isSubmitting}
										isInvalid={!!errors.distribution?.remainder_addr}
										errorMessage={errors.distribution?.remainder_addr?.message}
										{...field}
									/>
								)}
							/>
						</div>
						<Card>
							<CardBody>
								<Table aria-label="Distribution" removeWrapper>
									<TableHeader>
										<TableColumn>Member</TableColumn>
										<TableColumn>Percentage</TableColumn>
										<TableColumn>Action</TableColumn>
									</TableHeader>
									<TableBody emptyContent="No distribution (draw)">
										{fields?.map((memberPercentage, i) => (
											<TableRow key={memberPercentage.id} className="align-top">
												<TableCell>
													<div className="flex items-center space-x-2">
														{percentages[i] && (
															<Profile
																address={percentages[i]?.addr}
																justAvatar
																className="min-w-max"
															/>
														)}
														<Controller
															control={control}
															name={`distribution.member_percentages.${i}.addr`}
															render={({ field }) => (
																<Input
																	label={`Member ${i + 1}`}
																	isDisabled={isSubmitting}
																	isInvalid={
																		!!errors.distribution?.member_percentages?.[
																			i
																		]?.addr
																	}
																	errorMessage={
																		errors.distribution?.member_percentages?.[i]
																			?.addr?.message
																	}
																	{...field}
																	className="min-w-80"
																/>
															)}
														/>
													</div>
												</TableCell>
												<TableCell className="align-top">
													<Controller
														control={control}
														name={`distribution.member_percentages.${i}.percentage`}
														render={({ field }) => (
															<Input
																type="number"
																min="0"
																max="100"
																step="1"
																label="Percentage"
																isDisabled={isSubmitting}
																isInvalid={
																	!!errors.distribution?.member_percentages?.[i]
																		?.percentage
																}
																errorMessage={
																	errors.distribution?.member_percentages?.[i]
																		?.percentage?.message
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
																className="min-w-32 max-w-40"
															/>
														)}
													/>
												</TableCell>
												<TableCell className="align-top">
													<Button
														isIconOnly
														aria-label="Delete Recipient"
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
									<p>{errors.distribution?.member_percentages?.message}</p>
									<p>
										{errors.distribution?.member_percentages?.root?.message}
									</p>
								</div>
							</CardBody>
							<CardFooter>
								<Button
									onClick={() => append({ addr: "", percentage: 0 })}
									aria-label="Add Recipient"
									startContent={<FiPlus />}
									isDisabled={isSubmitting}
								>
									Add Recipient
								</Button>
							</CardFooter>
						</Card>
						<Progress
							aria-label="Total Percentage"
							value={percentages.reduce((acc, x) => acc + x.percentage, 0)}
							color="primary"
							showValueLabel
						/>
					</ModalBody>
					<ModalFooter>
						<Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
							Submit
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default ProcessForm;
