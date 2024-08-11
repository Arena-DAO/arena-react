"use client";

import TokenInfo from "@/components/TokenInfo";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Spinner,
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
import { BsCart3 } from "react-icons/bs";
import { FiDollarSign } from "react-icons/fi";
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
		return (
			<div className="flex justify-center">
				<Spinner label="Loading ABC..." />
			</div>
		);
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
								<TableRow key="effectiveMintPrice">
									<TableCell>Effective Mint Price</TableCell>
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
						<Tabs aria-label="Token Actions" variant="bordered">
							<Tab
								key="buy"
								title={
									<div className="flex items-center space-x-2">
										<BsCart3 size={20} />
										<span className="font-semibold">Buy</span>
									</div>
								}
							>
								<div className="flex flex-col gap-6 pt-6">
									<Input
										label="Buy Amount"
										placeholder="Enter amount to buy"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										type="number"
										labelPlacement="outside"
										endContent={
											<div className="flex items-center">
												<TokenInfo
													denomOrAddress={dumpState.curve_info.reserve_denom}
													isNative
												/>
											</div>
										}
										size="lg"
									/>
									<div className="flex justify-end">
										<Button
											color="success"
											variant="shadow"
											onClick={() => openConfirmModal("buy")}
											isDisabled={dumpState.is_paused}
											className="font-semibold"
											startContent={<BsCart3 size={18} />}
										>
											Buy Tokens
										</Button>
									</div>
								</div>
							</Tab>
							<Tab
								key="sell"
								title={
									<div className="flex items-center space-x-2">
										<FiDollarSign size={20} />
										<span className="font-semibold">Sell</span>
									</div>
								}
							>
								<div className="flex flex-col gap-6 pt-6">
									<Input
										label="Sell Amount"
										placeholder="Enter amount to sell"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										type="number"
										labelPlacement="outside"
										endContent={
											<div className="flex items-center">
												<TokenInfo
													denomOrAddress={dumpState.supply_denom}
													isNative
												/>
											</div>
										}
										size="lg"
									/>
									<div className="flex justify-end">
										<Button
											color="danger"
											variant="shadow"
											onClick={() => openConfirmModal("sell")}
											isDisabled={dumpState.is_paused}
											className="font-semibold"
											startContent={<FiDollarSign size={18} />}
										>
											Sell Tokens
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
