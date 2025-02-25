"use client";

import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import {
	Alert,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Divider,
	Input,
	Progress,
	Spinner,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tabs,
	addToast,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { HelpCircle, Percent, Plus, Save, Search, Trash } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
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
import { isValidBech32Address } from "~/helpers/AddressHelpers";
import { convertToDistribution } from "~/helpers/SchemaHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

const PaymentRegistrySchema = z.object({
	distribution: DistributionSchema,
});

type PaymentRegistryFormValues = z.infer<typeof PaymentRegistrySchema>;

const PaymentRegistry = () => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const queryClient = useQueryClient();
	const contractAddress = env.ARENA_PAYMENT_REGISTRY_ADDRESS;

	// Query params & state
	const searchParams = useSearchParams();
	const [queryAddress, setQueryAddress] = useState(
		searchParams.get("addr") || address || "",
	);
	const [height, setHeight] = useState(searchParams.get("height") || "");
	const [queryHeight, setQueryHeight] = useState<number | undefined>(
		searchParams.get("height") ? Number(searchParams.get("height")) : undefined,
	);

	// Tabs state
	const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "view");
	const isOwnRegistry = address === queryAddress;

	// Mutations
	const setDistributionMutation =
		useArenaPaymentRegistrySetDistributionMutation();
	const removeDistributionMutation =
		useArenaPaymentRegistryRemoveDistributionMutation();

	// Get distribution data
	const {
		data: distribution,
		isLoading,
		refetch,
	} = useArenaPaymentRegistryGetDistributionQuery({
		client:
			cosmWasmClient &&
			new ArenaPaymentRegistryQueryClient(cosmWasmClient, contractAddress),
		args: {
			addr: queryAddress,
			height: queryHeight,
		},
		options: {
			enabled:
				!!queryAddress &&
				!!cosmWasmClient &&
				isValidBech32Address(queryAddress),
		},
	});

	// Form setup
	const {
		control,
		formState: { errors, isSubmitting, isDirty },
		handleSubmit,
		reset,
		setValue,
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

	// Calculate total percentage
	const totalPercentage = percentages.reduce(
		(acc, x) => acc + Number(x.percentage || 0),
		0,
	);

	// Load existing distribution data into form
	useEffect(() => {
		if (distribution && activeTab === "edit" && isOwnRegistry) {
			setValue(
				"distribution",
				{
					member_percentages: distribution.member_percentages,
					remainder_addr: distribution.remainder_addr,
				},
				{ shouldDirty: false },
			);
		}
	}, [distribution, activeTab, isOwnRegistry, setValue]);

	// Handle query form submission
	const handleQuery = () => {
		if (!queryAddress) {
			addToast({
				color: "warning",
				description: "Please enter a valid address to query",
			});
			return;
		}

		if (!isValidBech32Address(queryAddress)) {
			addToast({
				color: "danger",
				description: "Please enter a valid address format",
			});
			return;
		}

		setQueryHeight(height ? Number.parseInt(height) : undefined);
		refetch();
	};

	// Handle distribution form submission
	const onSubmit = async (values: PaymentRegistryFormValues) => {
		try {
			if (!address) throw new Error("Could not get user address");

			const client = await getSigningCosmWasmClient();
			const paymentRegistryClient = new ArenaPaymentRegistryClient(
				client,
				address,
				contractAddress,
			);

			const distributionData = convertToDistribution(values.distribution);
			if (!distributionData)
				throw new Error("Distribution value was undefined");

			await setDistributionMutation.mutateAsync(
				{
					client: paymentRegistryClient,
					msg: { distribution: distributionData },
				},
				{
					onSuccess(_, variables) {
						queryClient.setQueryData<NullableDistributionForString | undefined>(
							arenaPaymentRegistryQueryKeys.getDistribution(contractAddress, {
								addr: address,
							}),
							() => variables.msg.distribution,
						);
						addToast({
							color: "success",
							description: "Payment distribution has been updated",
						});
						setActiveTab("view");
					},
				},
			);
		} catch (e) {
			console.error(e);
			addToast({ color: "danger", description: (e as Error).toString() });
		}
	};

	// Handle distribution removal
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
						addToast({
							color: "success",
							description: "Payment distribution has been removed",
						});
						setActiveTab("view");
					},
				},
			);
		} catch (e) {
			console.error(e);
			addToast({ color: "danger", description: (e as Error).toString() });
		}
	};

	if (!address && !queryAddress) {
		return (
			<div className="container mx-auto p-4">
				<Card>
					<CardBody className="flex flex-col items-center justify-center py-8">
						<HelpCircle size={36} className="mb-4 text-default-400" />
						<p className="mb-2 text-center font-medium text-lg">
							Connect Wallet
						</p>
						<p className="text-center text-default-500">
							Connect your wallet to view or set up your payment distribution.
						</p>
					</CardBody>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			{/* Simple header with explanation */}
			<div className="mb-6">
				<h1 className="font-bold text-2xl">Payment Distribution</h1>
				<p className="mt-1 text-default-500">
					{isOwnRegistry
						? "Control how your competition winnings are distributed automatically."
						: `Viewing distribution settings for ${queryAddress}`}
				</p>
			</div>

			{/* Help Card - Always visible for context */}
			<Alert
				title="How it works:"
				description={
					<div className="text-sm">
						When you win a competition, your prize will be
						{distribution
							? " automatically split according to your settings below."
							: " sent directly to your address. If your address is a DAO, a governance proposal will be needed to move the funds."}
					</div>
				}
			/>

			{/* Simple tabs */}
			<div className="mb-4">
				<Tabs
					selectedKey={activeTab}
					onSelectionChange={(key) => setActiveTab(key as string)}
					color="primary"
					variant="underlined"
					classNames={{
						tabList: "gap-6",
					}}
				>
					<Tab key="view" title="View Distribution" />
					{isOwnRegistry && <Tab key="edit" title="Edit Distribution" />}
				</Tabs>
			</div>

			{/* VIEW MODE */}
			{activeTab === "view" && (
				<div className="space-y-4">
					{/* Query Controls */}
					{!isOwnRegistry && (
						<Card className="mb-4">
							<CardBody>
								<div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
									<Input
										placeholder="Enter address to view"
										value={queryAddress}
										onChange={(e) => setQueryAddress(e.target.value)}
										startContent={<Search size={16} />}
										className="flex-1"
										labelPlacement="outside"
										label="Address"
									/>
									<Input
										placeholder="Block height (optional)"
										type="number"
										value={height}
										onChange={(e) => setHeight(e.target.value)}
										className="w-full sm:w-48"
										labelPlacement="outside"
										label="Height"
									/>
									<Button
										color="primary"
										className="sm:self-end"
										onPress={handleQuery}
										isLoading={isLoading}
										isDisabled={
											!queryAddress || !isValidBech32Address(queryAddress)
										}
									>
										View Distribution
									</Button>
								</div>
							</CardBody>
						</Card>
					)}

					{/* Loading State */}
					{isLoading ? (
						<Card>
							<CardBody className="flex h-40 items-center justify-center">
								<Spinner color="primary" />
							</CardBody>
						</Card>
					) : !distribution ? (
						/* No distribution found */
						<Card>
							<CardBody className="py-8 text-center">
								<HelpCircle
									size={36}
									className="mx-auto mb-3 text-default-400"
								/>
								<h3 className="mb-2 font-medium text-lg">
									No Distribution Set
								</h3>
								<p className="mx-auto mb-6 max-w-md text-default-500">
									{isOwnRegistry
										? "You haven't set up a payment distribution yet. When you win a competition, all funds will be sent directly to your address with no automatic splitting."
										: `${queryAddress.slice(0, 8)}...${queryAddress.slice(-8)} has not set up a payment distribution.`}
								</p>
								{isOwnRegistry && (
									<Button color="primary" onPress={() => setActiveTab("edit")}>
										Set Up Distribution
									</Button>
								)}
							</CardBody>
						</Card>
					) : (
						/* Distribution Found - Simple Display */
						<Card>
							<CardHeader>
								<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
									<h2 className="font-medium text-lg">Current Distribution</h2>
									{isOwnRegistry && (
										<Button
											color="primary"
											variant="flat"
											size="sm"
											onPress={() => setActiveTab("edit")}
										>
											Edit Distribution
										</Button>
									)}
								</div>
							</CardHeader>
							<Divider />
							<CardBody className="space-y-6">
								{/* Remainder Address */}
								<div className="flex flex-col gap-2 rounded-lg border bg-default-50 p-3 sm:flex-row sm:items-center">
									<div className="font-semibold">Default Recipient:</div>
									<Profile address={distribution.remainder_addr} />
									<span className="ml-2 text-default-500 text-sm">
										(receives any remaining funds)
									</span>
								</div>

								{/* Recipients Table */}
								{distribution.member_percentages.length > 0 ? (
									<div className="overflow-hidden rounded-lg border">
										<Table
											aria-label="Distribution"
											removeWrapper
											isStriped
											classNames={{
												thead: "bg-default-100",
												th: "text-default-700 text-sm font-medium",
											}}
										>
											<TableHeader>
												<TableColumn>Recipient</TableColumn>
												<TableColumn>Share</TableColumn>
											</TableHeader>
											<TableBody>
												{distribution.member_percentages.map((item, index) => (
													<TableRow key={`${item.addr}-${index}`}>
														<TableCell>
															<Profile address={item.addr} />
														</TableCell>
														<TableCell>
															<div className="flex items-center gap-3">
																<div className="w-14 text-right font-medium">
																	{(
																		Number.parseFloat(item.percentage) * 100
																	).toFixed(1)}
																	%
																</div>
																<div className="max-w-xs flex-1">
																	<div
																		className="h-2 rounded-full bg-primary-500"
																		style={{
																			width: `${Math.min(Number.parseFloat(item.percentage) * 100, 100)}%`,
																		}}
																	/>
																</div>
															</div>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								) : (
									<div className="rounded-lg border border-dashed bg-default-50 p-4 text-center">
										<p className="text-default-500">
											No specific recipients defined. All funds will go to the
											default recipient.
										</p>
									</div>
								)}
							</CardBody>
						</Card>
					)}
				</div>
			)}

			{/* EDIT MODE */}
			{activeTab === "edit" && isOwnRegistry && (
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-6">
						{/* Default Recipient Card */}
						<Card>
							<CardHeader className="gap-2">
								<h3 className="font-medium text-lg">Default Recipient</h3>
								<p className="text-default-500 text-sm">
									This address will receive all remaining funds after any splits
								</p>
							</CardHeader>
							<CardBody>
								<div className="flex items-center gap-2">
									{remainderAddr && (
										<Profile address={remainderAddr} justAvatar />
									)}
									<Controller
										control={control}
										name="distribution.remainder_addr"
										render={({ field }) => (
											<Input
												label="Address"
												placeholder="Enter recipient address"
												autoFocus
												isDisabled={isSubmitting}
												isInvalid={!!errors.distribution?.remainder_addr}
												errorMessage={
													errors.distribution?.remainder_addr?.message
												}
												startContent={
													remainderAddr ? null : <Search size={16} />
												}
												className="flex-1"
												{...field}
											/>
										)}
									/>
								</div>
							</CardBody>
						</Card>

						{/* Recipients Card */}
						<Card>
							<CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h3 className="font-medium text-lg">Split Recipients</h3>
									<p className="text-default-500 text-sm">
										Add people to receive a percentage of your winnings
									</p>
								</div>
								<Button
									onPress={() => append({ addr: "", percentage: "0" })}
									color="primary"
									startContent={<Plus size={16} />}
									isDisabled={isSubmitting}
								>
									Add Recipient
								</Button>
							</CardHeader>
							<Divider />
							<CardBody>
								{fields.length > 0 ? (
									<div className="space-y-4">
										{fields.map((field, index) => (
											<div
												key={field.id}
												className="flex flex-col items-start gap-3 rounded-lg border bg-default-50 p-3 sm:flex-row"
											>
												<div className="flex-1">
													<div className="mb-1 flex items-center gap-2">
														{percentages[index]?.addr && (
															<Profile
																address={percentages[index]?.addr}
																justAvatar
															/>
														)}
														<Controller
															control={control}
															name={`distribution.member_percentages.${index}.addr`}
															render={({ field }) => (
																<Input
																	label="Recipient Address"
																	placeholder="Enter address"
																	isDisabled={isSubmitting}
																	isInvalid={
																		!!errors.distribution?.member_percentages?.[
																			index
																		]?.addr
																	}
																	errorMessage={
																		errors.distribution?.member_percentages?.[
																			index
																		]?.addr?.message
																	}
																	startContent={
																		percentages[index]?.addr ? null : (
																			<Search size={16} />
																		)
																	}
																	size="sm"
																	className="flex-1"
																	{...field}
																/>
															)}
														/>
													</div>
												</div>

												<div className="flex w-full items-center gap-2 sm:w-auto">
													<Controller
														control={control}
														name={`distribution.member_percentages.${index}.percentage`}
														render={({ field }) => (
															<Input
																label="Percentage"
																type="number"
																min="0"
																max="100"
																step="0.1"
																placeholder="0"
																isDisabled={isSubmitting}
																isInvalid={
																	!!errors.distribution?.member_percentages?.[
																		index
																	]?.percentage
																}
																errorMessage={
																	errors.distribution?.member_percentages?.[
																		index
																	]?.percentage?.message
																}
																endContent={<Percent size={16} />}
																classNames={{ input: "text-right" }}
																size="sm"
																className="w-32"
																{...field}
															/>
														)}
													/>
													<Button
														isIconOnly
														aria-label="Remove Recipient"
														color="danger"
														variant="light"
														onPress={() => remove(index)}
														isDisabled={isSubmitting}
														className="self-end"
													>
														<Trash size={16} />
													</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="rounded-lg border border-dashed p-8 text-center">
										<p className="text-default-500">
											No recipients added yet. Add recipients to split your
											winnings.
										</p>
									</div>
								)}

								{(errors.distribution?.message ||
									errors.distribution?.member_percentages?.message) && (
									<div className="mt-2 rounded bg-danger-50 p-2 text-danger text-sm">
										{errors.distribution?.message && (
											<p>{errors.distribution.message}</p>
										)}
										{errors.distribution?.member_percentages?.message && (
											<p>{errors.distribution.member_percentages.message}</p>
										)}
									</div>
								)}
							</CardBody>
						</Card>

						{/* Total Allocation */}
						<Card>
							<CardBody className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="font-medium text-lg">Total Distribution</h3>
									<div
										className={`font-bold text-lg ${
											totalPercentage > 100
												? "text-danger"
												: totalPercentage === 100
													? "text-success"
													: ""
										}`}
									>
										{totalPercentage.toFixed(1)}%
									</div>
								</div>

								<Progress
									aria-label="Total Percentage"
									value={totalPercentage}
									maxValue={100}
									color={
										totalPercentage > 100
											? "danger"
											: totalPercentage === 100
												? "success"
												: "primary"
									}
									showValueLabel
									classNames={{
										track: "h-4",
										indicator: "h-4",
										value: "text-sm font-medium",
									}}
									className="mb-2"
								/>

								<div
									className={`rounded-lg p-3 ${
										totalPercentage > 100
											? "bg-danger-50 text-danger-700"
											: totalPercentage === 100
												? "bg-success-50 text-success-700"
												: "bg-default-50 text-default-700"
									}`}
								>
									{totalPercentage < 100 ? (
										<p className="text-sm">
											Remaining{" "}
											<span className="font-bold">
												{(100 - totalPercentage).toFixed(1)}%
											</span>{" "}
											will go to the default recipient.
										</p>
									) : totalPercentage > 100 ? (
										<p className="text-sm">
											Total exceeds 100%. Please adjust your percentages.
										</p>
									) : (
										<p className="text-sm">
											Perfect! 100% of your funds are allocated.
										</p>
									)}
								</div>
							</CardBody>
							<Divider />
							<CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
								<Button
									onPress={() => setActiveTab("view")}
									variant="flat"
									isDisabled={isSubmitting}
									className="sm:order-1"
								>
									Cancel
								</Button>
								<div className="w-full space-y-2 sm:order-2 sm:w-auto sm:space-x-2 sm:space-y-0">
									{distribution && !queryHeight && (
										<Button
											onPress={onRemoveDistribution}
											isLoading={removeDistributionMutation.isLoading}
											color="danger"
											className="w-full sm:w-auto"
										>
											Remove Distribution
										</Button>
									)}
									<Button
										type="submit"
										isLoading={isSubmitting}
										color="primary"
										startContent={<Save size={16} />}
										isDisabled={!isDirty || totalPercentage > 100}
										className="w-full sm:w-auto"
									>
										Save Distribution
									</Button>
								</div>
							</CardFooter>
						</Card>
					</div>
				</form>
			)}
		</div>
	);
};

export default PaymentRegistry;
