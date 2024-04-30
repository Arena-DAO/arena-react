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
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { BsPercent } from "react-icons/bs";
import { FiPlus, FiTrash } from "react-icons/fi";
import { toast } from "react-toastify";
import { z } from "zod";
import {
	ArenaEscrowClient,
	ArenaEscrowQueryClient,
} from "~/codegen/ArenaEscrow.client";
import { useArenaEscrowDistributionQuery } from "~/codegen/ArenaEscrow.react-query";
import { DistributionSchema } from "~/config/schemas";
import { keyboardDelegateFixSpace } from "~/helpers/NextUIHelpers";
import { convertToDistribution } from "~/helpers/SchemaHelpers";
import { useEnv } from "~/hooks/useEnv";
import type { WithClient } from "~/types/util";

type PresetDistributionFormProps = {
	escrow: string;
};

const ProcessFormSchema = z.object({
	distribution: DistributionSchema,
});

type ProcessFormValues = z.infer<typeof ProcessFormSchema>;

const PresetDistributionForm = ({
	escrow,
	cosmWasmClient,
}: WithClient<PresetDistributionFormProps>) => {
	const { data: env } = useEnv();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);

	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const { data, refetch } = useArenaEscrowDistributionQuery({
		client: new ArenaEscrowQueryClient(cosmWasmClient, escrow),
		// biome-ignore lint/style/noNonNullAssertion: enabled flag is checking this
		args: { addr: address! },
		options: { enabled: !!address && isOpen },
	});

	const {
		control,
		formState: { errors, isSubmitting },
		handleSubmit,
		watch,
	} = useForm<ProcessFormValues>({
		defaultValues: {
			distribution: {
				member_percentages: [],
			},
		},
		resolver: zodResolver(ProcessFormSchema),
	});
	const { fields, append, remove } = useFieldArray({
		control,
		name: "distribution.member_percentages",
	});
	const percentages = watch("distribution.member_percentages");

	const onSubmit = async (values: ProcessFormValues) => {
		try {
			if (!address) throw "Could not get user address";

			const client = await getSigningCosmWasmClient();

			const escrowClient = new ArenaEscrowClient(client, address, escrow);
			const distribution = convertToDistribution(values.distribution);

			await escrowClient.setDistribution({ distribution });

			toast.success("The preset distribution has been updated");
			refetch();
			// biome-ignore lint/suspicious/noExplicitAny: try-catch
		} catch (e: any) {
			console.error(e);
			toast.error(e.toString());
		}
	};

	if (!address) {
		return null;
	}

	return (
		<>
			<Button onClick={onOpen}>Set Preset</Button>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="5xl"
				scrollBehavior="outside"
			>
				<ModalContent>
					<ModalHeader>Set Preset Distribution</ModalHeader>
					<ModalBody className="space-y-4">
						<p>
							Establish a preset distribution. List the addresses and share
							percentages of all members, and provide an address for
							distributing any remaining funds. If no members are provided, then
							the preset distribution will be cleared out.
						</p>
						{data && (
							<Card>
								<CardHeader>Current Preset Distribution</CardHeader>
								<CardBody className="space-y-4">
									<Input
										label="Remainder Address"
										value={data.remainder_addr}
										readOnly
									/>
									<Table aria-label="Distribution" removeWrapper>
										<TableHeader>
											<TableColumn>Member</TableColumn>
											<TableColumn>Percentage</TableColumn>
										</TableHeader>
										<TableBody>
											{data.member_percentages.map((item) => (
												<TableRow key={item.addr}>
													<TableCell>
														<Profile
															cosmWasmClient={cosmWasmClient}
															address={item.addr}
														/>
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
						<Card>
							<CardBody>
								<Table
									aria-label="Distribution"
									keyboardDelegate={keyboardDelegateFixSpace}
									removeWrapper
								>
									<TableHeader>
										<TableColumn>Member</TableColumn>
										<TableColumn>Percentage</TableColumn>
										<TableColumn>Action</TableColumn>
									</TableHeader>
									<TableBody emptyContent="No distribution (clears current)">
										{fields?.map((memberPercentage, i) => (
											<TableRow key={memberPercentage.id}>
												<TableCell>
													<Controller
														control={control}
														name={`distribution.member_percentages.${i}.addr`}
														render={({ field }) => (
															<Input
																label={`Member ${i + 1}`}
																isDisabled={isSubmitting}
																isInvalid={
																	!!errors.distribution?.member_percentages?.[i]
																		?.addr
																}
																errorMessage={
																	errors.distribution?.member_percentages?.[i]
																		?.addr?.message
																}
																{...field}
																className="min-w-[350px]"
															/>
														)}
													/>
												</TableCell>
												<TableCell>
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
																className="min-w-32"
															/>
														)}
													/>
												</TableCell>
												<TableCell>
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
									className="mt-4"
									aria-label="Total Percentage"
									value={percentages.reduce((acc, x) => acc + x.percentage, 0)}
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
					<ModalFooter>
						<Button
							onClick={handleSubmit(onSubmit, console.error)}
							isLoading={isSubmitting}
						>
							Submit
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default PresetDistributionForm;
