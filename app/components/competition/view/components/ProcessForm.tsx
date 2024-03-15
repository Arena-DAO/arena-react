"use client";

import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Input,
	Link,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Textarea,
	useDisclosure,
} from "@nextui-org/react";
import type { Dispatch, SetStateAction } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FiExternalLink, FiPlus, FiTrash } from "react-icons/fi";
import { toast } from "react-toastify";
import { ZodIssueCode, z } from "zod";
import { ArenaWagerModuleClient } from "~/codegen/ArenaWagerModule.client";
import type { CompetitionStatus } from "~/codegen/ArenaWagerModule.types";
import { AddressSchema, DistributionSchema } from "~/config/schemas";
import { isValidContractAddress } from "~/helpers/AddressHelpers";
import { keyboardDelegateFixSpace } from "~/helpers/NextUIHelpers";
import { useEnv } from "~/hooks/useEnv";

type ProcessFormProps = {
	competitionId: string;
	moduleAddr: string;
} & (
	| { host: string }
	| {
			is_expired: true;
			setCompetitionStatus: Dispatch<SetStateAction<CompetitionStatus>>;
	  }
);

const ProcessForm = ({
	moduleAddr,
	competitionId,
	...props
}: ProcessFormProps) => {
	const ProcessFormSchema = z
		.object({
			distribution: DistributionSchema,
			remainderAddr: AddressSchema,
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

	const { data: env } = useEnv();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
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
		},
	});
	const { fields, append, remove } = useFieldArray({
		control,
		name: "distribution",
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
			const distribution = values.distribution.map(({ addr, percentage }) => {
				return { addr, percentage: percentage.toString() };
			});

			if ("is_expired" in props) {
				await competitionClient.jailCompetition({
					proposeMessage: {
						id: competitionId,
						distribution,
						remainder_addr: values.remainderAddr,
						title: values.title,
						description: values.description,
					},
				});

				toast.success("The competition has been jailed");
				props.setCompetitionStatus("jailed");
			} else {
				await competitionClient.processCompetition({
					competitionId,
					distribution,
					remainderAddr: values.remainderAddr,
				});

				toast.success("The competition has been processed successfully");
			}
			// biome-ignore lint/suspicious/noExplicitAny: try-catch
		} catch (e: any) {
			console.error(e);
			toast.error(e.toString());
		}
	};
	const tryOpen = () => {
		if ("is_expired" in props) {
			onOpen();
		} else {
			if (address === props.host) {
				onOpen();
			} else {
				toast.info(
					<div className="flex space-between">
						<div>Processing must happen through the host</div>
						{isValidContractAddress(props.host) && (
							<Button
								as={Link}
								href={`${env.DAO_DAO_URL}/dao/${
									props.host
								}/apps?url=${encodeURIComponent(window.location.href)}`}
								isExternal
								isIconOnly
								aria-label="Handle on DAO DAO"
							>
								<FiExternalLink />
							</Button>
						)}
					</div>,
				);
			}
		}
	};

	if (!address) {
		return null;
	}

	const action = "is_expired" in props ? "Jail" : "Process";
	return (
		<>
			<Button onClick={tryOpen}>{action}</Button>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
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
						<Controller
							control={control}
							name="remainderAddr"
							render={({ field }) => (
								<Input
									label="Remainder Address"
									autoFocus
									isDisabled={isSubmitting}
									isInvalid={!!errors.remainderAddr}
									errorMessage={errors.remainderAddr?.message}
									{...field}
								/>
							)}
						/>
						<div>
							<Table
								aria-label="Distribution"
								keyboardDelegate={keyboardDelegateFixSpace}
							>
								<TableHeader>
									<TableColumn>Member</TableColumn>
									<TableColumn>Percentage</TableColumn>
									<TableColumn>Action</TableColumn>
								</TableHeader>
								<TableBody emptyContent="No distribution given">
									{fields?.map((memberPercentage, i) => (
										<TableRow key={memberPercentage.id}>
											<TableCell>
												<Controller
													control={control}
													name={`distribution.${i}.addr`}
													render={({ field }) => (
														<Input
															label={`Member ${i + 1}`}
															isDisabled={isSubmitting}
															isInvalid={!!errors.distribution?.[i]?.addr}
															errorMessage={
																errors.distribution?.[i]?.addr?.message
															}
															{...field}
														/>
													)}
												/>
											</TableCell>
											<TableCell>
												<Controller
													control={control}
													name={`distribution.${i}.percentage`}
													render={({ field }) => (
														<Input
															type="number"
															min="0"
															max="1"
															step=".01"
															label="Percentage"
															isDisabled={isSubmitting}
															isInvalid={!!errors.distribution?.[i]?.percentage}
															errorMessage={
																errors.distribution?.[i]?.percentage?.message
															}
															{...field}
															value={field.value?.toString()}
															onChange={(e) =>
																field.onChange(
																	Number.parseFloat(e.target.value),
																)
															}
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
								<p>{errors.distribution?.root?.message}</p>
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							onClick={() => append({ addr: "", percentage: 0 })}
							aria-label="Add Recipient"
							startContent={<FiPlus />}
							isDisabled={isSubmitting}
						>
							Add Recipient
						</Button>
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
