"use client";

import type React from "react";
import { useMemo, useState, useCallback } from "react";
import { useChain } from "@cosmos-kit/react";
import {
	Card,
	CardBody,
	CardHeader,
	Input,
	Button,
	Divider,
	Table,
	TableBody,
	TableRow,
	TableCell,
	TableHeader,
	TableColumn,
	useDisclosure,
} from "@nextui-org/react";
import {
	useCwAbcBuyMutation,
	useCwAbcSellMutation,
	useCwAbcDumpStateQuery,
} from "~/codegen/CwAbc.react-query";
import { CwAbcClient, CwAbcQueryClient } from "~/codegen/CwAbc.client";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	ReferenceLine,
	Legend,
} from "recharts";
import { getBaseToken, getDisplayToken } from "~/helpers/TokenHelpers";
import { useToken } from "~/hooks/useToken";
import TokenInfo from "@/components/TokenInfo";
import TokenActionModal from "./components/TokenActionModal";

type ActionType = "buy" | "sell" | null;

const TokenPage: React.FC = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const [amount, setAmount] = useState<string>("");
	const [actionType, setActionType] = useState<ActionType>(null);
	const [error, setError] = useState<string | null>(null);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const client = useMemo(
		() =>
			cosmWasmClient
				? new CwAbcQueryClient(cosmWasmClient, env.ARENA_ABC_ADDRESS)
				: undefined,
		[cosmWasmClient, env.ARENA_ABC_ADDRESS],
	);

	const { data: dumpState, isLoading: isDumpStateLoading } =
		useCwAbcDumpStateQuery({ client });

	const { data: supplyToken } = useToken(
		dumpState?.supply_denom || "",
		true,
		env.CHAIN,
	);
	const { data: reserveToken } = useToken(
		dumpState?.curve_info.reserve_denom || "",
		true,
		env.CHAIN,
	);

	const buyMutation = useCwAbcBuyMutation();
	const sellMutation = useCwAbcSellMutation();

	const handleConfirmAction = useCallback(async () => {
		setError(null);
		try {
			if (actionType === "buy") {
				await handleBuy();
			} else if (actionType === "sell") {
				await handleSell();
			}
			onClose();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unknown error occurred",
			);
		}
	}, [actionType, onClose]);

	const handleBuy = async () => {
		if (!address) {
			throw new Error("Wallet not connected");
		}
		if (!reserveToken) {
			throw new Error("Reserve token not available");
		}

		const funds = [
			getBaseToken({ amount, denom: reserveToken.display }, reserveToken),
		];

		const client = await getSigningCosmWasmClient();
		await buyMutation.mutateAsync({
			client: new CwAbcClient(client, address, env.ARENA_ABC_ADDRESS),
			args: {
				funds,
			},
		});
	};

	const handleSell = async () => {
		if (!address) {
			throw new Error("Wallet not connected");
		}
		if (!supplyToken) {
			throw new Error("Reserve token not available");
		}

		const funds = [
			getBaseToken({ amount, denom: supplyToken.display }, supplyToken),
		];

		const client = await getSigningCosmWasmClient();
		await sellMutation.mutateAsync({
			client: new CwAbcClient(client, address, env.ARENA_ABC_ADDRESS),
			args: { funds },
		});
	};

	const curveData = useMemo(() => {
		if (!dumpState || !supplyToken || !reserveToken) return [];

		const data = [];
		const maxSupply = dumpState.max_supply
			? BigInt(dumpState.max_supply)
			: BigInt(100_000_000_000000); // Assuming 6 decimal places
		const curveType = dumpState.curve_type;
		const points = 100; // Number of points to plot

		for (let i = 0; i <= points; i++) {
			// Use exponential function to create more points at the beginning of the curve
			const supply = BigInt(
				Math.floor(
					(Number(maxSupply) * (Math.exp(i / points) - 1)) / (Math.E - 1),
				),
			);
			let reserve = BigInt(0);

			if ("constant" in curveType) {
				const value = BigInt(curveType.constant.value);
				reserve = (supply * value) / BigInt(10 ** curveType.constant.scale);
			} else if ("linear" in curveType) {
				const slope = BigInt(curveType.linear.slope);
				reserve =
					(supply * supply * slope) /
					(BigInt(2) * BigInt(10 ** curveType.linear.scale));
			} else if ("square_root" in curveType) {
				const slope = BigInt(curveType.square_root.slope);
				reserve =
					(BigInt(2) *
						supply *
						BigInt(Math.floor(Math.sqrt(Number(supply)))) *
						slope) /
					(BigInt(3) * BigInt(10 ** curveType.square_root.scale));
			}

			const supplyCoin = {
				amount: supply.toString(),
				denom: dumpState.supply_denom,
			};
			const reserveCoin = {
				amount: reserve.toString(),
				denom: dumpState.curve_info.reserve_denom,
			};

			const displaySupply = getDisplayToken(supplyCoin, supplyToken);
			const displayReserve = getDisplayToken(reserveCoin, reserveToken);

			data.push({
				supply: Number(displaySupply.amount),
				reserve: Number(displayReserve.amount),
			});
		}

		return data;
	}, [dumpState, supplyToken, reserveToken]);

	const openConfirmModal = useCallback(
		(type: ActionType) => {
			if (amount === "") {
				setError("Please enter an amount");
				return;
			}
			setActionType(type);
			setError(null);
			onOpen();
		},
		[amount, onOpen],
	);

	if (isDumpStateLoading) {
		return <div>Loading...</div>;
	}

	if (!dumpState) {
		return <div>Error loading data</div>;
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-8 font-bold text-4xl">DAO Token</h1>

			<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
				<Card>
					<CardHeader>
						<h2 className="text-2xl">Token Information</h2>
					</CardHeader>
					<CardBody>
						<Table hideHeader removeWrapper>
							<TableHeader>
								<TableColumn>Property</TableColumn>
								<TableColumn>Value</TableColumn>
							</TableHeader>
							<TableBody>
								<TableRow key="phase">
									<TableCell>Current Phase</TableCell>
									<TableCell>{dumpState.phase.toUpperCase()}</TableCell>
								</TableRow>
								<TableRow key="supply">
									<TableCell>Total Supply</TableCell>
									<TableCell>
										<TokenInfo
											denomOrAddress={dumpState.supply_denom}
											isNative
											amount={BigInt(dumpState.curve_info.supply)}
										/>
									</TableCell>
								</TableRow>
								<TableRow key="reserve">
									<TableCell>Reserve</TableCell>
									<TableCell>
										<TokenInfo
											denomOrAddress={dumpState.curve_info.reserve_denom}
											isNative
											amount={BigInt(dumpState.curve_info.reserve)}
										/>
									</TableCell>
								</TableRow>
								<TableRow key="spotPrice">
									<TableCell>Spot Price</TableCell>
									<TableCell>
										<TokenInfo
											denomOrAddress={dumpState.curve_info.reserve_denom}
											isNative
											amount={BigInt(dumpState.curve_info.spot_price)}
										/>
									</TableCell>
								</TableRow>
								<TableRow key="maxSupply">
									<TableCell>Max Supply</TableCell>
									<TableCell>
										{dumpState.max_supply ? (
											<TokenInfo
												denomOrAddress={dumpState.supply_denom}
												isNative
												amount={BigInt(dumpState.max_supply)}
											/>
										) : (
											"Unlimited"
										)}
									</TableCell>
								</TableRow>
								<TableRow key="isPaused">
									<TableCell>Is Paused</TableCell>
									<TableCell>{dumpState.is_paused ? "Yes" : "No"}</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="text-2xl">Token Actions</h2>
					</CardHeader>
					<CardBody>
						<div className="space-y-4">
							<div>
								<Input
									label="Buy Amount"
									placeholder="Enter amount to buy"
									value={actionType === "buy" ? amount : ""}
									onChange={(e) => {
										setActionType("buy");
										setAmount(e.target.value);
									}}
									type="number"
									endContent={
										<TokenInfo
											denomOrAddress={dumpState.curve_info.reserve_denom}
											isNative
										/>
									}
								/>
								<Button
									color="primary"
									onClick={() => openConfirmModal("buy")}
									isDisabled={dumpState.is_paused}
									className="mt-2 w-full"
								>
									Buy
								</Button>
							</div>
							<div>
								<Input
									label="Sell Amount"
									placeholder="Enter amount to sell"
									value={actionType === "sell" ? amount : ""}
									onChange={(e) => {
										setActionType("sell");
										setAmount(e.target.value);
									}}
									type="number"
									endContent={
										<TokenInfo
											denomOrAddress={dumpState.supply_denom}
											isNative
										/>
									}
								/>
								<Button
									color="secondary"
									onClick={() => openConfirmModal("sell")}
									isDisabled={dumpState.is_paused}
									className="mt-2 w-full"
								>
									Sell
								</Button>
							</div>
						</div>
					</CardBody>
				</Card>
			</div>

			<Divider className="my-8" />

			<Card>
				<CardHeader>
					<h2 className="text-2xl">Bonding Curve</h2>
				</CardHeader>
				<CardBody className="h-96 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={curveData}>
							<CartesianGrid
								strokeDasharray="3 3"
								aria-label="Bonding Curve Visualized"
							/>
							<XAxis
								dataKey="reserve"
								name="Reserve"
								scale="log"
								domain={["auto", "auto"]}
								label={{
									value: `Reserve (${reserveToken?.symbol})`,
									position: "insideBottom",
									offset: -10,
								}}
								tickFormatter={(value) => value.toFixed(2)}
							/>
							<YAxis
								dataKey="supply"
								name="Supply"
								scale="log"
								domain={["auto", "auto"]}
								label={{
									value: `Token Supply (${supplyToken?.symbol})`,
									angle: -90,
									position: "insideLeft",
								}}
								tickFormatter={(value) => value.toFixed(2)}
							/>
							<RechartsTooltip
								formatter={(value, name) => [
									`${value.toFixed(2)} ${name === "Reserve" ? reserveToken?.symbol : supplyToken?.symbol}`,
									name,
								]}
							/>
							<Legend />
							<Line
								type="monotone"
								dataKey="supply"
								stroke="#8884d8"
								dot={false}
								name="Supply"
							/>
							<ReferenceLine
								y={Number(dumpState.curve_info.supply)}
								stroke="red"
								label={{ value: "Current Supply", position: "right" }}
							/>
							<ReferenceLine
								x={Number(dumpState.curve_info.reserve)}
								stroke="green"
								label={{ value: "Current Reserve", position: "top" }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardBody>
			</Card>

			{supplyToken && reserveToken && (
				<TokenActionModal
					isOpen={isOpen}
					onClose={onClose}
					actionType={actionType}
					amount={amount}
					supplyToken={supplyToken}
					reserveToken={reserveToken}
					onConfirm={handleConfirmAction}
					error={error}
				/>
			)}
		</div>
	);
};

export default TokenPage;
