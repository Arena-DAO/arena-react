/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Uint128 = string;
export interface InstantiateMsg {
  dues: MemberBalance[];
}
export interface MemberBalance {
  addr: string;
  balance: Balance;
}
export interface Balance {
  cw20: Cw20Coin[];
  cw721: Cw721Collection[];
  native: Coin[];
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
    distribution: MemberShareForString[];
  };
} | {
  receive_native: {};
} | {
  receive: Cw20ReceiveMsg;
} | {
  receive_nft: Cw721ReceiveMsg;
} | {
  distribute: CompetitionEscrowDistributeMsg;
} | {
  lock: {
    value: boolean;
  };
} | {
  update_ownership: Action;
};
export type Binary = string;
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
export interface MemberShareForString {
  addr: string;
  shares: Uint128;
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
export interface CompetitionEscrowDistributeMsg {
  distribution?: MemberShareForString[] | null;
  remainder_addr: string;
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
  ownership: {};
};
export type MigrateMsg = {
  from_compatible: {};
};
export type Addr = string;
export interface BalanceVerified {
  cw20: Cw20CoinVerified[];
  cw721: Cw721CollectionVerified[];
  native: Coin[];
}
export interface Cw20CoinVerified {
  address: Addr;
  amount: Uint128;
}
export interface Cw721CollectionVerified {
  address: Addr;
  token_ids: string[];
}
export type ArrayOfMemberBalanceVerified = MemberBalanceVerified[];
export interface MemberBalanceVerified {
  addr: Addr;
  balance: BalanceVerified;
}
export type NullableArrayOfMemberShareForString = MemberShareForString[] | null;
export interface DumpStateResponse {
  balance: BalanceVerified;
  dues: MemberBalanceVerified[];
  is_locked: boolean;
  total_balance: BalanceVerified;
}
export type Boolean = boolean;
export interface OwnershipForString {
  owner?: string | null;
  pending_expiry?: Expiration | null;
  pending_owner?: string | null;
}