/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type GroupContract = {
  existing: {
    address: string;
  };
} | {
  new: {
    cw4_group_code_id: number;
    initial_members: Member[];
  };
};
export interface InstantiateMsg {
  group_contract: GroupContract;
}
export interface Member {
  addr: string;
  weight: number;
}
export type ExecuteMsg = string;
export type QueryMsg = {
  group_contract: {};
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
};
export interface MigrateMsg {}
export type Addr = string;
export interface InfoResponse {
  info: ContractVersion;
}
export interface ContractVersion {
  contract: string;
  version: string;
}
export type Uint128 = string;
export interface TotalPowerAtHeightResponse {
  height: number;
  power: Uint128;
}
export interface VotingPowerAtHeightResponse {
  height: number;
  power: Uint128;
}