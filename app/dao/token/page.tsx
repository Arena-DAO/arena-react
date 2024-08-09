"use client";

import TokenInfo from "@/components/TokenInfo";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tabs,
	useDisclosure,
} from "@nextui-org/react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { CwAbcQueryClient } from "~/codegen/CwAbc.client";
import { useCwAbcDumpStateQuery } from "~/codegen/CwAbc.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import { useToken } from "~/hooks/useToken";
import BondingCurveChart from "./components/BondingCurveChart";
import TokenActionModal from "./components/TokenActionModal";

type ActionType = "buy" | "sell" | null;

const TokenPage: React.FC = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const [amount, setAmount] = useState<string>("");
	const [actionType, setActionType] = useState<ActionType>(null);
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

	const openConfirmModal = useCallback(
		(type: ActionType) => {
			setActionType(type);
			onOpen();
		},
		[onOpen],
	);

	if (isDumpStateLoading) {
		return <div>Loading...</div>;
	}

	if (!dumpState) {
		return <div>Error loading data</div>;
	}

	return (
		<div className="container mx-auto px-4 py-8">
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
									<TableCell>
										{dumpState.phase_config.phase.toUpperCase()}
									</TableCell>
								</TableRow>
								<TableRow key="supply">
									<TableCell>Current Supply</TableCell>
									<TableCell>
										<TokenInfo
											denomOrAddress={dumpState.supply_denom}
											isNative
											amount={BigInt(dumpState.curve_info.supply)}
										/>
									</TableCell>
								</TableRow>
								<TableRow key="reserve">
									<TableCell>Current Reserve</TableCell>
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
											amount={(
												(Number(dumpState.curve_info.spot_price) * 10e5) /
												(1 -
													Number(
														dumpState.phase_config.phase_config.open.entry_fee,
													))
											).toString()}
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
							</TableBody>
						</Table>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="text-2xl">Token Actions</h2>
					</CardHeader>
					<CardBody>
						<Tabs aria-label="Token Actions" color="primary" variant="bordered">
							<Tab
								key="buy"
								title={
									<div className="flex items-center space-x-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="lucide lucide-shopping-cart"
										>
											<title>Shopping Cart</title>
											<circle cx="8" cy="21" r="1" />
											<circle cx="19" cy="21" r="1" />
											<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
										</svg>
										<span>Buy</span>
									</div>
								}
							>
								<div className="flex flex-col gap-4 pt-4">
									<Input
										label="Buy Amount"
										placeholder="Enter amount to buy"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										type="number"
										endContent={
											<div className="my-auto">
												<TokenInfo
													denomOrAddress={dumpState.curve_info.reserve_denom}
													isNative
												/>
											</div>
										}
										classNames={{ input: "text-right" }}
									/>
									<div className="flex justify-end">
										<Button
											color="success"
											onClick={() => openConfirmModal("buy")}
											isDisabled={dumpState.is_paused}
										>
											Buy
										</Button>
									</div>
								</div>
							</Tab>
							<Tab
								key="sell"
								title={
									<div className="flex items-center space-x-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="lucide lucide-receipt"
										>
											<title>Receipt</title>
											<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
											<path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
											<path d="M12 17V7" />
										</svg>
										<span>Sell</span>
									</div>
								}
							>
								<div className="flex flex-col gap-4 pt-4">
									<Input
										label="Sell Amount"
										placeholder="Enter amount to sell"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										type="number"
										endContent={
											<div className="my-auto">
												<TokenInfo
													denomOrAddress={dumpState.supply_denom}
													isNative
												/>
											</div>
										}
										classNames={{ input: "text-right" }}
									/>
									<div className="flex justify-end">
										<Button
											color="danger"
											onClick={() => openConfirmModal("sell")}
											isDisabled={dumpState.is_paused}
										>
											Sell
										</Button>
									</div>
								</div>
							</Tab>
						</Tabs>
					</CardBody>
				</Card>
			</div>

			{supplyToken && reserveToken && (
				<>
					<BondingCurveChart
						currentSupply={dumpState.curve_info.supply}
						currentReserve={dumpState.curve_info.reserve}
						supplyToken={supplyToken}
						reserveToken={reserveToken}
					/>
					<TokenActionModal
						isOpen={isOpen}
						onClose={onClose}
						actionType={actionType}
						amount={amount}
						supplyToken={supplyToken}
						reserveToken={reserveToken}
					/>
				</>
			)}
		</div>
	);
};

export default TokenPage;
