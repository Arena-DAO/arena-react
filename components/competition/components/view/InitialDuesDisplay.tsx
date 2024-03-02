import { Box, Button, CardHeader, Heading, SimpleGrid } from "@chakra-ui/react";
import { BalanceCard } from "@components/cards/BalanceCard";
import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import env from "~/config/env";
import { ArenaEscrowQueryClient } from "~/ts-codegen/arena/ArenaEscrow.client";
import { useArenaEscrowInitialDuesQuery } from "~/ts-codegen/arena/ArenaEscrow.react-query";

interface DuesDisplayProps {
	cosmwasmClient: CosmWasmClient;
	escrow_addr: string;
}

interface DuesDisplaySectionProps extends DuesDisplayProps {
	startAfter?: string;
	setLastDue: (id: string) => void;
	setIsEmptyData: Dispatch<SetStateAction<boolean>>;
	setIsLoading: Dispatch<SetStateAction<boolean>>;
}

function InitialDuesSection({
	cosmwasmClient,
	escrow_addr,
	startAfter,
	setIsEmptyData,
	setLastDue,
	setIsLoading,
}: DuesDisplaySectionProps) {
	const { data } = useArenaEscrowInitialDuesQuery({
		client: new ArenaEscrowQueryClient(cosmwasmClient, escrow_addr),
		args: { startAfter: startAfter },
	});

	useEffect(() => {
		if (data && "length" in data) {
			if (data.length > 0) setLastDue(data[data.length - 1]?.addr);
			setIsEmptyData(data.length < env.PAGINATION_LIMIT);
			setIsLoading(false);
		}
	}, [data, setLastDue, setIsEmptyData, setIsLoading]);

	if (!data || data.length === 0) return null;

	return (
		<>
			{data?.map((x, i) => {
				return (
					<BalanceCard
						key={i}
						header={
							<CardHeader pb="0">
								<Heading size="md">Team {i + 1}</Heading>
							</CardHeader>
						}
						cosmwasmClient={cosmwasmClient}
						addrCard={
							<UserOrDAOCard cosmwasmClient={cosmwasmClient} address={x.addr} />
						}
						balance={x.balance}
						variant={"outline"}
					/>
				);
			})}
		</>
	);
}

export function InitialDuesDisplay({
	cosmwasmClient,
	escrow_addr,
}: DuesDisplayProps) {
	const [pages, setPages] = useState<[string | undefined]>([undefined]);
	const [isEmptyData, setIsEmptyData] = useState(true);
	const [lastDue, setLastDue] = useState<string | undefined>();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	return (
		<>
			<Heading size="lg">Initial Dues</Heading>
			<SimpleGrid minChildWidth={"200px"} spacing="20px">
				{pages.map((page, index) => (
					<InitialDuesSection
						key={index}
						cosmwasmClient={cosmwasmClient}
						escrow_addr={escrow_addr}
						startAfter={page}
						setLastDue={setLastDue}
						setIsEmptyData={setIsEmptyData}
						setIsLoading={setIsLoading}
					/>
				))}
			</SimpleGrid>
			{!isEmptyData && (
				<Box textAlign="right">
					<Button
						aria-label="Load more"
						variant="ghost"
						isLoading={isLoading}
						onClick={() => {
							if (lastDue) {
								setIsLoading(true);
								setPages((x) => {
									x.push(lastDue);
									return x;
								});
							}
						}}
					>
						Load More...
					</Button>
				</Box>
			)}
		</>
	);
}
