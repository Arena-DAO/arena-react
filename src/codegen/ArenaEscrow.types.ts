/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Uint128 = string;
export interface InstantiateMsg {
  dues: MemberBalanceUnchecked[];
  should_activate_on_funded?: boolean | null;
}
export interface MemberBalanceUnchecked {
  addr: string;
  balance: BalanceUnchecked;
}
export interface BalanceUnchecked {
  cw20?: Cw20Coin[] | null;
  cw721?: Cw721Collection[] | null;
  native?: Coin[] | null;
}
export interface Cw20Coin {
  address: string;
  amount: Uint128;
}
export interface Cw721Collection {
  address: string;
  token_ids: string[];
}
export interface Coin {
  amount: Uint128;
  denom: string;
  [k: string]: unknown;
}
export type ExecuteMsg = {
  withdraw: {
    cw20_msg?: Binary | null;
    cw721_msg?: Binary | null;
  };
} | {
  set_distribution: {
    distribution?: DistributionForString | null;
  };
} | {
  activate: {};
} | {
  receive_native: {};
} | {
  receive: Cw20ReceiveMsg;
} | {
  receive_nft: Cw721ReceiveMsg;
} | {
  distribute: {
    distribution?: DistributionForString | null;
    layered_fees?: FeeInformationForString[] | null;
  };
} | {
  lock: {
    value: boolean;
  };
} | {
  update_ownership: Action;
};
export type Binary = string;
export type Decimal = string;
export type Action = {
  transfer_ownership: {
    expiry?: Expiration | null;
    new_owner: string;
  };
} | "accept_ownership" | "renounce_ownership";
export type Expiration = {
  at_height: number;
} | {
  at_time: Timestamp;
} | {
  never: {};
};
export type Timestamp = Uint64;
export type Uint64 = string;
export interface DistributionForString {
  member_percentages: MemberPercentageForString[];
  remainder_addr: string;
}
export interface MemberPercentageForString {
  addr: string;
  percentage: Decimal;
}
export interface Cw20ReceiveMsg {
  amount: Uint128;
  msg: Binary;
  sender: string;
}
export interface Cw721ReceiveMsg {
  msg: Binary;
  sender: string;
  token_id: string;
}
export interface FeeInformationForString {
  cw20_msg?: Binary | null;
  cw721_msg?: Binary | null;
  receiver: string;
  tax: Decimal;
}
export type QueryMsg = {
  balances: {
    limit?: number | null;
    start_after?: string | null;
  };
} | {
  balance: {
    addr: string;
  };
} | {
  due: {
    addr: string;
  };
} | {
  dues: {
    limit?: number | null;
    start_after?: string | null;
  };
} | {
  initial_dues: {
    limit?: number | null;
    start_after?: string | null;
  };
} | {
  is_funded: {
    addr: string;
  };
} | {
  is_fully_funded: {};
} | {
  total_balance: {};
} | {
  is_locked: {};
} | {
  distribution: {
    addr: string;
  };
} | {
  dump_state: {
    addr?: string | null;
  };
} | {
  should_activate_on_funded: {};
} | {
  ownership: {};
};
export type MigrateMsg = {
  from_compatible: {};
};
export type NullableBalanceVerified = BalanceVerified | null;
export type Addr = string;
export interface BalanceVerified {
  cw20?: Cw20CoinVerified[] | null;
  cw721?: Cw721CollectionVerified[] | null;
  native?: Coin[] | null;
}
export interface Cw20CoinVerified {
  address: Addr;
  amount: Uint128;
}
export interface Cw721CollectionVerified {
  address: Addr;
  token_ids: string[];
}
export type ArrayOfMemberBalanceChecked = MemberBalanceChecked[];
export interface MemberBalanceChecked {
  addr: Addr;
  balance: BalanceVerified;
}
export type NullableDistributionForString = DistributionForString | null;
export interface DumpStateResponse {
  balance?: BalanceVerified | null;
  due?: BalanceVerified | null;
  is_locked: boolean;
  total_balance?: BalanceVerified | null;
}
export type Boolean = boolean;
export interface OwnershipForString {
  owner?: string | null;
  pending_expiry?: Expiration | null;
  pending_owner?: string | null;
}