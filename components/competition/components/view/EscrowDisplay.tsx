import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DuesDisplay } from "./DuesDisplay";
import { useChain } from "@cosmos-kit/react";
import env from "@config/env";
import { useCallback, useEffect, useState } from "react";
import { CompetitionStatus } from "@arena/ArenaWagerModule.types";
import { useArenaEscrowDumpStateQuery } from "@arena/ArenaEscrow.react-query";
import {
  ArenaEscrowClient,
  ArenaEscrowQueryClient,
} from "@arena/ArenaEscrow.client";
import {
  Button,
  CardHeader,
  Heading,
  Skeleton,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { BalanceCard } from "@components/cards/BalanceCard";
import { isBalanceEmpty } from "~/helpers/ArenaHelpers";

interface EscrowDisplayProps {
  cosmwasmClient: CosmWasmClient;
  escrow_addr: string;
  wager_id: string;
  wager_status: CompetitionStatus;
  notifyIsActive: () => void;
}

export function EscrowDisplay({
  cosmwasmClient,
  escrow_addr,
  wager_id,
  wager_status,
  notifyIsActive,
}: EscrowDisplayProps) {
  const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
  const [balanceChanged, setBalanceChanged] = useState<number>(0);
  const notifyBalancesChanged = useCallback(
    () => setBalanceChanged((prev) => prev + 1),
    []
  );
  const { data, isLoading, isError, refetch } = useArenaEscrowDumpStateQuery({
    client: new ArenaEscrowQueryClient(cosmwasmClient, escrow_addr),
    args: { addr: address },
  });
  const toast = useToast();

  useEffect(() => {
    if (isError) {
      toast({
        status: "error",
        title: "Error",
        description: "Could not get escrow state",
      });
    }
  }, [isError, toast]);
  useEffect(() => {
    refetch();
  }, [balanceChanged, refetch]);

  const withdrawFunds = async () => {
    try {
      let cosmwasmClient = await getSigningCosmWasmClient();
      if (!cosmwasmClient) {
        throw "Could not get the CosmWasm client";
      }
      if (!address) {
        throw "Could not get user address";
      }

      const arenaEscrowClient = new ArenaEscrowClient(
        cosmwasmClient,
        address,
        escrow_addr
      );

      await arenaEscrowClient.withdraw({});
      toast({
        title: "Success",
        status: "success",
        description: "The funds have been successfully withdrawn",
        isClosable: true,
      });
      await refetch();
    } catch (e: any) {
      toast({
        status: "error",
        title: "Error",
        description: e.toString(),
        isClosable: true,
      });
    }
  };

  if (isError) return null;
  return (
    <Skeleton isLoaded={!isLoading}>
      {data && (
        <Stack>
          <DuesDisplay
            cosmwasmClient={cosmwasmClient}
            escrow_addr={escrow_addr}
            notifyBalancesChanged={notifyBalancesChanged}
            wager_id={wager_id}
            notifyIsActive={notifyIsActive}
            initial_dues={data.dues}
          />
          {!isBalanceEmpty(data.balance) && (
            <BalanceCard
              header={
                <CardHeader>
                  <Heading size="md">User Balance</Heading>
                </CardHeader>
              }
              variant={"outline"}
              cosmwasmClient={cosmwasmClient}
              balance={data.balance}
              actions={
                wager_status !== "active" &&
                wager_status !== "jailed" && (
                  <Button onClick={withdrawFunds}>Withdraw</Button>
                )
              }
            />
          )}
          {!isBalanceEmpty(data.total_balance) && (
            <BalanceCard
              header={
                <CardHeader>
                  <Heading size="md">Total Balance</Heading>
                </CardHeader>
              }
              variant={"outline"}
              cosmwasmClient={cosmwasmClient}
              balance={data.total_balance}
            />
          )}
        </Stack>
      )}
    </Skeleton>
  );
}
