"use client";

import TokenAmount from "@/components/TokenAmount";
import TokenInfo from "@/components/TokenInfo";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Progress,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@nextui-org/react";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { ArenaFundraiseQueryClient } from "~/codegen/ArenaFundraise.client";
import { useArenaFundraiseDumpStateQuery } from "~/codegen/ArenaFundraise.react-query";
import { useEnv } from "~/hooks/useEnv";
import type { WithClient } from "~/types/util";

interface FundraiseInfo {
	fundraiseAddress?: string;
}

interface TableItem {
	label: string;
	denom: string;
	amount: string;
}

const FundraiseInfo = ({
	fundraiseAddress,
	cosmWasmClient,
}: WithClient<FundraiseInfo>) => {
	const { data: env } = useEnv();
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const { data, isLoading } = useArenaFundraiseDumpStateQuery({
		// biome-ignore lint/style/noNonNullAssertion: Checked by react-query enabled flag
		client: new ArenaFundraiseQueryClient(cosmWasmClient, fundraiseAddress!),
		args: {
			addr: address,
		},
		options: { enabled: !!fundraiseAddress },
	});

	const routeAction = async () => {
		try {
			if (!data) throw "Data is not loaded";
			if (!address) throw "Could not get user address";

			throw "Not implemented yet";
			// biome-ignore lint/suspicious/noExplicitAny: try-catch
		} catch (e: any) {
			console.error(e);
			toast.error(e.toString());
		}
	};

	const tableItems: TableItem[] = useMemo(() => {
		if (!data) return [];
		const result = [
			{
				label: "Total Deposited",
				denom: data.config.deposit_denom,
				amount: data.total_deposited,
			},
			{
				label: "Soft Cap",
				denom: data.config.deposit_denom,
				amount: data.config.soft_cap,
			},
		];

		if (data.config.hard_cap)
			result.push({
				label: "Hard Cap",
				denom: data.config.deposit_denom,
				amount: data.config.hard_cap,
			});

		if (data.deposit)
			result.push({
				label: "User Deposit",
				denom: data.config.deposit_denom,
				amount: data.deposit,
			});
		if (data.reward)
			result.push({
				label: data.config.state === "active" ? "Expected Reward" : "Reward",
				denom: data.config.fundraise.denom,
				amount: data.reward,
			});

		return result;
	}, [data]);

	return (
		<Skeleton isLoaded={!isLoading}>
			<Card>
				<CardHeader>Fundraise Amount</CardHeader>
				{data && (
					<CardBody>
						<TokenInfo
							denomOrAddress={data.config.fundraise.denom}
							cosmWasmClient={cosmWasmClient}
						/>
						<TokenAmount
							amount={BigInt(data.config.fundraise.amount)}
							denomOrAddress={data.config.fundraise.denom}
							cosmWasmClient={cosmWasmClient}
						/>
					</CardBody>
				)}
			</Card>
			<Card>
				<CardHeader>Progress</CardHeader>
				<CardBody className="space-y-4">
					<Table aria-label="Progress" removeWrapper>
						<TableHeader>
							<TableRow>
								<TableColumn>Label</TableColumn>
								<TableColumn>Denom</TableColumn>
								<TableColumn>Amount</TableColumn>
							</TableRow>
						</TableHeader>
						<TableBody items={tableItems}>
							{(item) => (
								<TableRow key={item.label}>
									<TableCell>{item.label}</TableCell>
									<TableCell>
										<TokenInfo
											denomOrAddress={item.denom}
											cosmWasmClient={cosmWasmClient}
										/>
									</TableCell>
									<TableCell>
										<TokenAmount
											amount={BigInt(item.amount)}
											denomOrAddress={item.denom}
											cosmWasmClient={cosmWasmClient}
										/>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
					{data && (
						<Progress
							color="primary"
							label="Soft Cap Goal"
							aria-label="Soft Cap Goal"
							showValueLabel
							maxValue={Number(data.config.soft_cap)}
							value={Number(data.total_deposited)}
						/>
					)}
				</CardBody>
				<CardFooter>
					<Button
						onClick={routeAction}
						isDisabled={
							data?.config.state === "active"
								? data.has_started === false
								: false
						}
					>
						{data?.config.state === "active" ? "Deposit" : "Withdraw"}
					</Button>
					{data?.has_expired === true && data.config.state === "active" && (
						<Button>Expire</Button>
					)}
				</CardFooter>
			</Card>
		</Skeleton>
	);
};

export default FundraiseInfo;
