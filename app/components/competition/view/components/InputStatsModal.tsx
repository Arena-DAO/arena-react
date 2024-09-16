import Profile from "@/components/Profile";
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
import { Controller, useForm } from "react-hook-form";
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
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
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
		options: { enabled: !!cosmWasmClient },
	});

	const inputStatsMutation = useArenaWagerModuleInputStatsMutation();

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

	const schema = statTypes ? generateSchema(statTypes) : z.object({});
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
						onOpenChange();
					},
				},
			);
		} catch (error) {
			console.error(error);
			toast.error((error as Error).toString());
		}
	};

	return (
		<>
			<Button
				onPress={onOpen}
				isDisabled={!statTypes || statTypes.length === 0 || !!error}
				isLoading={isLoadingStatTypes}
			>
				Input Stats
			</Button>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
					<form onSubmit={handleSubmit(onSubmit)}>
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
							{statTypes?.map((statType) => (
								<Controller
									key={statType.name}
									name={statType.name}
									control={control}
									render={({ field, fieldState: { error } }) => {
										switch (statType.value_type) {
											case "bool":
												return (
													<Switch
														{...field}
														placeholder={`Select ${statType.name}`}
														value={field?.value?.toString()}
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
														onChange={(e) =>
															field.onChange(e.target.valueAsNumber)
														}
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
														onChange={(e) =>
															field.onChange(BigInt(e.target.value))
														}
														label={statType.name}
														placeholder={`Enter ${statType.name}`}
														errorMessage={error?.message}
														isInvalid={!!error}
													/>
												);
										}
									}}
								/>
							))}
						</ModalBody>
						<ModalFooter>
							<Button color="danger" variant="light" onPress={onOpenChange}>
								Close
							</Button>
							<Button color="primary" type="submit">
								Submit
							</Button>
						</ModalFooter>
					</form>
				</ModalContent>
			</Modal>
		</>
	);
};

export default InputStatsModal;
