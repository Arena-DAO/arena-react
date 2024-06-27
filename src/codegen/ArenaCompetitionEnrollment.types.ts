/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export interface InstantiateMsg {
  owner: string;
}
export type ExecuteMsg = {
  create_enrollment: {
    category_id?: Uint128 | null;
    competition_info: CompetitionInfoMsg;
    competition_type: CompetitionType;
    entry_fee?: Coin | null;
    expiration: Expiration;
    is_creator_member?: boolean | null;
    max_members: Uint64;
    min_members?: Uint64 | null;
  };
} | {
  trigger_expiration: {
    escrow_id: number;
    id: Uint128;
  };
} | {
  enroll: {
    id: Uint128;
  };
} | {
  withdraw: {
    id: Uint128;
  };
} | {
  update_ownership: Action;
};
export type Uint128 = string;
export type Binary = string;
export type Decimal = string;
export type Expiration = {
  at_height: number;
} | {
  at_time: Timestamp;
} | {
  never: {};
};
export type Timestamp = Uint64;
export type Uint64 = string;
export type CompetitionType = {
  wager: {};
} | {
  league: {
    distribution: Decimal[];
    match_draw_points: Uint64;
    match_lose_points: Uint64;
    match_win_points: Uint64;
  };
} | {
  tournament: {
    distribution: Decimal[];
    elimination_type: EliminationType;
  };
};
export type EliminationType = "double_elimination" | {
  single_elimination: {
    play_third_place_match: boolean;
  };
};
export type Action = {
  transfer_ownership: {
    expiry?: Expiration | null;
    new_owner: string;
  };
} | "accept_ownership" | "renounce_ownership";
export interface CompetitionInfoMsg {
  additional_layered_fees?: FeeInformationForString[] | null;
  banner?: string | null;
  description: string;
  expiration: Expiration;
  name: string;
  rules: string[];
  rulesets: Uint128[];
}
export interface FeeInformationForString {
  cw20_msg?: Binary | null;
  cw721_msg?: Binary | null;
  receiver: string;
  tax: Decimal;
}
export interface Coin {
  amount: Uint128;
  denom: string;
  [k: string]: unknown;
}
export type QueryMsg = {
  enrollments: {
    filter?: EnrollmentFilter | null;
    limit?: number | null;
    start_after?: Uint128 | null;
  };
} | {
  enrollment: {
    id: Uint128;
  };
} | {
  ownership: {};
};
export type EnrollmentFilter = {
  category: {
    category_id?: Uint128 | null;
  };
} | {
  host: string;
};
export type MigrateMsg = {
  from_compatible: {};
};
export type Addr = string;
export interface SudoMsg {
  enrollment_entry_response: EnrollmentEntryResponse;
}
export interface EnrollmentEntryResponse {
  category_id?: Uint128 | null;
  competition_info: CompetitionInfoResponse;
  competition_type: CompetitionType;
  entry_fee?: Coin | null;
  expiration: Expiration;
  has_triggered_expiration: boolean;
  host: Addr;
  id: Uint128;
  max_members: Uint64;
  min_members?: Uint64 | null;
}
export interface CompetitionInfoResponse {
  additional_layered_fees?: FeeInformationForString[] | null;
  banner?: string | null;
  description: string;
  expiration: Expiration;
  name: string;
  rules: string[];
  rulesets: Uint128[];
}
export type ArrayOfEnrollmentEntryResponse = EnrollmentEntryResponse[];
export interface OwnershipForString {
  owner?: string | null;
  pending_expiry?: Expiration | null;
  pending_owner?: string | null;
}