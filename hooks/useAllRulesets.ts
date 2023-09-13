import { ArenaCoreQueryClient } from "@arena/ArenaCore.client";
import { Ruleset } from "@arena/ArenaCore.types";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useState, useEffect } from "react";

export function useAllRulesets(
  cosmwasmClient: CosmWasmClient,
  arena_core_addr: string,
  setRulesetsCount?: (count: number) => void
) {
  const [allRulesets, setAllRulesets] = useState<Ruleset[]>([]);
  const [startAfter, setStartAfter] = useState<string>();
  const [hasMore, setHasMore] = useState(true);
  useEffect(() => {
    async function fetchRulesets() {
      if (!hasMore) return;

      const client = new ArenaCoreQueryClient(cosmwasmClient, arena_core_addr);
      const data = (await client.queryExtension({
        msg: { rulesets: { start_after: startAfter } },
      })) as unknown as Ruleset[];

      if (data && data.length > 0) {
        setAllRulesets((prev) => [...prev, ...data]);
        setStartAfter(data[data.length - 1]!.id);
      } else {
        setHasMore(false);
        setRulesetsCount?.(allRulesets.length);
      }
    }

    fetchRulesets();
  }, [cosmwasmClient, arena_core_addr, startAfter, hasMore, setRulesetsCount]);

  return allRulesets;
}
