import {
  ArenaEscrowClient,
  ArenaEscrowQueryClient,
} from "@arena/ArenaEscrow.client";
import { useArenaEscrowBalanceQuery } from "@arena/ArenaEscrow.react-query";
import { CompetitionStatus } from "@arena/ArenaWagerModule.types";
import {
  Button,
  CardHeader,
  Heading,
  Skeleton,
  useToast,
} from "@chakra-ui/react";
import { BalanceCard } from "@components/cards/BalanceCard";
import env from "@config/env";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react-lite";
import { useEffect, useState } from "react";

interface WagerViewBalanceCardProps {
  cosmwasmClient: CosmWasmClient;
  escrow_address: string;
  address: string;
  status: CompetitionStatus;
  notifyBalancesChanged: () => void;
  balanceChanged: number;
}

export function WagerViewBalanceCard({
  cosmwasmClient,
  escrow_address,
  address,
  status,
  notifyBalancesChanged,
  balanceChanged,
}: WagerViewBalanceCardProps) {
  const { data, isLoading, isError, refetch } = useArenaEscrowBalanceQuery({
    client: new ArenaEscrowQueryClient(cosmwasmClient, escrow_address),
    args: { addr: address },
  });
  const { getSigningCosmWasmClient } = useChain(env.CHAIN);
  const [hasWithdrawn, setHasWithdrawn] = useState<boolean>(false);
  const toast = useToast();
  useEffect(() => {
    refetch();
    setHasWithdrawn(false);
  }, [refetch, balanceChanged]);

  const withdrawFunds = async () => {
    try {
      let cosmwasmClient = await getSigningCosmWasmClient();
      if (!cosmwasmClient) {
        throw "Could not get the CosmWasm client";
      }

      const arenaEscrowClient = new ArenaEscrowClient(
        cosmwasmClient,
        address,
        escrow_address
      );

      await arenaEscrowClient.withdraw({});
      toast({
        title: "Success",
        status: "success",
        description: "The funds have been successfully withdrawn",
        isClosable: true,
      });
      setHasWithdrawn(true);
      notifyBalancesChanged();
    } catch (e: any) {
      toast({
        status: "error",
        title: "Error",
        description: e.toString(),
        isClosable: true,
      });
    }
  };
  if (
    isError ||
    hasWithdrawn ||
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
              <Heading size="md">User Balance</Heading>
            </CardHeader>
          }
          variant={"outline"}
          cosmwasmClient={cosmwasmClient}
          balance={data}
          actions={
            status !== "active" &&
            status !== "jailed" && (
              <Button onClick={withdrawFunds}>Withdraw</Button>
            )
          }
        />
      )}
    </Skeleton>
  );
}
