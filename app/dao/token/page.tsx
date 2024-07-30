"use client";

import { useMemo, useState } from "react";
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
	Tooltip,
	TableColumn,
	TableHeader,
} from "@nextui-org/react";
import {
	useCwAbcBuyMutation,
	useCwAbcSellMutation,
	useCwAbcBuyQuoteQuery,
	useCwAbcSellQuoteQuery,
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
} from "recharts";

const TokenPage = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const [amount, setAmount] = useState("");

	const client = cosmWasmClient
		? new CwAbcQueryClient(cosmWasmClient, env.ARENA_ABC_ADDRESS)
		: undefined;

	const { data: dumpState } = useCwAbcDumpStateQuery({ client });
	const { data: buyQuote } = useCwAbcBuyQuoteQuery({
		client,
		args: { payment: amount },
	});
	const { data: sellQuote } = useCwAbcSellQuoteQuery({
		client,
		args: { payment: amount },
	});

	const buyMutation = useCwAbcBuyMutation();
	const sellMutation = useCwAbcSellMutation();

	const handleBuy = async () => {
		if (!address) {
			throw new Error("Wallet not connected");
		}
		if (!dumpState?.curve_info.reserve_denom) {
			throw new Error("Reserve denom not available");
		}

		const client = await getSigningCosmWasmClient();
		await buyMutation.mutateAsync({
			client: new CwAbcClient(client, address, env.ARENA_ABC_ADDRESS),
			args: { funds: [{ amount, denom: dumpState.curve_info.reserve_denom }] },
		});
	};

	const handleSell = async () => {
		if (!address) {
			throw new Error("Wallet not connected");
		}

		const client = await getSigningCosmWasmClient();
		await sellMutation.mutateAsync({
			client: new CwAbcClient(client, address, env.ARENA_ABC_ADDRESS),
		});
	};

	const curveData = useMemo(() => {
		if (!dumpState) return [];

		const data = [];
		const maxSupply = Number.parseInt(dumpState.curve_info.supply) * 2;
		const steps = 100;

		for (let i = 0; i <= steps; i++) {
			const supply = (maxSupply * i) / steps;
			let price: number | undefined;

			if ("constant" in dumpState.curve_type) {
				price =
					Number.parseFloat(dumpState.curve_type.constant.value) /
					10 ** dumpState.curve_type.constant.scale;
			} else if ("linear" in dumpState.curve_type) {
				price =
					(Number.parseFloat(dumpState.curve_type.linear.slope) * supply) /
					10 ** dumpState.curve_type.linear.scale;
			} else if ("square_root" in dumpState.curve_type) {
				price =
					(Number.parseFloat(dumpState.curve_type.square_root.slope) *
						Math.sqrt(supply)) /
					10 ** dumpState.curve_type.square_root.scale;
			}

			data.push({ supply, price });
		}

		return data;
	}, [dumpState]);

	if (!dumpState) {
		return <div>Loading...</div>;
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="mb-8 font-bold text-4xl">DAO Token</h1>

			<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
				{/* Token Information Card */}
				<Card>
					<CardHeader>
						<h2 className="text-2xl">Token Information</h2>
					</CardHeader>
					<CardBody>
						<Table aria-label="Token Information">
							<TableHeader>
								<TableColumn>Property</TableColumn>
								<TableColumn>Value</TableColumn>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell>Current Phase</TableCell>
									<TableCell>{dumpState.phase}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>Total Supply</TableCell>
									<TableCell>{dumpState.curve_info.supply}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>Reserve</TableCell>
									<TableCell>
										{dumpState.curve_info.reserve}{" "}
										{dumpState.curve_info.reserve_denom}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>Spot Price</TableCell>
									<TableCell>
										{dumpState.curve_info.spot_price}{" "}
										{dumpState.curve_info.reserve_denom}/token
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>Max Supply</TableCell>
									<TableCell>{dumpState.max_supply || "Unlimited"}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>Is Paused</TableCell>
									<TableCell>{dumpState.is_paused ? "Yes" : "No"}</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</CardBody>
				</Card>

				{/* Token Actions Card */}
				<Card>
					<CardHeader>
						<h2 className="text-2xl">Token Actions</h2>
					</CardHeader>
					<CardBody>
						<Input
							label="Amount"
							placeholder="Enter amount"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							type="number"
						/>
						<div className="mt-4 flex justify-between">
							<Tooltip content={`You will receive ${buyQuote?.amount} tokens`}>
								<Button
									color="primary"
									onClick={handleBuy}
									isDisabled={dumpState.is_paused}
								>
									Buy
								</Button>
							</Tooltip>
							<Tooltip
								content={`You will receive ${sellQuote?.amount} ${dumpState.curve_info.reserve_denom}`}
							>
								<Button
									color="secondary"
									onClick={handleSell}
									isDisabled={dumpState.is_paused}
								>
									Sell
								</Button>
							</Tooltip>
						</div>
					</CardBody>
				</Card>
			</div>

			<Divider className="my-8" />

			{/* Bonding Curve Visualization Card */}
			<Card>
				<CardHeader>
					<h2 className="text-2xl">Bonding Curve</h2>
				</CardHeader>
				<CardBody>
					<div style={{ width: "100%", height: 400 }}>
						<ResponsiveContainer>
							<LineChart data={curveData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis
									dataKey="supply"
									name="Supply"
									label={{
										value: "Token Supply",
										position: "insideBottom",
										offset: -10,
									}}
								/>
								<YAxis
									name="Price"
									label={{
										value: "Token Price",
										angle: -90,
										position: "insideLeft",
									}}
								/>
								<RechartsTooltip />
								<Line type="monotone" dataKey="price" stroke="#8884d8" />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</CardBody>
			</Card>
		</div>
	);
};

export default TokenPage;
