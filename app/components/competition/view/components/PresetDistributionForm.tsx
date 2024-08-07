"use client";
import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
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
	useDisclosure,
} from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { BsPercent } from "react-icons/bs";
import { FiPlus, FiTrash } from "react-icons/fi";
import { toast } from "react-toastify";
import { z } from "zod";
import {
	ArenaEscrowClient,
	ArenaEscrowQueryClient,
} from "~/codegen/ArenaEscrow.client";
import {
	arenaEscrowQueryKeys,
	useArenaEscrowDistributionQuery,
	useArenaEscrowSetDistributionMutation,
} from "~/codegen/ArenaEscrow.react-query";
import type { NullableDistributionForString } from "~/codegen/ArenaEscrow.types";
import { DistributionSchema } from "~/config/schemas";
import { convertToDistribution } from "~/helpers/SchemaHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

type PresetDistributionFormProps = {
	escrow: string;
	isMutable: boolean;
};

const PresetDistributionFormSchema = z.object({
	distribution: DistributionSchema,
});

type PresetDistributionFormValues = z.infer<
	typeof PresetDistributionFormSchema
>;

const PresetDistributionForm = ({
	escrow,
	isMutable,
}: PresetDistributionFormProps) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const queryClient = useQueryClient();
	const setDistributionMutation = useArenaEscrowSetDistributionMutation();

	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const { data } = useArenaEscrowDistributionQuery({
		client:
			cosmWasmClient && new ArenaEscrowQueryClient(cosmWasmClient, escrow),
		args: { addr: address || "" },
		options: { enabled: !!address && isOpen && !!cosmWasmClient },
	});

	const {
		control,
		formState: { errors, isSubmitting },
		handleSubmit,
	} = useForm<PresetDistributionFormValues>({
		defaultValues: {
			distribution: {
				member_percentages: [],
			},
		},
		resolver: zodResolver(PresetDistributionFormSchema),
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

	const onSubmit = async (values: PresetDistributionFormValues) => {
		try {
			if (!address) throw "Could not get user address";

			const client = await getSigningCosmWasmClient();

			const escrowClient = new ArenaEscrowClient(client, address, escrow);
			const distribution = convertToDistribution(values.distribution);

			await setDistributionMutation.mutateAsync(
				{
					client: escrowClient,
					msg: { distribution },
				},
				{
					onSuccess(_, variables) {
						queryClient.setQueryData<NullableDistributionForString | undefined>(
							arenaEscrowQueryKeys.distribution(escrow, { addr: address }),
							() => {
								return variables.msg.distribution;
							},
						);
						toast.success("The preset distribution has been updated");
					},
				},
			);
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	if (!address) {
		return null;
	}

	return (
		<>
			<Button onClick={onOpen}>Preset Distribution</Button>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="5xl"
				scrollBehavior="outside"
			>
				<ModalContent>
					<ModalHeader>Preset Distribution</ModalHeader>
					<ModalBody className="space-y-4">
						<ModalBody className="space-y-4">
							<p>
								Establish a preset distribution for any incoming funds to this
								address. List the addresses and share percentages of all
								members, and provide an address for distributing any remaining
								funds. If no members are provided, then the preset distribution
								will be cleared out.
							</p>
							{data && (
								<Card>
									<CardHeader>
										<h2>Current Distribution</h2>
									</CardHeader>
									<CardBody className="space-y-2">
										<div className="flex items-center gap-2">
											<div className="font-semibold">Remainder Address:</div>
											<Profile address={data.remainder_addr} />
										</div>
										<Table aria-label="Distribution" removeWrapper>
											<TableHeader>
												<TableColumn>Member</TableColumn>
												<TableColumn>Percentage</TableColumn>
											</TableHeader>
											<TableBody>
												{data.member_percentages.map((item) => (
													<TableRow key={item.addr}>
														<TableCell>
															<Profile address={item.addr} />
														</TableCell>
														<TableCell>
															<Progress
																aria-label="Percentage"
																value={Number.parseFloat(item.percentage) * 100}
																color="primary"
																showValueLabel
															/>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</CardBody>
								</Card>
							)}
							<Card>
								<CardHeader>New Preset</CardHeader>
								<CardBody className="space-y-2">
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
													errorMessage={
														errors.distribution?.remainder_addr?.message
													}
													{...field}
												/>
											)}
										/>
									</div>
									<Table aria-label="Distribution" removeWrapper>
										<TableHeader>
											<TableColumn>Member</TableColumn>
											<TableColumn>Percentage</TableColumn>
											<TableColumn>Action</TableColumn>
										</TableHeader>
										<TableBody emptyContent="No distribution (clears current)">
											{fields?.map((memberPercentage, i) => (
												<TableRow
													key={memberPercentage.id}
													className="align-top"
												>
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
																			!!errors.distribution
																				?.member_percentages?.[i]?.addr
																		}
																		errorMessage={
																			errors.distribution?.member_percentages?.[
																				i
																			]?.addr?.message
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
																		!!errors.distribution?.member_percentages?.[
																			i
																		]?.percentage
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
										onClick={() => append({ addr: "", percentage: 0 })}
										aria-label="Add Recipient"
										startContent={<FiPlus />}
										isDisabled={isSubmitting}
									>
										Add Recipient
									</Button>
								</CardFooter>
							</Card>
						</ModalBody>
					</ModalBody>
					{isMutable && (
						<ModalFooter>
							<Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
								Submit
							</Button>
						</ModalFooter>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};

export default PresetDistributionForm;
