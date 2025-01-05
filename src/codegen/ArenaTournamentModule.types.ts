/**
* This file was automatically generated by @cosmwasm/ts-codegen@1.12.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export interface InstantiateMsg {
  description: string;
  extension: Empty;
  key: string;
}
export interface Empty {
  [k: string]: unknown;
}
export type ExecuteMsg = {
  jail_competition: {
    competition_id: Uint128;
    description: string;
    distribution?: DistributionForString | null;
    title: string;
  };
} | {
  activate_competition: {};
} | {
  create_competition: {
    banner?: string | null;
    category_id?: Uint128 | null;
    description: string;
    escrow: EscrowContractInfo;
    expiration: Expiration;
    group_contract: GroupContractInfo;
    host?: string | null;
    instantiate_extension: TournamentInstantiateExt;
    name: string;
    rules?: string[] | null;
    rulesets?: Uint128[] | null;
  };
} | {
  submit_evidence: {
    competition_id: Uint128;
    evidence: string[];
  };
} | {
  process_competition: {
    competition_id: Uint128;
    distribution?: DistributionForString | null;
  };
} | {
  extension: {
    msg: ExecuteExt;
  };
} | {
  migrate_escrows: {
    escrow_code_id: number;
    escrow_migrate_msg: MigrateMsg;
    filter?: CompetitionsFilter | null;
    limit?: number | null;
    start_after?: Uint128 | null;
  };
} | {
  input_stats: {
    competition_id: Uint128;
    stats: MemberStatsMsg[];
  };
} | {
  update_stat_types: {
    competition_id: Uint128;
    to_add: StatType[];
    to_remove: string[];
  };
} | {
  update_ownership: Action;
};
export type Uint128 = string;
export type Decimal = string;
export type EscrowContractInfo = {
  existing: {
    additional_layered_fees?: FeeInformationForString[] | null;
    addr: string;
  };
} | {
  new: {
    additional_layered_fees?: FeeInformationForString[] | null;
    code_id: number;
    label: string;
    msg: Binary;
  };
};
export type Binary = string;
export type Expiration = {
  at_height: number;
} | {
  at_time: Timestamp;
} | {
  never: {};
};
export type Timestamp = Uint64;
export type Uint64 = string;
export type GroupContractInfo = {
  existing: {
    addr: string;
  };
} | {
  new: {
    info: ModuleInstantiateInfo;
  };
};
export type Admin = {
  address: {
    addr: string;
  };
} | {
  core_module: {};
};
export type EliminationType = "double_elimination" | {
  single_elimination: {
    play_third_place_match: boolean;
  };
};
export type ExecuteExt = {
  process_match: {
    match_results: MatchResultMsg[];
    tournament_id: Uint128;
  };
} | {
  instantiate_tournament: {};
};
export type MatchResult = "team1" | "team2";
export type MigrateMsg = MigrateBase;
export type CompetitionsFilter = {
  competition_status: {
    status: CompetitionStatus;
  };
} | {
  category: {
    id?: Uint128 | null;
  };
} | {
  host: string;
};
export type CompetitionStatus = ("pending" | "inactive") | {
  active: {
    activation_height: number;
  };
} | {
  jailed: {
    activation_height: number;
  };
};
export type StatMsg = {
  name: string;
  value: StatValue;
} | {
  height?: number | null;
  name: string;
  value: StatValue;
} | {
  aggregation_type?: StatAggregationType | null;
  name: string;
  value: StatValue;
};
export type StatValue = {
  bool: boolean;
} | {
  decimal: Decimal;
} | {
  uint: Uint128;
};
export type StatAggregationType = "average" | "cumulative";
export type StatValueType = "bool" | "decimal" | "uint";
export type Action = {
  transfer_ownership: {
    expiry?: Expiration | null;
    new_owner: string;
  };
} | "accept_ownership" | "renounce_ownership";
export interface DistributionForString {
  member_percentages: MemberPercentageForString[];
  remainder_addr: string;
}
export interface MemberPercentageForString {
  addr: string;
  percentage: Decimal;
}
export interface FeeInformationForString {
  cw20_msg?: Binary | null;
  cw721_msg?: Binary | null;
  receiver: string;
  tax: Decimal;
}
export interface ModuleInstantiateInfo {
  admin?: Admin | null;
  code_id: number;
  funds: Coin[];
  label: string;
  msg: Binary;
}
export interface Coin {
  amount: Uint128;
  denom: string;
  [k: string]: unknown;
}
export interface TournamentInstantiateExt {
  distribution: Decimal[];
  elimination_type: EliminationType;
}
export interface MatchResultMsg {
  match_number: Uint128;
  match_result: MatchResult;
}
export interface MemberStatsMsg {
  addr: string;
  stats: StatMsg[];
}
export interface StatType {
  aggregation_type?: StatAggregationType | null;
  is_beneficial: boolean;
  name: string;
  tie_breaker_priority?: number | null;
  value_type: StatValueType;
}
export type QueryMsg = {
  config: {};
} | {
  d_a_o: {};
} | {
  competition_count: {};
} | {
  competition: {
    competition_id: Uint128;
  };
} | {
  competitions: {
    filter?: CompetitionsFilter | null;
    limit?: number | null;
    start_after?: Uint128 | null;
  };
} | {
  evidence: {
    competition_id: Uint128;
    limit?: number | null;
    start_after?: Uint128 | null;
  };
} | {
  result: {
    competition_id: Uint128;
  };
} | {
  query_extension: {
    msg: QueryExt;
  };
} | {
  payment_registry: {};
} | {
  stat_types: {
    competition_id: Uint128;
  };
} | {
  historical_stats: {
    addr: string;
    competition_id: Uint128;
  };
} | {
  stats_table: {
    competition_id: Uint128;
    limit?: number | null;
    start_after?: [string, string] | null;
  };
} | {
  stat: {
    addr: string;
    competition_id: Uint128;
    height?: number | null;
    stat_name: string;
  };
} | {
  ownership: {};
};
export type QueryExt = {
  bracket: {
    start_after?: Uint128 | null;
    tournament_id: Uint128;
  };
} | {
  match: {
    match_number: Uint128;
    tournament_id: Uint128;
  };
};
export type MigrateBase = {
  from_compatible: {};
} | {
  from_v2_2: {
    escrow_id: number;
  };
};
export type Addr = string;
export interface SudoMsg {
  matches: Match[];
}
export interface Match {
  is_losers_bracket?: boolean | null;
  match_number: Uint128;
  next_match_loser?: Uint128 | null;
  next_match_winner?: Uint128 | null;
  result?: MatchResult | null;
  team_1?: Addr | null;
  team_2?: Addr | null;
}
export type Null = null;
export interface CompetitionResponseForTournamentExt {
  banner?: string | null;
  category_id?: Uint128 | null;
  description: string;
  escrow: Addr;
  expiration: Expiration;
  extension: TournamentExt;
  fees?: FeeInformationForAddr[] | null;
  group_contract: Addr;
  host: Addr;
  id: Uint128;
  is_expired: boolean;
  name: string;
  rules?: string[] | null;
  rulesets?: Uint128[] | null;
  start_height: number;
  status: CompetitionStatus;
}
export interface TournamentExt {
  distribution: Decimal[];
  elimination_type: EliminationType;
  processed_matches: Uint128;
  total_matches: Uint128;
}
export interface FeeInformationForAddr {
  cw20_msg?: Binary | null;
  cw721_msg?: Binary | null;
  receiver: Addr;
  tax: Decimal;
}
export type ArrayOfCompetitionResponseForTournamentExt = CompetitionResponseForTournamentExt[];
export interface ConfigForEmpty {
  description: string;
  extension: Empty;
  key: string;
}
export type String = string;
export type ArrayOfEvidence = Evidence[];
export interface Evidence {
  content: string;
  id: Uint128;
  submit_time: Timestamp;
  submit_user: Addr;
}
export type ArrayOfArrayOfStatMsg = StatMsg[][];
export interface OwnershipForString {
  owner?: string | null;
  pending_expiry?: Expiration | null;
  pending_owner?: string | null;
}
export type NullableString = string | null;
export type NullableDistributionForString = DistributionForString | null;
export type NullableArrayOfStatType = StatType[] | null;
export type ArrayOfStatTableEntry = StatTableEntry[];
export interface StatTableEntry {
  addr: Addr;
  stats: StatMsg[];
}