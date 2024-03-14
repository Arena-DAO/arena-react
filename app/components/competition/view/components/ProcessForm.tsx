"use client";

import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Input,
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
	useDisclosure,
} from "@nextui-org/react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FiPlus, FiTrash } from "react-icons/fi";
import { toast } from "react-toastify";
import { z } from "zod";
import { ArenaWagerModuleClient } from "~/codegen/ArenaWagerModule.client";
import { AddressSchema, DistributionSchema } from "~/config/schemas";
import { keyboardDelegateFixSpace } from "~/helpers/NextUIHelpers";
import { useEnv } from "~/hooks/useEnv";

interface ProcessFormProps {
	competitionId: string;
}

const ProcessFormSchema = z.object({
	distribution: DistributionSchema,
	remainderAddr: AddressSchema,
});

type ProcessFormValues = z.infer<typeof ProcessFormSchema>;

const ProcessForm = ({ competitionId }: ProcessFormProps) => {
	const { data: env } = useEnv();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const {
		control,
		formState: { errors, isSubmitting },
		handleSubmit,
	} = useForm<ProcessFormValues>({ resolver: zodResolver(ProcessFormSchema) });
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
				env.ARENA_WAGER_MODULE_ADDRESS,
			);

			const response = await competitionClient.processCompetition({
				competitionId,
				distribution: values.distribution.map(({ addr, percentage }) => {
					return { addr, percentage: percentage.toString() };
				}),
				remainderAddr: values.remainderAddr,
			});
			console.log(response);

			toast.success("The competition has been processed successfully");
			// biome-ignore lint/suspicious/noExplicitAny: try-catch
		} catch (e: any) {
			console.error(e);
			toast.error(e.toString());
		}
	};

	return (
		<>
			<Button onClick={onOpen}>Process</Button>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
				<ModalContent>
					<ModalHeader>Process Competition</ModalHeader>
					<ModalBody className="space-y-4">
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
												>
													<FiTrash />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							<div className="text-danger">
								{errors.distribution?.message}{" "}
								{errors.distribution?.root?.message}
							</div>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							onClick={() => append({ addr: "", percentage: 0 })}
							aria-label="Add Recipient"
							startContent={<FiPlus />}
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
