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
	Progress,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { BsPercent } from "react-icons/bs";
import { FiPlus, FiTrash } from "react-icons/fi";
import { toast } from "react-toastify";
import { z } from "zod";
import {
	ArenaPaymentRegistryClient,
	ArenaPaymentRegistryQueryClient,
} from "~/codegen/ArenaPaymentRegistry.client";
import {
	arenaPaymentRegistryQueryKeys,
	useArenaPaymentRegistryGetDistributionQuery,
	useArenaPaymentRegistryRemoveDistributionMutation,
	useArenaPaymentRegistrySetDistributionMutation,
} from "~/codegen/ArenaPaymentRegistry.react-query";
import type { NullableDistributionForString } from "~/codegen/ArenaPaymentRegistry.types";
import { DistributionSchema } from "~/config/schemas";
import { convertToDistribution } from "~/helpers/SchemaHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

const PaymentRegistrySchema = z.object({
	distribution: DistributionSchema,
});

type PaymentRegistryFormValues = z.infer<typeof PaymentRegistrySchema>;

const PaymentRegistry: React.FC = () => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const queryClient = useQueryClient();
	const setDistributionMutation =
		useArenaPaymentRegistrySetDistributionMutation();
	const removeDistributionMutation =
		useArenaPaymentRegistryRemoveDistributionMutation();

	const searchParams = useSearchParams();
	const queryAddress = searchParams.get("addr") || address;

	const [height, setHeight] = useState(searchParams.get("height") || undefined);
	const [queryHeight, setQueryHeight] = useState<number | undefined>(undefined);

	const contractAddress = env.ARENA_PAYMENT_REGISTRY_ADDRESS;

	const {
		data: distribution,
		isLoading,
		refetch,
	} = useArenaPaymentRegistryGetDistributionQuery({
		client:
			cosmWasmClient &&
			new ArenaPaymentRegistryQueryClient(cosmWasmClient, contractAddress),
		args: {
			addr: queryAddress || "",
			height: queryHeight,
		},
		options: {
			enabled: !!queryAddress && !!cosmWasmClient,
		},
	});

	const {
		control,
		formState: { errors, isSubmitting },
		handleSubmit,
		reset,
	} = useForm<PaymentRegistryFormValues>({
		defaultValues: {
			distribution: {
				member_percentages: [],
				remainder_addr: "",
			},
		},
		resolver: zodResolver(PaymentRegistrySchema),
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

	React.useEffect(() => {
		if (distribution) {
			reset({
				distribution: {
					...distribution,
					member_percentages: distribution.member_percentages.map((mp) => ({
						...mp,
						percentage: Number(mp.percentage) * 100,
					})),
				},
			});
		}
	}, [distribution, reset]);

	const onSubmit = async (values: PaymentRegistryFormValues) => {
		try {
			if (!address) throw new Error("Could not get user address");

			const client = await getSigningCosmWasmClient();

			const paymentRegistryClient = new ArenaPaymentRegistryClient(
				client,
				address,
				contractAddress,
			);
			const distribution = convertToDistribution(values.distribution);

			if (!distribution) throw new Error("Distribution value was undefined");

			await setDistributionMutation.mutateAsync(
				{
					client: paymentRegistryClient,
					msg: { distribution },
				},
				{
					onSuccess(_, variables) {
						queryClient.setQueryData<NullableDistributionForString | undefined>(
							arenaPaymentRegistryQueryKeys.getDistribution(contractAddress, {
								addr: address,
							}),
							() => variables.msg.distribution,
						);
						toast.success("Payment distribution has been updated");
					},
				},
			);
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	const onRemoveDistribution = async () => {
		try {
			if (!address) throw new Error("Could not get user address");

			const client = await getSigningCosmWasmClient();

			const paymentRegistryClient = new ArenaPaymentRegistryClient(
				client,
				address,
				contractAddress,
			);

			await removeDistributionMutation.mutateAsync(
				{
					client: paymentRegistryClient,
				},
				{
					onSuccess() {
						queryClient.setQueryData<NullableDistributionForString | undefined>(
							arenaPaymentRegistryQueryKeys.getDistribution(contractAddress, {
								addr: address,
							}),
							() => null,
						);
						reset({
							distribution: {
								member_percentages: [],
								remainder_addr: "",
							},
						});
						toast.success("Payment distribution has been removed");
					},
				},
			);
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	if (!queryAddress) {
		return (
			<div>
				Please connect your wallet or provide an address to view payment
				distributions.
			</div>
		);
	}

	const isOwnRegistry = address === queryAddress;

	const handleQuery = () => {
		setQueryHeight(height ? Number.parseInt(height) : undefined);
		refetch();
	};

	return (
		<div className="container mx-auto space-y-6 p-4">
			<h1 className="mb-4 font-bold text-2xl">Payment Distribution Registry</h1>
			<p className="mb-4">
				This registry shows the payment distribution for the specified address.
				It details how incoming funds are distributed among recipients, with any
				remainder sent to a designated address.
			</p>
			{!isOwnRegistry && (
				<div className="mb-4">
					Viewing payment distribution for: <Profile address={queryAddress} />
					{address && (
						<Link href={`?addr=${address}`}>
							<Button className="ml-4" size="sm">
								View Your Registry
							</Button>
						</Link>
					)}
				</div>
			)}
			<Card>
				<CardHeader>
					<h2 className="font-semibold text-xl">Distribution</h2>
				</CardHeader>
				<CardBody className="space-y-4">
					<div className="flex items-center space-x-2">
						<Input
							label="Block Height"
							type="number"
							value={height}
							onChange={(e) => setHeight(e.target.value)}
							placeholder="Enter block height (optional)"
						/>
						<Button onPress={handleQuery} disabled={isLoading}>
							Query
						</Button>
					</div>
					{isLoading && <div>Loading distribution...</div>}
					{!isLoading && distribution && (
						<>
							<div className="flex items-center gap-2">
								<div className="font-semibold">Remainder Address:</div>
								<Profile address={distribution.remainder_addr} />
							</div>
							<Table aria-label="Distribution" removeWrapper>
								<TableHeader>
									<TableColumn>Recipient</TableColumn>
									<TableColumn>Percentage</TableColumn>
								</TableHeader>
								<TableBody>
									{distribution.member_percentages.map((item) => (
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
						</>
					)}
					{!isLoading && !distribution && (
						<div>No distribution found for the given address and height.</div>
					)}
				</CardBody>
			</Card>
			{isOwnRegistry && (
				<form onSubmit={handleSubmit(onSubmit)}>
					<Card>
						<CardHeader>
							<h2 className="font-semibold text-xl">
								Update Preset Distribution
							</h2>
						</CardHeader>
						<CardBody className="space-y-4">
							<div className="flex items-center space-x-2">
								{remainderAddr && (
									<Profile address={remainderAddr} justAvatar />
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
									<TableColumn>Recipient</TableColumn>
									<TableColumn>Percentage</TableColumn>
									<TableColumn>Action</TableColumn>
								</TableHeader>
								<TableBody emptyContent="No recipients added">
									{fields.map((memberPercentage, i) => (
										<TableRow key={memberPercentage.id} className="align-top">
											<TableCell>
												<div className="flex items-center space-x-2">
													{percentages[i] && (
														<Profile
															address={percentages[i]?.addr}
															justAvatar
														/>
													)}
													<Controller
														control={control}
														name={`distribution.member_percentages.${i}.addr`}
														render={({ field }) => (
															<Input
																label={`Recipient ${i + 1}`}
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
													aria-label="Remove Recipient"
													variant="faded"
													onPress={() => remove(i)}
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
								<p>{errors.distribution?.member_percentages?.root?.message}</p>
							</div>
							<Progress
								aria-label="Total Percentage"
								value={percentages.reduce(
									(acc, x) => acc + (x.percentage as number),
									0,
								)}
								color="primary"
								showValueLabel
							/>
						</CardBody>
						<CardFooter className="flex justify-between">
							<Button
								onPress={() => append({ addr: "", percentage: 0 })}
								aria-label="Add Recipient"
								startContent={<FiPlus />}
								isDisabled={isSubmitting}
							>
								Add Recipient
							</Button>
							<div className="space-x-2">
								{distribution && !height && (
									<Button
										onPress={onRemoveDistribution}
										isLoading={removeDistributionMutation.isLoading}
										color="danger"
									>
										Remove Current
									</Button>
								)}
								<Button type="submit" isLoading={isSubmitting} color="primary">
									Update
								</Button>
							</div>
						</CardFooter>
					</Card>
				</form>
			)}
		</div>
	);
};

export default PaymentRegistry;
