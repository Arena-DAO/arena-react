import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import LeaderboardDisplay from "./LeaderboardDisplay";
import RoundsDisplay from "./RoundsDisplay";
import React from "react";

export interface LeagueExtensionProps {
  cosmwasmClient: CosmWasmClient;
  module_addr: string;
  id: string;
}

export default function LeagueExtension({
  cosmwasmClient,
  module_addr,
  id,
}: LeagueExtensionProps) {
  return (
    <>
      <LeaderboardDisplay
        cosmwasmClient={cosmwasmClient}
        module_addr={module_addr}
        id={id}
      />
      <RoundsDisplay
        cosmwasmClient={cosmwasmClient}
        module_addr={module_addr}
        id={id}
      />
    </>
  );
}
