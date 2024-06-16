import type { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import type { UseMutationResult } from "@tanstack/react-query";
import type { ArenaLeagueModuleProcessCompetitionMutation } from "~/codegen/ArenaLeagueModule.react-query";
import type { ArenaTournamentModuleProcessCompetitionMutation } from "~/codegen/ArenaTournamentModule.react-query";
import type { ArenaWagerModuleProcessCompetitionMutation } from "~/codegen/ArenaWagerModule.react-query";

export type CompetitionType = "wager" | "league" | "tournament";

export type UseCompetitionProcessMutationResult = UseMutationResult<
	ExecuteResult,
	Error,
	| ArenaWagerModuleProcessCompetitionMutation
	| ArenaLeagueModuleProcessCompetitionMutation
	| ArenaTournamentModuleProcessCompetitionMutation
>;
