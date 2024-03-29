/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { StdFee } from "@cosmjs/amino";
import { Duration, Uint128, Expiration, Timestamp, Uint64, InstantiateMsg, Coin, ExecuteMsg, QueryMsg, MigrateMsg, Addr, FundraiseState, Config, NullableUint128, DumpStateResponse } from "./ArenaFundraise.types";
export interface ArenaFundraiseReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<Config>;
  totalDeposited: () => Promise<Uint128>;
  deposit: ({
    addr
  }: {
    addr: string;
  }) => Promise<NullableUint128>;
  reward: ({
    addr
  }: {
    addr: string;
  }) => Promise<NullableUint128>;
  dumpState: ({
    addr
  }: {
    addr?: string;
  }) => Promise<DumpStateResponse>;
}
export class ArenaFundraiseQueryClient implements ArenaFundraiseReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.totalDeposited = this.totalDeposited.bind(this);
    this.deposit = this.deposit.bind(this);
    this.reward = this.reward.bind(this);
    this.dumpState = this.dumpState.bind(this);
  }

  config = async (): Promise<Config> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  totalDeposited = async (): Promise<Uint128> => {
    return this.client.queryContractSmart(this.contractAddress, {
      total_deposited: {}
    });
  };
  deposit = async ({
    addr
  }: {
    addr: string;
  }): Promise<NullableUint128> => {
    return this.client.queryContractSmart(this.contractAddress, {
      deposit: {
        addr
      }
    });
  };
  reward = async ({
    addr
  }: {
    addr: string;
  }): Promise<NullableUint128> => {
    return this.client.queryContractSmart(this.contractAddress, {
      reward: {
        addr
      }
    });
  };
  dumpState = async ({
    addr
  }: {
    addr?: string;
  }): Promise<DumpStateResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      dump_state: {
        addr
      }
    });
  };
}
export interface ArenaFundraiseInterface extends ArenaFundraiseReadOnlyInterface {
  contractAddress: string;
  sender: string;
  deposit: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  withdraw: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  expire: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class ArenaFundraiseClient extends ArenaFundraiseQueryClient implements ArenaFundraiseInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.deposit = this.deposit.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.expire = this.expire.bind(this);
  }

  deposit = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      deposit: {}
    }, fee, memo, _funds);
  };
  withdraw = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      withdraw: {}
    }, fee, memo, _funds);
  };
  expire = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      expire: {}
    }, fee, memo, _funds);
  };
}