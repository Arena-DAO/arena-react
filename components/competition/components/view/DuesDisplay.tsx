import { Box, Button, CardHeader, Heading, SimpleGrid } from "@chakra-ui/react";
import { BalanceCard } from "@components/cards/BalanceCard";
import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import env from "~/config/env";
import { ArenaEscrowQueryClient } from "~/ts-codegen/arena/ArenaEscrow.client";
import { useArenaEscrowDuesQuery } from "~/ts-codegen/arena/ArenaEscrow.react-query";

interface DuesDisplayProps {
	cosmwasmClient: CosmWasmClient;
	escrow_addr: string;
	balanceChanged: number;
}

interface DuesDisplaySectionProps extends DuesDisplayProps {
	startAfter?: string;
	setLastDue: (id: string) => void;
	setIsEmptyData: Dispatch<SetStateAction<boolean>>;
	setIsLoading: Dispatch<SetStateAction<boolean>>;
	setHasLoadedData: Dispatch<SetStateAction<boolean>>;
}

function DuesSection({
	cosmwasmClient,
	escrow_addr,
	startAfter,
	setIsEmptyData,
	setLastDue,
	setIsLoading,
	balanceChanged,
	setHasLoadedData,
}: DuesDisplaySectionProps) {
	const { data, refetch } = useArenaEscrowDuesQuery({
		client: new ArenaEscrowQueryClient(cosmwasmClient, escrow_addr),
		args: { startAfter: startAfter },
	});

	useEffect(() => {
		if (data && "length" in data) {
			if (data.length > 0) setLastDue(data[data.length - 1]?.addr);
			setIsEmptyData(data.length < env.PAGINATION_LIMIT);
			setIsLoading(false);
			setHasLoadedData(true);
		}
	}, [data, setLastDue, setIsEmptyData, setIsLoading, setHasLoadedData]);
	useEffect(() => {
		refetch();
	}, [balanceChanged, refetch]);

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

export function DuesDisplay({
	cosmwasmClient,
	escrow_addr,
	balanceChanged,
}: DuesDisplayProps) {
	const [pages, setPages] = useState<[string | undefined]>([undefined]);
	const [isEmptyData, setIsEmptyData] = useState(true);
	const [lastDue, setLastDue] = useState<string | undefined>();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [hasLoadedData, setHasLoadedData] = useState<boolean>(false);

	// Reset state
	useEffect(() => {
		setPages([undefined]);
		setIsEmptyData(true);
		setLastDue(undefined);
		setIsLoading(false);
		setHasLoadedData(false);
	}, [balanceChanged]);

	if (hasLoadedData && lastDue === undefined) return null;

	return (
		<>
			<Heading size="lg">Dues</Heading>
			<SimpleGrid minChildWidth={"200px"} spacing="20px">
				{pages.map((page, index) => (
					<DuesSection
						key={index}
						cosmwasmClient={cosmwasmClient}
						escrow_addr={escrow_addr}
						startAfter={page}
						setLastDue={setLastDue}
						setIsEmptyData={setIsEmptyData}
						setIsLoading={setIsLoading}
						balanceChanged={balanceChanged}
						setHasLoadedData={setHasLoadedData}
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
