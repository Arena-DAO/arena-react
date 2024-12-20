"use client";

import TokenInfo from "@/components/TokenInfo";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Link,
	Spinner,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tabs,
	Tooltip,
	useDisclosure,
} from "@nextui-org/react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { BsCoin, BsFire } from "react-icons/bs";
import { FiInfo } from "react-icons/fi";
import { CwAbcQueryClient } from "~/codegen/CwAbc.client";
import { useCwAbcDumpStateQuery } from "~/codegen/CwAbc.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import { useToken } from "~/hooks/useToken";
import BondingCurveChart from "./components/BondingCurveChart";
import TokenActionModal from "./components/TokenActionModal";

type ActionType = "mint" | "burn" | null;

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
		env.ARENA_ABC_SUPPLY_DENOM,
		true,
		env.CHAIN,
	);
	const { data: reserveToken } = useToken(
		env.ARENA_ABC_RESERVE_DENOM,
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

	const spotPrice = Number(dumpState.curve_info.spot_price) * 1e6;

	const getMintPrice = () => {
		if (dumpState.phase_config.phase === "open") {
			const entryFee = Number(
				dumpState.phase_config.phase_config.open.entry_fee,
			);
			return (spotPrice / (1 - entryFee)).toString();
		}
		return spotPrice.toString();
	};

	const getBurnPrice = () => {
		if (dumpState.phase_config.phase === "open") {
			const exitFee = Number(dumpState.phase_config.phase_config.open.exit_fee);
			return (spotPrice / (1 - exitFee)).toFixed(6);
		}
		return spotPrice.toFixed(6);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
				<Card>
					<CardHeader className="flex items-center">
						<h2 className="text-2xl">Token Information</h2>
						<Tooltip content="Effective prices are calculated from the bonding curve state and friction fees">
							<span className="ml-2 cursor-help">
								<FiInfo />
							</span>
						</Tooltip>
					</CardHeader>
					<CardBody>
						<Table hideHeader removeWrapper aria-label="Token Information">
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
											denomOrAddress={env.ARENA_ABC_SUPPLY_DENOM}
											isNative
											amount={BigInt(dumpState.curve_info.supply)}
										/>
									</TableCell>
								</TableRow>
								<TableRow key="reserve">
									<TableCell>Current Reserve</TableCell>
									<TableCell>
										<TokenInfo
											denomOrAddress={env.ARENA_ABC_RESERVE_DENOM}
											isNative
											amount={BigInt(dumpState.curve_info.reserve)}
										/>
									</TableCell>
								</TableRow>
								<TableRow key="effectiveMintPrice">
									<TableCell>Effective Mint Price</TableCell>
									<TableCell>
										<TokenInfo
											denomOrAddress={env.ARENA_ABC_RESERVE_DENOM}
											isNative
											amount={getMintPrice()}
										/>
									</TableCell>
								</TableRow>

								<TableRow key="effectiveBurnPrice">
									<TableCell>Effective Burn Price</TableCell>
									<TableCell>
										<TokenInfo
											denomOrAddress={env.ARENA_ABC_SUPPLY_DENOM}
											isNative
											amount={getBurnPrice()}
										/>
									</TableCell>
								</TableRow>
								<TableRow key="maxSupply">
									<TableCell>Max Supply</TableCell>
									<TableCell>
										{dumpState.max_supply ? (
											<TokenInfo
												denomOrAddress={env.ARENA_ABC_SUPPLY_DENOM}
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
					<CardHeader className="flex justify-between">
						<h2 className="text-2xl">Token Actions</h2>
						<Tooltip content="Start the team onboarding process">
							<Button
								as={Link}
								href="/dao/token/gateway"
								color="primary"
								aria-label="Go to team onboarding page"
								variant="shadow"
								showAnchorIcon
							>
								Team Onboarding
							</Button>
						</Tooltip>
					</CardHeader>
					<CardBody>
						<Tabs aria-label="Token Actions" variant="bordered">
							<Tab
								key="mint"
								title={
									<div className="flex items-center space-x-2">
										<BsCoin size={20} />
										<span className="font-semibold">Mint</span>
									</div>
								}
							>
								<div className="flex flex-col gap-6 pt-6">
									<Input
										label="Mint Amount"
										placeholder="Enter amount to mint"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										type="number"
										labelPlacement="outside"
										endContent={
											<TokenInfo
												denomOrAddress={env.ARENA_ABC_RESERVE_DENOM}
												isNative
												className="align-middle"
											/>
										}
										size="lg"
									/>
									<div className="flex justify-end">
										<Button
											color="success"
											variant="shadow"
											onPress={() => openConfirmModal("mint")}
											isDisabled={dumpState.is_paused}
											className="font-semibold"
											startContent={<BsCoin size={18} />}
										>
											Mint Tokens
										</Button>
									</div>
								</div>
							</Tab>
							<Tab
								key="burn"
								title={
									<div className="flex items-center space-x-2">
										<BsFire size={20} />
										<span className="font-semibold">Burn</span>
									</div>
								}
							>
								<div className="flex flex-col gap-6 pt-6">
									<Input
										label="Burn Amount"
										placeholder="Enter amount to burn"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										type="number"
										labelPlacement="outside"
										endContent={
											<TokenInfo
												denomOrAddress={env.ARENA_ABC_SUPPLY_DENOM}
												isNative
												className="align-middle"
											/>
										}
										size="lg"
									/>
									<div className="flex justify-end">
										<Button
											color="danger"
											variant="shadow"
											onPress={() => openConfirmModal("burn")}
											isDisabled={dumpState.is_paused}
											className="font-semibold"
											startContent={<BsFire size={18} />}
										>
											Burn Tokens
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
