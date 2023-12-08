import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { CardHeader, Heading, SimpleGrid, Button, Box } from "@chakra-ui/react";
import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";
import { BalanceCard } from "@components/cards/BalanceCard";
import { ArenaEscrowQueryClient } from "@arena/ArenaEscrow.client";
import { useState, useEffect, SetStateAction, Dispatch } from "react";
import { useArenaEscrowDuesQuery } from "@arena/ArenaEscrow.react-query";

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
}

function DuesSection({
  cosmwasmClient,
  escrow_addr,
  startAfter,
  setIsEmptyData,
  setLastDue,
  setIsLoading,
  balanceChanged,
}: DuesDisplaySectionProps) {
  const { data, refetch } = useArenaEscrowDuesQuery({
    client: new ArenaEscrowQueryClient(cosmwasmClient, escrow_addr),
    args: { startAfter: startAfter },
  });

  useEffect(() => {
    if (data && "length" in data) {
      if (data.length > 0) setLastDue(data[data.length - 1]!.addr);
      setIsEmptyData(data.length == 0);
      setIsLoading(false);
    }
  }, [data, setLastDue, setIsEmptyData, setIsLoading]);
  useEffect(() => {
    refetch();
  }, [balanceChanged, refetch]);

  if (!data || data.length == 0) return null;

  return (
    <>
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

  // Reset state
  useEffect(() => {
    setPages([undefined]);
    setIsEmptyData(true);
    setLastDue(undefined);
    setIsLoading(false);
  }, [balanceChanged]);

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
