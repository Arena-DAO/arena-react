"use client";

import { useChain } from "@cosmos-kit/react";
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
	useDisclosure,
	useDraggable,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo } from "react";
import {
	type Control,
	Controller,
	useFieldArray,
	useForm,
	useWatch,
} from "react-hook-form";
import { FiInfo, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

import {
	arenaWagerModuleQueryKeys,
	useArenaWagerModuleStatTypesQuery,
	useArenaWagerModuleUpdateStatTypesMutation,
} from "~/codegen/ArenaWagerModule.react-query";

import { z } from "zod";
import {
	ArenaWagerModuleClient,
	ArenaWagerModuleQueryClient,
} from "~/codegen/ArenaWagerModule.client";

// Define the Zod schema for StatType
const StatTypeSchema = z.object({
	name: z.string().min(1, "Name is required"),
	value_type: z.enum(["uint", "decimal", "bool"]),
	is_beneficial: z.boolean(),
	aggregation_type: z.enum(["average", "cumulative"]).optional(),
	tie_breaker_priority: z.number().optional(),
});

const StatTypeRemoveSchema = z.object({
	name: z.string().min(1, "Name is required"),
});

// Define the schema for the entire form
const EditStatTypesSchema = z.object({
	toAdd: z.array(StatTypeSchema),
	toRemove: z.array(StatTypeRemoveSchema),
});

type EditStatTypesFormData = z.infer<typeof EditStatTypesSchema>;

interface EditStatTypesProps {
	moduleAddr: string;
	competitionId: string;
}

interface StatTypeRowProps {
	name: string;
	control: Control<EditStatTypesFormData>;
}

const StatTypeSwitch: React.FC<StatTypeRowProps> = ({ name, control }) => {
	const { append, remove } = useFieldArray({
		name: "toRemove",
		control,
	});

	const toRemove = useWatch({
		control,
		name: "toRemove",
	});

	const index = useMemo(
		() => toRemove.findIndex((x) => x.name === name),
		[name, toRemove, toRemove.findIndex],
	);
	const isSelected = useMemo(() => index > -1, [index]);

	const handleValueChange = () => {
		if (isSelected) {
			remove(index);
		} else {
			append({ name });
		}
	};

	return (
		<Switch isSelected={isSelected} onValueChange={handleValueChange}>
			Remove
		</Switch>
	);
};

const EditStatTypes: React.FC<EditStatTypesProps> = ({
	moduleAddr,
	competitionId,
}) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const queryClient = useQueryClient();

	const { isOpen, onOpen, onClose } = useDisclosure();

	const queryClientMemo = React.useMemo(() => {
		if (!cosmWasmClient) return undefined;
		return new ArenaWagerModuleQueryClient(cosmWasmClient, moduleAddr);
	}, [cosmWasmClient, moduleAddr]);

	const { data: statTypesData, isLoading: isLoadingStatTypes } =
		useArenaWagerModuleStatTypesQuery({
			client: queryClientMemo,
			args: { competitionId },
		});

	const statTypes = useMemo(() => {
		if (!statTypesData) return [];
		return [...statTypesData].sort((a, b) => {
			const priorityA = a.tie_breaker_priority ?? Number.MAX_SAFE_INTEGER;
			const priorityB = b.tie_breaker_priority ?? Number.MAX_SAFE_INTEGER;
			return priorityA - priorityB;
		});
	}, [statTypesData]);

	const updateStatTypesMutation = useArenaWagerModuleUpdateStatTypesMutation();

	const {
		control,
		handleSubmit,
		reset,
		formState: { isDirty },
	} = useForm<EditStatTypesFormData>({
		resolver: zodResolver(EditStatTypesSchema),
		defaultValues: {
			toAdd: [],
			toRemove: [],
		},
	});

	const {
		fields: addFields,
		append: appendAdd,
		remove: removeAdd,
	} = useFieldArray({
		control,
		name: "toAdd",
	});

	const onSubmit = async (data: EditStatTypesFormData) => {
		if (!address) {
			toast.error("Please connect your wallet");
			return;
		}

		try {
			const client = await getSigningCosmWasmClient();
			const moduleClient = new ArenaWagerModuleClient(
				client,
				address,
				moduleAddr,
			);

			await updateStatTypesMutation.mutateAsync(
				{
					client: moduleClient,
					msg: {
						competitionId,
						toAdd: data.toAdd,
						toRemove: data.toRemove.map((x) => x.name),
					},
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries(
							arenaWagerModuleQueryKeys.statTypes(moduleAddr, {
								competitionId,
							}),
						);
						toast.success("Stat types updated successfully");
						reset();
					},
				},
			);
		} catch (error) {
			console.error(error);
			toast.error((error as Error).toString());
		}
	};

	const targetRef = React.useRef(null);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

	return (
		<>
			<Button onPress={onOpen}>Edit Stat Types</Button>
			<Modal
				ref={targetRef}
				isOpen={isOpen}
				onClose={onClose}
				size="full"
				scrollBehavior="inside"
			>
				<form onSubmit={handleSubmit(onSubmit)}>
					<ModalContent>
						{(onClose) => (
							<>
								<ModalHeader {...moveProps}>
									<h2 className="font-semibold text-xl">Edit Stat Types</h2>
								</ModalHeader>
								<ModalBody>
									<Card className="min-h-60">
										<CardHeader>
											<h3>Existing Stat Types</h3>
										</CardHeader>
										<CardBody>
											<Table aria-label="Existing Stat Types" removeWrapper>
												<TableHeader>
													<TableColumn>Name</TableColumn>
													<TableColumn>Value Type</TableColumn>
													<TableColumn>Aggregation Type</TableColumn>
													<TableColumn>Tie Breaker Priority</TableColumn>
													<TableColumn>Is Beneficial</TableColumn>
													<TableColumn>Actions</TableColumn>
												</TableHeader>
												<TableBody
													isLoading={isLoadingStatTypes}
													items={statTypes}
													emptyContent="No stat types configured"
												>
													{(statType) => (
														<TableRow key={statType.name}>
															<TableCell>{statType.name}</TableCell>
															<TableCell>{statType.value_type}</TableCell>
															<TableCell>{statType.aggregation_type}</TableCell>
															<TableCell>
																{statType.tie_breaker_priority}
															</TableCell>
															<TableCell>
																{statType.is_beneficial ? "Yes" : "No"}
															</TableCell>
															<TableCell>
																<StatTypeSwitch
																	name={statType.name}
																	control={control}
																/>
															</TableCell>
														</TableRow>
													)}
												</TableBody>
											</Table>
										</CardBody>
									</Card>

									<Card>
										<CardHeader>
											<h3>Add New Stat Types</h3>
										</CardHeader>
										<CardBody className="gap-4">
											{addFields.map((field, index) => (
												<div key={field.id}>
													<div className="mb-2 flex items-center justify-between">
														<h4>New Stat Type #{index + 1}</h4>
														<Button
															isIconOnly
															color="danger"
															variant="light"
															onPress={() => removeAdd(index)}
														>
															<FiTrash2 />
														</Button>
													</div>
													<div className="grid grid-cols-4 gap-4">
														<Controller
															name={`toAdd.${index}.name`}
															control={control}
															render={({ field, fieldState: { error } }) => (
																<Input
																	{...field}
																	label="Name"
																	placeholder="Enter stat name"
																	errorMessage={error?.message}
																	isInvalid={!!error}
																	isRequired
																	className="col-span-4 sm:col-span-2"
																/>
															)}
														/>
														<Controller
															name={`toAdd.${index}.value_type`}
															control={control}
															render={({ field, fieldState: { error } }) => (
																<Select
																	{...field}
																	label="Value Type"
																	isRequired
																	placeholder="Select value type"
																	errorMessage={error?.message}
																	isInvalid={!!error}
																	className="col-span-4 sm:col-span-2"
																>
																	<SelectItem key="uint" value="uint">
																		Uint
																	</SelectItem>
																	<SelectItem key="decimal" value="decimal">
																		Decimal
																	</SelectItem>
																	<SelectItem key="bool" value="bool">
																		Boolean
																	</SelectItem>
																</Select>
															)}
														/>
														<Controller
															name={`toAdd.${index}.aggregation_type`}
															control={control}
															render={({ field, fieldState: { error } }) => (
																<Select
																	{...field}
																	label="Aggregation Type"
																	placeholder="Select aggregation type"
																	errorMessage={error?.message}
																	isInvalid={!!error}
																	className="col-span-4 sm:col-span-1"
																>
																	<SelectItem key="average" value="average">
																		Average
																	</SelectItem>
																	<SelectItem
																		key="cumulative"
																		value="cumulative"
																	>
																		Cumulative
																	</SelectItem>
																</Select>
															)}
														/>
														<Controller
															name={`toAdd.${index}.tie_breaker_priority`}
															control={control}
															render={({ field, fieldState: { error } }) => (
																<Input
																	{...field}
																	type="number"
																	label="Tie Breaker Priority"
																	placeholder="Enter tie breaker priority"
																	value={field.value?.toString() || ""}
																	onChange={(e) =>
																		field.onChange(
																			Number.isNaN(e.target.valueAsNumber)
																				? undefined
																				: e.target.valueAsNumber,
																		)
																	}
																	errorMessage={error?.message}
																	isInvalid={!!error}
																	className="col-span-4 sm:col-span-1"
																/>
															)}
														/>
														<Controller
															name={`toAdd.${index}.is_beneficial`}
															control={control}
															render={({ field }) => (
																<div className="col-span-4 flex items-center sm:col-span-2">
																	<Switch
																		{...field}
																		value={field?.value?.toString()}
																		isSelected={field.value}
																		onValueChange={field.onChange}
																	>
																		<div className="flex items-center">
																			Is Beneficial
																			<Tooltip content="Indicates if a higher value is better">
																				<span className="ml-2 cursor-help">
																					<FiInfo />
																				</span>
																			</Tooltip>
																		</div>
																	</Switch>
																</div>
															)}
														/>
													</div>
												</div>
											))}
											<CardFooter className="min-h-12">
												<Button
													color="primary"
													variant="light"
													startContent={<FiPlus />}
													onPress={() =>
														appendAdd({
															name: "",
															value_type: "uint",
															is_beneficial: true,
														})
													}
												>
													Add New Stat Type
												</Button>
											</CardFooter>
										</CardBody>
									</Card>
								</ModalBody>
								<ModalFooter>
									<Button color="danger" variant="light" onPress={onClose}>
										Cancel
									</Button>
									<Button
										color="primary"
										type="submit"
										isLoading={updateStatTypesMutation.isLoading}
										isDisabled={!isDirty}
									>
										Update Stat Types
									</Button>
								</ModalFooter>
							</>
						)}
					</ModalContent>
				</form>
			</Modal>
		</>
	);
};

export default EditStatTypes;
