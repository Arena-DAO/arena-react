import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import {
  useArenaEscrowBalancesQuery,
  useArenaEscrowDuesQuery,
} from "@arena/ArenaEscrow.react-query";
import { ArenaEscrowQueryClient } from "@arena/ArenaEscrow.client";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Skeleton,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import { NativeCard } from "@components/cards/NativeCard";
import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";
import { BalanceCard } from "@components/cards/BalanceCard";

interface WagerViewDuesInner {
  cosmwasmClient: CosmWasmClient;
  start_after: string | null;
  setLastPage: (page: string) => void;
  escrow_addr: string;
}

interface WagerViewDuesDisplayProps {
  cosmwasmClient: CosmWasmClient;
  escrow_addr: string;
}

function WagerViewDuesInner({
  cosmwasmClient,
  start_after,
  setLastPage,
  escrow_addr,
}: WagerViewDuesInner) {
  const { data, isLoading, isError } = useArenaEscrowDuesQuery({
    client: new ArenaEscrowQueryClient(cosmwasmClient, escrow_addr),
    args: { startAfter: start_after ?? undefined },
  });
  useEffect(() => {
    if (data && data.length > 0) {
      setLastPage(data[data.length - 1]![0]);
    }
  }, [setLastPage, data]);
  if (isError)
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Could not retrieve balances.</AlertDescription>
      </Alert>
    );
  return (
    <Skeleton isLoaded={!isLoading}>
      <Stack>
        {data?.map((x, i) => {
          return (
            <BalanceCard
              key={i}
              header={
                <CardHeader>
                  <Heading size="md">Team {i + 1}</Heading>
                </CardHeader>
              }
              cosmwasmClient={cosmwasmClient}
              addrCard={
                <UserOrDAOCard cosmwasmClient={cosmwasmClient} address={x[0]} />
              }
              balance={x[1]}
              variant={"outline"}
            />
          );
        })}
      </Stack>
    </Skeleton>
  );
}

export function WagerViewDuesDisplay({
  cosmwasmClient,
  escrow_addr,
}: WagerViewDuesDisplayProps) {
  const [pages, setPages] = useState<Set<string | null>>(
    new Set<string | null>([null])
  );
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const handleSetLastPage = useCallback((x: string | null) => {
    setPages((prevPages) => {
      const newPages = new Set(prevPages);
      newPages.add(x);
      return newPages;
    });
    setHasFetched(true);
  }, []);

  if (hasFetched && pages.size == 1) return <></>;

  return (
    <>
      <Heading size="md">Dues</Heading>
      {Array.from(pages).map((x, i) => {
        return (
          <WagerViewDuesInner
            key={i}
            start_after={x}
            escrow_addr={escrow_addr}
            cosmwasmClient={cosmwasmClient}
            setLastPage={handleSetLastPage}
          />
        );
      })}
    </>
  );
}
