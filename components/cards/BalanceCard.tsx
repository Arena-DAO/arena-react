import { Card, CardBody, CardFooter, CardProps } from "@chakra-ui/card";
import { Heading, Stack, StackDivider } from "@chakra-ui/layout";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { ReactNode } from "react";
import { BalanceVerified } from "~/ts-codegen/arena/ArenaEscrow.types";
import { Cw20Card } from "./Cw20Card";
import { Cw721Card } from "./Cw721Card";
import { NativeCard } from "./NativeCard";

interface BalanceCardProps extends CardProps {
	header?: ReactNode;
	addrCard?: ReactNode;
	balance: BalanceVerified;
	cosmwasmClient: CosmWasmClient;
	actions?: ReactNode;
}

export function BalanceCard({
	header,
	addrCard,
	balance,
	cosmwasmClient,
	actions,
	...cardProps
}: BalanceCardProps) {
	const childCardProps: CardProps = { p: 4 };

	return (
		<Card {...cardProps}>
			{header}
			<CardBody>
				<Stack>
					{addrCard}
					<Stack divider={<StackDivider />}>
						{balance.native.length > 0 && (
							<Stack>
								<Heading size="xs">Native Tokens</Heading>
								{balance.native.map((x, i) => (
									<NativeCard
										key={i}
										denom={x.denom}
										amount={x.amount}
										{...childCardProps}
									/>
								))}
							</Stack>
						)}
						{balance.cw20.length > 0 && (
							<Stack>
								<Heading size="xs">Cw20 Tokens</Heading>
								{balance.cw20.map((x, i) => (
									<Cw20Card
										key={i}
										cosmwasmClient={cosmwasmClient}
										address={x.address}
										amount={x.amount}
										{...childCardProps}
									/>
								))}
							</Stack>
						)}
						{balance.cw721.length > 0 && (
							<Stack>
								<Heading size="xs">Cw721 Tokens</Heading>
								{balance.cw721.map((x, i) => (
									<Cw721Card
										key={i}
										cosmwasmClient={cosmwasmClient}
										address={x.address}
										token_ids={x.token_ids}
										{...childCardProps}
									/>
								))}
							</Stack>
						)}
					</Stack>
				</Stack>
			</CardBody>
			{actions && <CardFooter>{actions}</CardFooter>}
		</Card>
	);
}
