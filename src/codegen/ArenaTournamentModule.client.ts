/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
import { InstantiateMsg, Empty, ExecuteMsg, Binary, Decimal, Uint128, Expiration, Timestamp, Uint64, ModuleInfo, Admin, EliminationType, ExecuteExt, MatchResult, Action, ProposeMessage, FeeInformationForString, DistributionForString, MemberPercentageForString, EscrowInstantiateInfo, ModuleInstantiateInfo, TournamentInstantiateExt, MatchResultMsg, QueryMsg, CompetitionsFilter, CompetitionStatus, QueryExt, MigrateMsg, Null, Addr, CompetitionResponseForTournamentExt, TournamentExt, FeeInformationForAddr, ArrayOfCompetitionResponseForTournamentExt, ConfigForEmpty, String, ArrayOfEvidence, Evidence, OwnershipForString, NullableDistributionForString } from "./ArenaTournamentModule.types";
export interface ArenaTournamentModuleReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<ConfigForEmpty>;
  dAO: () => Promise<String>;
  competitionCount: () => Promise<Uint128>;
  competition: ({
    competitionId
  }: {
    competitionId: Uint128;
  }) => Promise<CompetitionResponseForTournamentExt>;
  competitions: ({
    filter,
    limit,
    startAfter
  }: {
    filter?: CompetitionsFilter;
    limit?: number;
    startAfter?: Uint128;
  }) => Promise<ArrayOfCompetitionResponseForTournamentExt>;
  evidence: ({
    competitionId,
    limit,
    startAfter
  }: {
    competitionId: Uint128;
    limit?: number;
    startAfter?: Uint128;
  }) => Promise<ArrayOfEvidence>;
  result: ({
    competitionId
  }: {
    competitionId: Uint128;
  }) => Promise<NullableDistributionForString>;
  queryExtension: ({
    msg
  }: {
    msg: QueryExt;
  }) => Promise<Binary>;
  ownership: () => Promise<OwnershipForString>;
}
export class ArenaTournamentModuleQueryClient implements ArenaTournamentModuleReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.dAO = this.dAO.bind(this);
    this.competitionCount = this.competitionCount.bind(this);
    this.competition = this.competition.bind(this);
    this.competitions = this.competitions.bind(this);
    this.evidence = this.evidence.bind(this);
    this.result = this.result.bind(this);
    this.queryExtension = this.queryExtension.bind(this);
    this.ownership = this.ownership.bind(this);
  }

  config = async (): Promise<ConfigForEmpty> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  dAO = async (): Promise<String> => {
    return this.client.queryContractSmart(this.contractAddress, {
      d_a_o: {}
    });
  };
  competitionCount = async (): Promise<Uint128> => {
    return this.client.queryContractSmart(this.contractAddress, {
      competition_count: {}
    });
  };
  competition = async ({
    competitionId
  }: {
    competitionId: Uint128;
  }): Promise<CompetitionResponseForTournamentExt> => {
    return this.client.queryContractSmart(this.contractAddress, {
      competition: {
        competition_id: competitionId
      }
    });
  };
  competitions = async ({
    filter,
    limit,
    startAfter
  }: {
    filter?: CompetitionsFilter;
    limit?: number;
    startAfter?: Uint128;
  }): Promise<ArrayOfCompetitionResponseForTournamentExt> => {
    return this.client.queryContractSmart(this.contractAddress, {
      competitions: {
        filter,
        limit,
        start_after: startAfter
      }
    });
  };
  evidence = async ({
    competitionId,
    limit,
    startAfter
  }: {
    competitionId: Uint128;
    limit?: number;
    startAfter?: Uint128;
  }): Promise<ArrayOfEvidence> => {
    return this.client.queryContractSmart(this.contractAddress, {
      evidence: {
        competition_id: competitionId,
        limit,
        start_after: startAfter
      }
    });
  };
  result = async ({
    competitionId
  }: {
    competitionId: Uint128;
  }): Promise<NullableDistributionForString> => {
    return this.client.queryContractSmart(this.contractAddress, {
      result: {
        competition_id: competitionId
      }
    });
  };
  queryExtension = async ({
    msg
  }: {
    msg: QueryExt;
  }): Promise<Binary> => {
    return this.client.queryContractSmart(this.contractAddress, {
      query_extension: {
        msg
      }
    });
  };
  ownership = async (): Promise<OwnershipForString> => {
    return this.client.queryContractSmart(this.contractAddress, {
      ownership: {}
    });
  };
}
export interface ArenaTournamentModuleInterface extends ArenaTournamentModuleReadOnlyInterface {
  contractAddress: string;
  sender: string;
  jailCompetition: ({
    proposeMessage
  }: {
    proposeMessage: ProposeMessage;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  activate: (fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  addCompetitionHook: ({
    competitionId
  }: {
    competitionId: Uint128;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  removeCompetitionHook: ({
    competitionId
  }: {
    competitionId: Uint128;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  executeCompetitionHook: ({
    competitionId,
    distribution
  }: {
    competitionId: Uint128;
    distribution?: DistributionForString;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  createCompetition: ({
    categoryId,
    description,
    escrow,
    expiration,
    host,
    instantiateExtension,
    name,
    rules,
    rulesets
  }: {
    categoryId?: Uint128;
    description: string;
    escrow?: EscrowInstantiateInfo;
    expiration: Expiration;
    host: ModuleInfo;
    instantiateExtension: TournamentInstantiateExt;
    name: string;
    rules: string[];
    rulesets: Uint128[];
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  submitEvidence: ({
    competitionId,
    evidence
  }: {
    competitionId: Uint128;
    evidence: string[];
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  processCompetition: ({
    competitionId,
    distribution
  }: {
    competitionId: Uint128;
    distribution?: DistributionForString;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  extension: ({
    msg
  }: {
    msg: ExecuteExt;
  }, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
  updateOwnership: (action: Action, fee?: number | StdFee | "auto", memo?: string, _funds?: Coin[]) => Promise<ExecuteResult>;
}
export class ArenaTournamentModuleClient extends ArenaTournamentModuleQueryClient implements ArenaTournamentModuleInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.jailCompetition = this.jailCompetition.bind(this);
    this.activate = this.activate.bind(this);
    this.addCompetitionHook = this.addCompetitionHook.bind(this);
    this.removeCompetitionHook = this.removeCompetitionHook.bind(this);
    this.executeCompetitionHook = this.executeCompetitionHook.bind(this);
    this.createCompetition = this.createCompetition.bind(this);
    this.submitEvidence = this.submitEvidence.bind(this);
    this.processCompetition = this.processCompetition.bind(this);
    this.extension = this.extension.bind(this);
    this.updateOwnership = this.updateOwnership.bind(this);
  }

  jailCompetition = async ({
    proposeMessage
  }: {
    proposeMessage: ProposeMessage;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      jail_competition: {
        propose_message: proposeMessage
      }
    }, fee, memo, _funds);
  };
  activate = async (fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      activate: {}
    }, fee, memo, _funds);
  };
  addCompetitionHook = async ({
    competitionId
  }: {
    competitionId: Uint128;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      add_competition_hook: {
        competition_id: competitionId
      }
    }, fee, memo, _funds);
  };
  removeCompetitionHook = async ({
    competitionId
  }: {
    competitionId: Uint128;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      remove_competition_hook: {
        competition_id: competitionId
      }
    }, fee, memo, _funds);
  };
  executeCompetitionHook = async ({
    competitionId,
    distribution
  }: {
    competitionId: Uint128;
    distribution?: DistributionForString;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      execute_competition_hook: {
        competition_id: competitionId,
        distribution
      }
    }, fee, memo, _funds);
  };
  createCompetition = async ({
    categoryId,
    description,
    escrow,
    expiration,
    host,
    instantiateExtension,
    name,
    rules,
    rulesets
  }: {
    categoryId?: Uint128;
    description: string;
    escrow?: EscrowInstantiateInfo;
    expiration: Expiration;
    host: ModuleInfo;
    instantiateExtension: TournamentInstantiateExt;
    name: string;
    rules: string[];
    rulesets: Uint128[];
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      create_competition: {
        category_id: categoryId,
        description,
        escrow,
        expiration,
        host,
        instantiate_extension: instantiateExtension,
        name,
        rules,
        rulesets
      }
    }, fee, memo, _funds);
  };
  submitEvidence = async ({
    competitionId,
    evidence
  }: {
    competitionId: Uint128;
    evidence: string[];
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      submit_evidence: {
        competition_id: competitionId,
        evidence
      }
    }, fee, memo, _funds);
  };
  processCompetition = async ({
    competitionId,
    distribution
  }: {
    competitionId: Uint128;
    distribution?: DistributionForString;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      process_competition: {
        competition_id: competitionId,
        distribution
      }
    }, fee, memo, _funds);
  };
  extension = async ({
    msg
  }: {
    msg: ExecuteExt;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      extension: {
        msg
      }
    }, fee, memo, _funds);
  };
  updateOwnership = async (action: Action, fee: number | StdFee | "auto" = "auto", memo?: string, _funds?: Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_ownership: action
    }, fee, memo, _funds);
  };
}