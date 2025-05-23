"use client";

import TokenAmount from "@/components/TokenAmount";
import TokenInfo from "@/components/TokenInfo";
import {
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import type { BalanceVerified } from "~/codegen/ArenaEscrow.types";

interface BalanceDisplayProps {
	balance: BalanceVerified;
}

const BalanceDisplay = ({ balance }: BalanceDisplayProps) => {
	return (
		<>
			{balance.native && Object.keys(balance.native).length > 0 && (
				<Table removeWrapper aria-label="Native Balance">
					<TableHeader>
						<TableColumn className="w-1/2">Native Token</TableColumn>
						<TableColumn className="text-right">Amount</TableColumn>
					</TableHeader>
					<TableBody>
						{Object.entries(balance.native).map(([denom, amount]) => {
							// Normalize the data
							if (typeof amount !== "string") {
								const parsed = amount as unknown as {
									denom: string;
									amount: string;
								};
								denom = parsed.denom;
								amount = parsed.amount;
							}
							return (
								<TableRow key={denom}>
									<TableCell className="w-1/2">
										<TokenInfo denomOrAddress={denom} isNative />
									</TableCell>
									<TableCell className="text-right">
										<TokenAmount
											amount={BigInt(amount)}
											denomOrAddress={denom}
											isNative
										/>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			)}
			{balance.cw20 && Object.keys(balance.cw20).length > 0 && (
				<Table removeWrapper aria-label="Cw20 Balance">
					<TableHeader>
						<TableColumn className="w-1/2">Cw20 Token</TableColumn>
						<TableColumn className="text-right">Amount</TableColumn>
					</TableHeader>
					<TableBody>
						{Object.entries(balance.cw20).map(([address, amount]) => (
							<TableRow key={address}>
								<TableCell className="w-1/2">
									<TokenInfo denomOrAddress={address} />
								</TableCell>
								<TableCell className="text-right">
									<TokenAmount
										amount={BigInt(amount)}
										denomOrAddress={address}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</>
	);
};

export default BalanceDisplay;
