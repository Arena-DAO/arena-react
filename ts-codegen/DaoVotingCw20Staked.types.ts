/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.23.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type ActiveThreshold = {
  absolute_count: {
    count: Uint128;
  };
} | {
  percentage: {
    percent: Decimal;
  };
};
export type Uint128 = string;
export type Decimal = string;
export type TokenInfo = {
  existing: {
    address: string;
    staking_contract: StakingInfo;
  };
} | {
  new: {
    code_id: number;
    decimals: number;
    initial_balances: Cw20Coin[];
    initial_dao_balance?: Uint128 | null;
    label: string;
    marketing?: InstantiateMarketingInfo | null;
    name: string;
    staking_code_id: number;
    symbol: string;
    unstaking_duration?: Duration | null;
  };
};
export type StakingInfo = {
  existing: {
    staking_contract_address: string;
  };
} | {
  new: {
    staking_code_id: number;
    unstaking_duration?: Duration | null;
  };
};
export type Duration = {
  height: number;
} | {
  time: number;
};
export type Logo = {
  url: string;
} | {
  embedded: EmbeddedLogo;
};
export type EmbeddedLogo = {
  svg: Binary;
} | {
  png: Binary;
};
export type Binary = string;
export interface InstantiateMsg {
  active_threshold?: ActiveThreshold | null;
  token_info: TokenInfo;
}
export interface Cw20Coin {
  address: string;
  amount: Uint128;
}
export interface InstantiateMarketingInfo {
  description?: string | null;
  logo?: Logo | null;
  marketing?: string | null;
  project?: string | null;
}
export type ExecuteMsg = {
  update_active_threshold: {
    new_threshold?: ActiveThreshold | null;
  };
};
export type QueryMsg = {
  staking_contract: {};
} | {
  active_threshold: {};
} | {
  voting_power_at_height: {
    address: string;
    height?: number | null;
  };
} | {
  total_power_at_height: {
    height?: number | null;
  };
} | {
  dao: {};
} | {
  info: {};
} | {
  token_contract: {};
} | {
  is_active: {};
};
export interface MigrateMsg {}
export interface ActiveThresholdResponse {
  active_threshold?: ActiveThreshold | null;
}
export type Addr = string;
export interface InfoResponse {
  info: ContractVersion;
}
export interface ContractVersion {
  contract: string;
  version: string;
}
export type Boolean = boolean;
export interface TotalPowerAtHeightResponse {
  height: number;
  power: Uint128;
}
export interface VotingPowerAtHeightResponse {
  height: number;
  power: Uint128;
}