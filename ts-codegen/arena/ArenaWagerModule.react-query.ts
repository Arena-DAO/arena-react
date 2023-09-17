/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.3.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { UseQueryOptions, useQuery, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { StdFee, Coin } from "@cosmjs/amino";
import { InstantiateMsg, Empty, ExecuteMsg, Uint128, Admin, Binary, Expiration, Timestamp, Uint64, Action, ProposalDetails, ModuleInstantiateInfo, MemberShare, QueryMsg, MigrateMsg, Null, Addr, CompetitionStatus, CompetitionResponseForEmpty, Ruleset, ArrayOfCompetitionResponseForEmpty, Config, OwnershipForString } from "./ArenaWagerModule.types";
import { ArenaWagerModuleQueryClient, ArenaWagerModuleClient } from "./ArenaWagerModule.client";
export const arenaWagerModuleQueryKeys = {
  contract: ([{
    contract: "arenaWagerModule"
  }] as const),
  address: (contractAddress: string | undefined) => ([{ ...arenaWagerModuleQueryKeys.contract[0],
    address: contractAddress
  }] as const),
  config: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...arenaWagerModuleQueryKeys.address(contractAddress)[0],
    method: "config",
    args
  }] as const),
  competitionCount: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...arenaWagerModuleQueryKeys.address(contractAddress)[0],
    method: "competition_count",
    args
  }] as const),
  competition: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...arenaWagerModuleQueryKeys.address(contractAddress)[0],
    method: "competition",
    args
  }] as const),
  competitions: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...arenaWagerModuleQueryKeys.address(contractAddress)[0],
    method: "competitions",
    args
  }] as const),
  queryExtension: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...arenaWagerModuleQueryKeys.address(contractAddress)[0],
    method: "query_extension",
    args
  }] as const),
  ownership: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...arenaWagerModuleQueryKeys.address(contractAddress)[0],
    method: "ownership",
    args
  }] as const)
};
export const arenaWagerModuleQueries = {
  config: <TData = Config,>({
    client,
    options
  }: ArenaWagerModuleConfigQuery<TData>): UseQueryOptions<Config, Error, TData> => ({
    queryKey: arenaWagerModuleQueryKeys.config(client?.contractAddress),
    queryFn: () => client ? client.config() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  competitionCount: <TData = Uint128,>({
    client,
    options
  }: ArenaWagerModuleCompetitionCountQuery<TData>): UseQueryOptions<Uint128, Error, TData> => ({
    queryKey: arenaWagerModuleQueryKeys.competitionCount(client?.contractAddress),
    queryFn: () => client ? client.competitionCount() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  competition: <TData = CompetitionResponseForEmpty,>({
    client,
    args,
    options
  }: ArenaWagerModuleCompetitionQuery<TData>): UseQueryOptions<CompetitionResponseForEmpty, Error, TData> => ({
    queryKey: arenaWagerModuleQueryKeys.competition(client?.contractAddress, args),
    queryFn: () => client ? client.competition({
      id: args.id,
      includeRuleset: args.includeRuleset
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  competitions: <TData = ArrayOfCompetitionResponseForEmpty,>({
    client,
    args,
    options
  }: ArenaWagerModuleCompetitionsQuery<TData>): UseQueryOptions<ArrayOfCompetitionResponseForEmpty, Error, TData> => ({
    queryKey: arenaWagerModuleQueryKeys.competitions(client?.contractAddress, args),
    queryFn: () => client ? client.competitions({
      includeRuleset: args.includeRuleset,
      limit: args.limit,
      startAfter: args.startAfter
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  queryExtension: <TData = Binary,>({
    client,
    args,
    options
  }: ArenaWagerModuleQueryExtensionQuery<TData>): UseQueryOptions<Binary, Error, TData> => ({
    queryKey: arenaWagerModuleQueryKeys.queryExtension(client?.contractAddress, args),
    queryFn: () => client ? client.queryExtension({
      msg: args.msg
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  ownership: <TData = OwnershipForString,>({
    client,
    options
  }: ArenaWagerModuleOwnershipQuery<TData>): UseQueryOptions<OwnershipForString, Error, TData> => ({
    queryKey: arenaWagerModuleQueryKeys.ownership(client?.contractAddress),
    queryFn: () => client ? client.ownership() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  })
};
export interface ArenaWagerModuleReactQuery<TResponse, TData = TResponse> {
  client: ArenaWagerModuleQueryClient | undefined;
  options?: Omit<UseQueryOptions<TResponse, Error, TData>, "'queryKey' | 'queryFn' | 'initialData'"> & {
    initialData?: undefined;
  };
}
export interface ArenaWagerModuleOwnershipQuery<TData> extends ArenaWagerModuleReactQuery<OwnershipForString, TData> {}
export function useArenaWagerModuleOwnershipQuery<TData = OwnershipForString>({
  client,
  options
}: ArenaWagerModuleOwnershipQuery<TData>) {
  return useQuery<OwnershipForString, Error, TData>(arenaWagerModuleQueryKeys.ownership(client?.contractAddress), () => client ? client.ownership() : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaWagerModuleQueryExtensionQuery<TData> extends ArenaWagerModuleReactQuery<Binary, TData> {
  args: {
    msg: Empty;
  };
}
export function useArenaWagerModuleQueryExtensionQuery<TData = Binary>({
  client,
  args,
  options
}: ArenaWagerModuleQueryExtensionQuery<TData>) {
  return useQuery<Binary, Error, TData>(arenaWagerModuleQueryKeys.queryExtension(client?.contractAddress, args), () => client ? client.queryExtension({
    msg: args.msg
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaWagerModuleCompetitionsQuery<TData> extends ArenaWagerModuleReactQuery<ArrayOfCompetitionResponseForEmpty, TData> {
  args: {
    includeRuleset?: boolean;
    limit?: number;
    startAfter?: Uint128;
  };
}
export function useArenaWagerModuleCompetitionsQuery<TData = ArrayOfCompetitionResponseForEmpty>({
  client,
  args,
  options
}: ArenaWagerModuleCompetitionsQuery<TData>) {
  return useQuery<ArrayOfCompetitionResponseForEmpty, Error, TData>(arenaWagerModuleQueryKeys.competitions(client?.contractAddress, args), () => client ? client.competitions({
    includeRuleset: args.includeRuleset,
    limit: args.limit,
    startAfter: args.startAfter
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaWagerModuleCompetitionQuery<TData> extends ArenaWagerModuleReactQuery<CompetitionResponseForEmpty, TData> {
  args: {
    id: Uint128;
    includeRuleset?: boolean;
  };
}
export function useArenaWagerModuleCompetitionQuery<TData = CompetitionResponseForEmpty>({
  client,
  args,
  options
}: ArenaWagerModuleCompetitionQuery<TData>) {
  return useQuery<CompetitionResponseForEmpty, Error, TData>(arenaWagerModuleQueryKeys.competition(client?.contractAddress, args), () => client ? client.competition({
    id: args.id,
    includeRuleset: args.includeRuleset
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaWagerModuleCompetitionCountQuery<TData> extends ArenaWagerModuleReactQuery<Uint128, TData> {}
export function useArenaWagerModuleCompetitionCountQuery<TData = Uint128>({
  client,
  options
}: ArenaWagerModuleCompetitionCountQuery<TData>) {
  return useQuery<Uint128, Error, TData>(arenaWagerModuleQueryKeys.competitionCount(client?.contractAddress), () => client ? client.competitionCount() : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaWagerModuleConfigQuery<TData> extends ArenaWagerModuleReactQuery<Config, TData> {}
export function useArenaWagerModuleConfigQuery<TData = Config>({
  client,
  options
}: ArenaWagerModuleConfigQuery<TData>) {
  return useQuery<Config, Error, TData>(arenaWagerModuleQueryKeys.config(client?.contractAddress), () => client ? client.config() : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaWagerModuleUpdateOwnershipMutation {
  client: ArenaWagerModuleClient;
  msg: Action;
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaWagerModuleUpdateOwnershipMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaWagerModuleUpdateOwnershipMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaWagerModuleUpdateOwnershipMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.updateOwnership(msg, fee, memo, funds), options);
}
export interface ArenaWagerModuleExtensionMutation {
  client: ArenaWagerModuleClient;
  msg: {
    msg: Empty;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaWagerModuleExtensionMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaWagerModuleExtensionMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaWagerModuleExtensionMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.extension(msg, fee, memo, funds), options);
}
export interface ArenaWagerModuleProcessCompetitionMutation {
  client: ArenaWagerModuleClient;
  msg: {
    distribution?: MemberShare[];
    id: Uint128;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaWagerModuleProcessCompetitionMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaWagerModuleProcessCompetitionMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaWagerModuleProcessCompetitionMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.processCompetition(msg, fee, memo, funds), options);
}
export interface ArenaWagerModuleGenerateProposalsMutation {
  client: ArenaWagerModuleClient;
  msg: {
    id: Uint128;
    proposalDetails: ProposalDetails;
    proposalModuleAddr: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaWagerModuleGenerateProposalsMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaWagerModuleGenerateProposalsMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaWagerModuleGenerateProposalsMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.generateProposals(msg, fee, memo, funds), options);
}
export interface ArenaWagerModuleCreateCompetitionMutation {
  client: ArenaWagerModuleClient;
  msg: {
    competitionDao: ModuleInstantiateInfo;
    description: string;
    escrow: ModuleInstantiateInfo;
    expiration: Expiration;
    extension: Empty;
    name: string;
    rules: string[];
    ruleset?: Uint128;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaWagerModuleCreateCompetitionMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaWagerModuleCreateCompetitionMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaWagerModuleCreateCompetitionMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.createCompetition(msg, fee, memo, funds), options);
}
export interface ArenaWagerModuleActivateMutation {
  client: ArenaWagerModuleClient;
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaWagerModuleActivateMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaWagerModuleActivateMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaWagerModuleActivateMutation>(({
    client,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.activate(fee, memo, funds), options);
}
export interface ArenaWagerModuleJailCompetitionMutation {
  client: ArenaWagerModuleClient;
  msg: {
    id: Uint128;
    proposalDetails: ProposalDetails;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaWagerModuleJailCompetitionMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaWagerModuleJailCompetitionMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaWagerModuleJailCompetitionMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.jailCompetition(msg, fee, memo, funds), options);
}