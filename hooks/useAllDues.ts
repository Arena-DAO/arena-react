import { ArenaEscrowQueryClient } from "@arena/ArenaEscrow.client";
import { ArrayOfMemberBalanceVerified } from "@arena/ArenaEscrow.types";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useState, useEffect } from "react";

export function useAllDues(
  cosmwasmClient: CosmWasmClient,
  escrow_addr: string,
  initial_dues: ArrayOfMemberBalanceVerified = []
) {
  const [allDues, setAllDues] =
    useState<ArrayOfMemberBalanceVerified>(initial_dues);
  const [startAfter, setStartAfter] = useState<string | undefined>(
    initial_dues.length > 0
      ? initial_dues[initial_dues.length - 1]?.addr
      : undefined
  );
  const [hasMore, setHasMore] = useState(true);
  useEffect(() => {
    setStartAfter(
      initial_dues.length > 0
        ? initial_dues[initial_dues.length - 1]?.addr
        : undefined
    );
    setAllDues(initial_dues);
    setHasMore(true);
  }, [initial_dues]);
  useEffect(() => {
    async function fetchDues() {
      if (!hasMore) return;

      const client = new ArenaEscrowQueryClient(cosmwasmClient, escrow_addr);
      const data = await client.dues({ startAfter });

      if (data && data.length > 0) {
        setAllDues((prev) => [...prev, ...data]);
        setStartAfter(data[data.length - 1]!.addr);
      } else {
        setHasMore(false);
      }
    }

    fetchDues();
  }, [cosmwasmClient, escrow_addr, startAfter, hasMore]);

  return allDues;
}
