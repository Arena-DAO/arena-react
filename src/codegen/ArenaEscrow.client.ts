/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { StdFee } from "@cosmjs/amino";
import { Uint128, InstantiateMsg, MemberBalanceUnchecked, BalanceUnchecked, Cw20Coin, Cw721Collection, Coin, ExecuteMsg, Binary, Decimal, Action, Expiration, Timestamp, Uint64, DistributionForString, MemberPercentageForString, Cw20ReceiveMsg, Cw721ReceiveMsg, FeeInformationForString, QueryMsg, MigrateMsg, NullableBalanceVerified, Addr, BalanceVerified, Cw20CoinVerified, Cw721CollectionVerified, ArrayOfMemberBalanceChecked, MemberBalanceChecked, NullableDistributionForString, DumpStateResponse, Boolean, OwnershipForString } from "./ArenaEscrow.types";
export interface ArenaEscrowReadOnlyInterface {
  contractAddress: string;
  balances: ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }) => Promise<ArrayOfMemberBalanceChecked>;
  balance: ({
    addr
  }: {
    addr: string;
  }) => Promise<NullableBalanceVerified>;
  due: ({
    addr
  }: {
    addr: string;
  }) => Promise<NullableBalanceVerified>;
  dues: ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }) => Promise<ArrayOfMemberBalanceChecked>;
  initialDues: ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }) => Promise<ArrayOfMemberBalanceChecked>;
  isFunded: ({
    addr
  }: {
    addr: string;
  }) => Promise<Boolean>;
  isFullyFunded: () => Promise<Boolean>;
  totalBalance: () => Promise<NullableBalanceVerified>;
  isLocked: () => Promise<Boolean>;
  distribution: ({
    addr
  }: {
    addr: string;
  }) => Promise<NullableDistributionForString>;
  dumpState: ({
    addr
  }: {
    addr?: string;
  }) => Promise<DumpStateResponse>;
  shouldActivateOnFunded: () => Promise<Boolean>;
  ownership: () => Promise<OwnershipForString>;
}
export class ArenaEscrowQueryClient implements ArenaEscrowReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.balances = this.balances.bind(this);
    this.balance = this.balance.bind(this);
    this.due = this.due.bind(this);
    this.dues = this.dues.bind(this);
    this.initialDues = this.initialDues.bind(this);
    this.isFunded = this.isFunded.bind(this);
    this.isFullyFunded = this.isFullyFunded.bind(this);
    this.totalBalance = this.totalBalance.bind(this);
    this.isLocked = this.isLocked.bind(this);
    this.distribution = this.distribution.bind(this);
    this.dumpState = this.dumpState.bind(this);
    this.shouldActivateOnFunded = this.shouldActivateOnFunded.bind(this);
    this.ownership = this.ownership.bind(this);
  }

  balances = async ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }): Promise<ArrayOfMemberBalanceChecked> => {
    return this.client.queryContractSmart(this.contractAddress, {
      balances: {
        limit,
        start_after: startAfter
      }
    });
  };
  balance = async ({
    addr
  }: {
    addr: string;
  }): Promise<NullableBalanceVerified> => {
    return this.client.queryContractSmart(this.contractAddress, {
      balance: {
        addr
      }
    });
  };
  due = async ({
    addr
  }: {
    addr: string;
  }): Promise<NullableBalanceVerified> => {
    return this.client.queryContractSmart(this.contractAddress, {
      due: {
        addr
      }
    });
  };
  dues = async ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }): Promise<ArrayOfMemberBalanceChecked> => {
    return this.client.queryContractSmart(this.contractAddress, {
      dues: {
        limit,
        start_after: startAfter
      }
    });
  };
  initialDues = async ({
    limit,
    startAfter
  }: {
    limit?: number;
    startAfter?: string;
  }): Promise<ArrayOfMemberBalanceChecked> => {
    return this.client.queryContractSmart(this.contractAddress, {
      initial_dues: {
        limit,
        start_after: startAfter
      }
    });
  };
  isFunded = async ({
    addr
  }: {
    addr: string;
  }): Promise<Boolean> => {
    return this.client.queryContractSmart(this.contractAddress, {
      is_funded: {
        addr
      }
    });
  };
  isFullyFunded = async (): Promise<Boolean> => {
    return this.client.queryContractSmart(this.contractAddress, {
      is_fully_funded: {}
    });
  };
  totalBalance = async (): Promise<NullableBalanceVerified> => {
    return this.client.queryContractSmart(this.contractAddress, {
      total_balance: {}
    });
  };
  isLocked = async (): Promise<Boolean> => {
    return this.client.queryContractSmart(this.contractAddress, {
      is_locked: {}
    });
  };
  distribution = async ({
    addr
  }: {
    addr: string;
  }): Promise<NullableDistributionForString> => {
    return this.client.queryContractSmart(this.contractAddress, {
      distribution: {
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
  shouldActivateOnFunded = async (): Promise<Boolean> => {
    return this.client.queryContractSmart(this.contractAddress, {
      should_activate_on_funded: {}
    });
  };
  ownership = async (): Promise<OwnershipForString> => {
    return this.client.queryContractSmart(this.contractAddress, {
      ownership: {}
    });
  };
}
export interface ArenaEscrowInterface extends ArenaEscrowReadOnlyInterface {
  contractAddress: string;
  sender: string;
  withdraw: ({
    cw20Msg,
    cw721Msg
  }: {
    cw20Msg?: Binary;
    cw721Msg?: Binary;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  setDistribution: ({
    distribution
  }: {
    distribution?: DistributionForString;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  activate: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  receiveNative: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  receive: ({
    amount,
    msg,
    sender
  }: {
    amount: Uint128;
    msg: Binary;
    sender: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  receiveNft: ({
    msg,
    sender,
    tokenId
  }: {
    msg: Binary;
    sender: string;
    tokenId: string;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  distribute: ({
    distribution,
    layeredFees
  }: {
    distribution?: DistributionForString;
    layeredFees?: FeeInformationForString[];
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  lock: ({
    value
  }: {
    value: boolean;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateOwnership: (action: Action, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class ArenaEscrowClient extends ArenaEscrowQueryClient implements ArenaEscrowInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.withdraw = this.withdraw.bind(this);
    this.setDistribution = this.setDistribution.bind(this);
    this.activate = this.activate.bind(this);
    this.receiveNative = this.receiveNative.bind(this);
    this.receive = this.receive.bind(this);
    this.receiveNft = this.receiveNft.bind(this);
    this.distribute = this.distribute.bind(this);
    this.lock = this.lock.bind(this);
    this.updateOwnership = this.updateOwnership.bind(this);
  }

  withdraw = async ({
    cw20Msg,
    cw721Msg
  }: {
    cw20Msg?: Binary;
    cw721Msg?: Binary;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      withdraw: {
        cw20_msg: cw20Msg,
        cw721_msg: cw721Msg
      }
    }, fee, memo, _funds);
  };
  setDistribution = async ({
    distribution
  }: {
    distribution?: DistributionForString;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      set_distribution: {
        distribution
      }
    }, fee, memo, _funds);
  };
  activate = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      activate: {}
    }, fee, memo, _funds);
  };
  receiveNative = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      receive_native: {}
    }, fee, memo, _funds);
  };
  receive = async ({
    amount,
    msg,
    sender
  }: {
    amount: Uint128;
    msg: Binary;
    sender: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      receive: {
        amount,
        msg,
        sender
      }
    }, fee, memo, _funds);
  };
  receiveNft = async ({
    msg,
    sender,
    tokenId
  }: {
    msg: Binary;
    sender: string;
    tokenId: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      receive_nft: {
        msg,
        sender,
        token_id: tokenId
      }
    }, fee, memo, _funds);
  };
  distribute = async ({
    distribution,
    layeredFees
  }: {
    distribution?: DistributionForString;
    layeredFees?: FeeInformationForString[];
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      distribute: {
        distribution,
        layered_fees: layeredFees
      }
    }, fee, memo, _funds);
  };
  lock = async ({
    value
  }: {
    value: boolean;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      lock: {
        value
      }
    }, fee, memo, _funds);
  };
  updateOwnership = async (action: Action, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_ownership: action
    }, fee, memo, _funds);
  };
}