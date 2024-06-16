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
} from "@nextui-org/react";
import type { BalanceVerified } from "~/codegen/ArenaEscrow.types";

interface BalanceDisplayProps {
	balance: BalanceVerified;
}

const BalanceDisplay = ({ balance }: BalanceDisplayProps) => {
	return (
		<>
			{balance.native.length > 0 && (
				<Table removeWrapper aria-label="Native Balance">
					<TableHeader>
						<TableColumn className="w-1/2">Native Token</TableColumn>
						<TableColumn className="text-right">Amount</TableColumn>
					</TableHeader>
					<TableBody>
						{balance.native.map((x) => (
							<TableRow key={x.denom}>
								<TableCell className="w-1/2">
									<TokenInfo denomOrAddress={x.denom} isNative />
								</TableCell>
								<TableCell className="text-right">
									<TokenAmount
										amount={BigInt(x.amount)}
										denomOrAddress={x.denom}
										isNative
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
			{balance.cw20.length > 0 && (
				<Table removeWrapper aria-label="Cw20 Balance">
					<TableHeader>
						<TableColumn className="w-1/2">Cw20 Token</TableColumn>
						<TableColumn className="text-right">Amount</TableColumn>
					</TableHeader>
					<TableBody>
						{balance.cw20.map((x) => (
							<TableRow key={x.address}>
								<TableCell className="w-1/2">
									<TokenInfo denomOrAddress={x.address} isNative />
								</TableCell>
								<TableCell className="text-right">
									<TokenAmount
										amount={BigInt(x.amount)}
										denomOrAddress={x.address}
										isNative
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
