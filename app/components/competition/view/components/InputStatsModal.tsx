"use client";

import React, { useMemo } from "react";
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
	Switch,
	useDisclosure,
} from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import {
	Controller,
	useForm,
	type ControllerRenderProps,
	type FieldError,
} from "react-hook-form";
import { BsPercent } from "react-icons/bs";
import { toast } from "react-toastify";
import { z } from "zod";
import {
	ArenaWagerModuleClient,
	ArenaWagerModuleQueryClient,
} from "~/codegen/ArenaWagerModule.client";
import {
	arenaWagerModuleQueryKeys,
	useArenaWagerModuleInputStatsMutation,
	useArenaWagerModuleStatTypesQuery,
} from "~/codegen/ArenaWagerModule.react-query";
import type { StatType, StatValue } from "~/codegen/ArenaWagerModule.types";
import { DecimalSchema } from "~/config/schemas";
import Uint128Schema from "~/config/schemas/AmountSchema";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import Profile from "@/components/Profile";

// Define prop types for FormField
interface FormFieldProps {
	statType: StatType;
	// biome-ignore lint/suspicious/noExplicitAny: Dynamic form
	field: ControllerRenderProps<any, string>;
	error: FieldError | undefined;
}

// Memoized FormField component with prop types
const FormField: React.FC<FormFieldProps> = React.memo(
	({ statType, field, error }) => {
		switch (statType.value_type) {
			case "bool":
				return (
					<Switch
						{...field}
						placeholder={`Select ${statType.name}`}
						isSelected={field.value}
						onValueChange={field.onChange}
						defaultSelected={false}
					>
						{statType.name}
					</Switch>
				);
			case "decimal":
				return (
					<Input
						{...field}
						type="number"
						value={field.value?.toString() || ""}
						onChange={(e) => field.onChange(e.target.valueAsNumber)}
						label={statType.name}
						placeholder={`Enter ${statType.name}`}
						errorMessage={error?.message}
						isInvalid={!!error}
						endContent={<BsPercent />}
					/>
				);
			case "uint":
				return (
					<Input
						{...field}
						type="number"
						value={field.value?.toString() || ""}
						onChange={(e) => field.onChange(BigInt(e.target.value))}
						label={statType.name}
						placeholder={`Enter ${statType.name}`}
						errorMessage={error?.message}
						isInvalid={!!error}
					/>
				);
			default:
				return null;
		}
	},
);

interface InputStatsModalProps {
	moduleAddr: string;
	competitionId: string;
}

const InputStatsModal: React.FC<InputStatsModalProps> = ({
	moduleAddr,
	competitionId,
}) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const queryClient = useQueryClient();

	const {
		data: statTypes,
		isLoading: isLoadingStatTypes,
		error,
	} = useArenaWagerModuleStatTypesQuery({
		client:
			cosmWasmClient &&
			new ArenaWagerModuleQueryClient(cosmWasmClient, moduleAddr),
		args: { competitionId },
		options: {
			enabled: !!cosmWasmClient,
			staleTime: Number.POSITIVE_INFINITY,
		},
	});

	const inputStatsMutation = useArenaWagerModuleInputStatsMutation();

	// Memoized schema generation
	const schema = useMemo(() => {
		const generateSchema = (statTypes: StatType[]) => {
			const schemaObject: Record<string, z.ZodTypeAny> = {
				addr: z.string().min(1, "Address is required"),
			};

			for (const statType of statTypes) {
				switch (statType.value_type) {
					case "bool":
						schemaObject[statType.name] = z.boolean().optional();
						break;
					case "decimal":
						schemaObject[statType.name] = DecimalSchema;
						break;
					case "uint":
						schemaObject[statType.name] = Uint128Schema;
						break;
				}
			}

			return z.object(schemaObject);
		};

		return statTypes ? generateSchema(statTypes) : z.object({});
	}, [statTypes]);

	const { control, handleSubmit, reset, watch } = useForm({
		resolver: zodResolver(schema),
	});

	const addr = watch("addr");

	// biome-ignore lint/suspicious/noExplicitAny: Dynamic form
	const onSubmit = async (data: any) => {
		try {
			if (!address) throw new Error("Wallet not connected");
			if (!statTypes) throw new Error("Stat types not found");

			const stats = statTypes.map((statType) => ({
				name: statType.name,
				value: {
					[statType.value_type]:
						statType.value_type === "bool"
							? (data[statType.name] ?? false)
							: statType.value_type === "decimal"
								? data[statType.name].toString()
								: statType.value_type === "uint"
									? data[statType.name].toString()
									: null,
				} as StatValue,
			}));

			const signingClient = await getSigningCosmWasmClient();
			await inputStatsMutation.mutateAsync(
				{
					client: new ArenaWagerModuleClient(
						signingClient,
						address,
						moduleAddr,
					),
					msg: {
						competitionId,
						stats: [{ addr: data.addr, stats }],
					},
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries(
							arenaWagerModuleQueryKeys.statsTable(moduleAddr, {
								competitionId,
							}),
						);
						queryClient.invalidateQueries(
							arenaWagerModuleQueryKeys.historicalStats(moduleAddr, {
								addr: data.addr,
								competitionId,
							}),
						);
						toast.success("Stats submitted successfully");
						reset();
						onClose();
					},
				},
			);
		} catch (error) {
			console.error(error);
			toast.error((error as Error).toString());
		}
	};

	// Memoized form fields
	const formFields = useMemo(
		() =>
			statTypes?.map((statType) => (
				<Controller
					key={statType.name}
					name={statType.name}
					control={control}
					render={({ field, fieldState: { error } }) => (
						<FormField statType={statType} field={field} error={error} />
					)}
				/>
			)),
		[statTypes, control],
	);

	return (
		<>
			<Button
				onPress={onOpen}
				isDisabled={!statTypes || statTypes.length === 0 || !!error}
				isLoading={isLoadingStatTypes}
			>
				Input Stats
			</Button>
			<Modal isOpen={isOpen} onClose={onClose}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<ModalContent>
						{(onClose) => (
							<>
								<ModalHeader className="flex flex-col gap-1">
									Input Stats
								</ModalHeader>
								<ModalBody>
									<div className="flex items-center space-x-2">
										<Profile
											address={addr}
											justAvatar
											className="min-w-max"
											hideIfInvalid
										/>
										<Controller
											name="addr"
											control={control}
											render={({ field, fieldState: { error } }) => (
												<Input
													{...field}
													label="Address"
													placeholder="Enter address"
													errorMessage={error?.message}
													isInvalid={!!error}
												/>
											)}
										/>
									</div>
									{formFields}
								</ModalBody>
								<ModalFooter>
									<Button color="danger" variant="light" onPress={onClose}>
										Close
									</Button>
									<Button
										color="primary"
										type="submit"
										isLoading={inputStatsMutation.isLoading}
									>
										Submit
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

export default InputStatsModal;
