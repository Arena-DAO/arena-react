import {
  CosmWasmClient,
  ExecuteInstruction,
  toBinary,
} from "@cosmjs/cosmwasm-stargate";
import { useArenaEscrowDuesQuery } from "@arena/ArenaEscrow.react-query";
import { ArenaEscrowQueryClient } from "@arena/ArenaEscrow.client";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  CardHeader,
  Heading,
  Skeleton,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";
import { BalanceCard } from "@components/cards/BalanceCard";
import { ExponentInfo } from "~/types/ExponentInfo";
import { useChain } from "@cosmos-kit/react-lite";
import env from "@config/env";
import { BalanceVerified } from "@arena/ArenaEscrow.types";
import { ExecuteMsg as ArenaEscrowExecuteMsg } from "@arena/ArenaEscrow.types";
import { ExecuteMsg as Cw20ExecuteMsg } from "@cw-plus/Cw20Base.types";
import { ExecuteMsg as Cw721ExecuteMsg } from "@cw-nfts/Cw721Base.types";
import { CosmosMsgForEmpty } from "@dao/DaoProposalSingle.types";
import { getProposalAddr } from "~/helpers/DAOHelpers";
import { DaoProposalSingleClient } from "@dao/DaoProposalSingle.client";
import { DaoPreProposeSingleClient } from "@dao/DaoPreProposeSingle.client";

interface WagerViewDuesInnerProps {
  cosmwasmClient: CosmWasmClient;
  start_after: string | null;
  setLastPage: (page: string) => void;
  escrow_addr: string;
  wager_id: string;
  notifyBalancesChanged: () => void;
  notifyIsActive: () => void;
  balanceChanged: number;
}

interface WagerViewDuesDisplayProps {
  cosmwasmClient: CosmWasmClient;
  escrow_addr: string;
  balanceChanged: number;
  wager_id: string;
  notifyBalancesChanged: () => void;
  notifyIsActive: () => void;
}

function WagerViewDuesInner({
  cosmwasmClient,
  start_after,
  setLastPage,
  escrow_addr,
  wager_id,
  notifyBalancesChanged,
  notifyIsActive,
  balanceChanged,
}: WagerViewDuesInnerProps) {
  const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
  const { data, isLoading, isError, refetch } = useArenaEscrowDuesQuery({
    client: new ArenaEscrowQueryClient(cosmwasmClient, escrow_addr),
    args: { startAfter: start_after ?? undefined },
  });
  const toast = useToast();
  const [exponentInfo, setExponentInfo] = useState<ExponentInfo>();
  useEffect(() => {
    if (data && data.length > 0) {
      setLastPage(data[data.length - 1]![0]);
    }
  }, [setLastPage, data]);
  useEffect(() => {
    refetch();
  }, [balanceChanged, refetch]);

  const depositFunds = async (team_addr: string, balance: BalanceVerified) => {
    try {
      if (!address) {
        throw "Wallet is not connected";
      }
      if (!exponentInfo) {
        throw "Could not determine exponent info";
      }
      let cosmwasmClient = await getSigningCosmWasmClient();
      if (!cosmwasmClient) {
        throw "Could not get the CosmWasm client";
      }

      let msgs: ExecuteInstruction[] = [];
      if (balance.native.length > 0)
        msgs.push({
          contractAddress: escrow_addr,
          msg: {
            receive_native: {},
          } as ArenaEscrowExecuteMsg,
          funds: balance.native,
        });
      if (balance.cw20.length > 0) {
        balance.cw20.map((x) => {
          msgs.push({
            contractAddress: x.address,
            msg: {
              send: {
                amount: x.amount,
                contract: escrow_addr,
              },
            } as Cw20ExecuteMsg,
          });
        });
      }
      if (balance.cw721.length > 0) {
        balance.cw721.map((x) => {
          x.token_ids.map((token_id) => {
            msgs.push({
              contractAddress: x.addr,
              msg: {
                send_nft: {
                  contract: escrow_addr,
                  token_id,
                },
              } as Cw721ExecuteMsg,
            });
          });
        });
      }

      // If address is a wallet, just send. If address is a DAO, create a proposal to send.
      if (team_addr == address) {
        let result = await cosmwasmClient.executeMultiple(
          address,
          msgs,
          "auto"
        );

        let is_active = !!result.events.find((x) =>
          x.attributes.find((y) => y.key == "action" && y.value == "activate")
        );

        if (is_active) {
          notifyIsActive();
        }

        toast({
          status: "success",
          title: "Success",
          description: "Funds have been successfully sent to the escrow",
          isClosable: true,
        });
      } else if (team_addr.length == 63) {
        const proposalAddrResponse = await getProposalAddr(
          cosmwasmClient,
          team_addr,
          address
        );

        if (!proposalAddrResponse) {
          toast({
            status: "error",
            title: "Error",
            description: "Could not find a valid proposal module for the DAO",
            isClosable: true,
          });
          return;
        }

        const proposal_title = `Fund Wager ${wager_id}`;
        const proposal_description =
          "Send funds to the wager's escrow address.";
        let proposal_msgs = msgs.map((x) => {
          return {
            wasm: {
              execute: {
                contract_addr: x.contractAddress,
                funds: x.funds,
                msg: toBinary(x.msg),
              },
            },
          } as CosmosMsgForEmpty;
        });
        if (proposalAddrResponse.type == "proposal_module") {
          let daoProposalClient = new DaoProposalSingleClient(
            cosmwasmClient,
            address!,
            proposalAddrResponse.addr
          );

          await daoProposalClient.propose({
            title: proposal_title,
            description: proposal_description,
            msgs: proposal_msgs,
          });
        } else if (proposalAddrResponse.type == "prepropose") {
          let preProposeClient = new DaoPreProposeSingleClient(
            cosmwasmClient,
            address!,
            proposalAddrResponse.addr
          );

          await preProposeClient.propose({
            msg: {
              propose: {
                title: proposal_title,
                description: proposal_description,
                msgs: proposal_msgs,
              },
            },
          });
        }

        toast({
          status: "success",
          title: "Success",
          description:
            "A proposal to send funds has sucessfully been generated",
          isClosable: true,
        });
      }

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
              onDataLoaded={setExponentInfo}
              actions={
                (address == x[0] || x[0].length == 63) && (
                  <Button onClick={() => depositFunds(x[0], x[1])}>
                    Deposit
                  </Button>
                )
              }
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
  wager_id,
  notifyBalancesChanged,
  notifyIsActive,
  balanceChanged,
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
  useEffect(() => {
    setPages(new Set<string | null>([null]));
    setHasFetched(false);
  }, [setPages, balanceChanged]);

  if (hasFetched && pages.size == 1) return null;

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
            wager_id={wager_id}
            notifyBalancesChanged={notifyBalancesChanged}
            balanceChanged={balanceChanged}
            notifyIsActive={notifyIsActive}
          />
        );
      })}
    </>
  );
}
