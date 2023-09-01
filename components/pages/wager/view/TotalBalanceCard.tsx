import { ArenaEscrowQueryClient } from "@arena/ArenaEscrow.client";
import { useArenaEscrowTotalBalanceQuery } from "@arena/ArenaEscrow.react-query";
import { CardHeader, Heading, Skeleton } from "@chakra-ui/react";
import { BalanceCard } from "@components/cards/BalanceCard";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useEffect } from "react";

interface WagerViewTotalBalanceCardProps {
  cosmwasmClient: CosmWasmClient;
  escrow_address: string;
  balanceChanged: number;
}

export function WagerViewTotalBalanceCard({
  cosmwasmClient,
  escrow_address,
  balanceChanged,
}: WagerViewTotalBalanceCardProps) {
  const { data, isLoading, isError, refetch } = useArenaEscrowTotalBalanceQuery(
    {
      client: new ArenaEscrowQueryClient(cosmwasmClient, escrow_address),
    }
  );
  useEffect(() => {
    refetch();
  }, [refetch, balanceChanged]);

  if (
    isError ||
    (data &&
      data.cw20.length == 0 &&
      data.native.length == 0 &&
      data.cw721.length == 0)
  )
    return <></>;
  return (
    <Skeleton isLoaded={!isLoading}>
      {data && (
        <BalanceCard
          header={
            <CardHeader>
              <Heading size="md">Total Balance</Heading>
            </CardHeader>
          }
          variant={"outline"}
          cosmwasmClient={cosmwasmClient}
          balance={data}
        />
      )}
    </Skeleton>
  );
}
