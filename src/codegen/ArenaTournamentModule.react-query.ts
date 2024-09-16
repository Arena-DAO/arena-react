/**
* This file was automatically generated by @cosmwasm/ts-codegen@1.11.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { UseQueryOptions, useQuery, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { StdFee, Coin } from "@cosmjs/amino";
import { InstantiateMsg, Empty, ExecuteMsg, Binary, Decimal, Uint128, Expiration, Timestamp, Uint64, EliminationType, ExecuteExt, MatchResult, MigrateMsg, CompetitionsFilter, CompetitionStatus, StatMsg, StatValue, StatAggregationType, StatValueType, Action, FeeInformationForString, DistributionForString, MemberPercentageForString, EscrowInstantiateInfo, TournamentInstantiateExt, MatchResultMsg, MemberStatsMsg, StatType, QueryMsg, QueryExt, Addr, SudoMsg, Match, Null, CompetitionResponseForTournamentExt, TournamentExt, FeeInformationForAddr, ArrayOfCompetitionResponseForTournamentExt, ConfigForEmpty, String, ArrayOfEvidence, Evidence, ArrayOfArrayOfStatMsg, OwnershipForString, NullableString, NullableDistributionForString, NullableArrayOfStatType, ArrayOfStatTableEntry, StatTableEntry } from "./ArenaTournamentModule.types";
import { ArenaTournamentModuleQueryClient, ArenaTournamentModuleClient } from "./ArenaTournamentModule.client";
export const arenaTournamentModuleQueryKeys = {
  contract: ([{
    contract: "arenaTournamentModule"
  }] as const),
  address: (contractAddress: string | undefined) => ([{
    ...arenaTournamentModuleQueryKeys.contract[0],
    address: contractAddress
  }] as const),
  config: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "config",
    args
  }] as const),
  dAO: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "d_a_o",
    args
  }] as const),
  competitionCount: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "competition_count",
    args
  }] as const),
  competition: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "competition",
    args
  }] as const),
  competitions: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "competitions",
    args
  }] as const),
  evidence: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "evidence",
    args
  }] as const),
  result: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "result",
    args
  }] as const),
  queryExtension: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "query_extension",
    args
  }] as const),
  paymentRegistry: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "payment_registry",
    args
  }] as const),
  statTypes: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "stat_types",
    args
  }] as const),
  historicalStats: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "historical_stats",
    args
  }] as const),
  statsTable: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "stats_table",
    args
  }] as const),
  stat: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "stat",
    args
  }] as const),
  ownership: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTournamentModuleQueryKeys.address(contractAddress)[0],
    method: "ownership",
    args
  }] as const)
};
export const arenaTournamentModuleQueries = {
  config: <TData = ConfigForEmpty,>({
    client,
    options
  }: ArenaTournamentModuleConfigQuery<TData>): UseQueryOptions<ConfigForEmpty, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.config(client?.contractAddress),
    queryFn: () => client ? client.config() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  dAO: <TData = String,>({
    client,
    options
  }: ArenaTournamentModuleDAOQuery<TData>): UseQueryOptions<String, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.dAO(client?.contractAddress),
    queryFn: () => client ? client.dAO() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  competitionCount: <TData = Uint128,>({
    client,
    options
  }: ArenaTournamentModuleCompetitionCountQuery<TData>): UseQueryOptions<Uint128, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.competitionCount(client?.contractAddress),
    queryFn: () => client ? client.competitionCount() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  competition: <TData = CompetitionResponseForTournamentExt,>({
    client,
    args,
    options
  }: ArenaTournamentModuleCompetitionQuery<TData>): UseQueryOptions<CompetitionResponseForTournamentExt, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.competition(client?.contractAddress, args),
    queryFn: () => client ? client.competition({
      competitionId: args.competitionId
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  competitions: <TData = ArrayOfCompetitionResponseForTournamentExt,>({
    client,
    args,
    options
  }: ArenaTournamentModuleCompetitionsQuery<TData>): UseQueryOptions<ArrayOfCompetitionResponseForTournamentExt, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.competitions(client?.contractAddress, args),
    queryFn: () => client ? client.competitions({
      filter: args.filter,
      limit: args.limit,
      startAfter: args.startAfter
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  evidence: <TData = ArrayOfEvidence,>({
    client,
    args,
    options
  }: ArenaTournamentModuleEvidenceQuery<TData>): UseQueryOptions<ArrayOfEvidence, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.evidence(client?.contractAddress, args),
    queryFn: () => client ? client.evidence({
      competitionId: args.competitionId,
      limit: args.limit,
      startAfter: args.startAfter
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  result: <TData = NullableDistributionForString,>({
    client,
    args,
    options
  }: ArenaTournamentModuleResultQuery<TData>): UseQueryOptions<NullableDistributionForString, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.result(client?.contractAddress, args),
    queryFn: () => client ? client.result({
      competitionId: args.competitionId
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  queryExtension: <TData = Binary,>({
    client,
    args,
    options
  }: ArenaTournamentModuleQueryExtensionQuery<TData>): UseQueryOptions<Binary, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.queryExtension(client?.contractAddress, args),
    queryFn: () => client ? client.queryExtension({
      msg: args.msg
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  paymentRegistry: <TData = NullableString,>({
    client,
    options
  }: ArenaTournamentModulePaymentRegistryQuery<TData>): UseQueryOptions<NullableString, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.paymentRegistry(client?.contractAddress),
    queryFn: () => client ? client.paymentRegistry() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  statTypes: <TData = NullableArrayOfStatType,>({
    client,
    args,
    options
  }: ArenaTournamentModuleStatTypesQuery<TData>): UseQueryOptions<NullableArrayOfStatType, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.statTypes(client?.contractAddress, args),
    queryFn: () => client ? client.statTypes({
      competitionId: args.competitionId
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  historicalStats: <TData = ArrayOfArrayOfStatMsg,>({
    client,
    args,
    options
  }: ArenaTournamentModuleHistoricalStatsQuery<TData>): UseQueryOptions<ArrayOfArrayOfStatMsg, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.historicalStats(client?.contractAddress, args),
    queryFn: () => client ? client.historicalStats({
      addr: args.addr,
      competitionId: args.competitionId
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  statsTable: <TData = ArrayOfStatTableEntry,>({
    client,
    args,
    options
  }: ArenaTournamentModuleStatsTableQuery<TData>): UseQueryOptions<ArrayOfStatTableEntry, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.statsTable(client?.contractAddress, args),
    queryFn: () => client ? client.statsTable({
      competitionId: args.competitionId,
      limit: args.limit,
      startAfter: args.startAfter
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  stat: <TData = StatMsg,>({
    client,
    args,
    options
  }: ArenaTournamentModuleStatQuery<TData>): UseQueryOptions<StatMsg, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.stat(client?.contractAddress, args),
    queryFn: () => client ? client.stat({
      addr: args.addr,
      competitionId: args.competitionId,
      height: args.height,
      statName: args.statName
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  ownership: <TData = OwnershipForString,>({
    client,
    options
  }: ArenaTournamentModuleOwnershipQuery<TData>): UseQueryOptions<OwnershipForString, Error, TData> => ({
    queryKey: arenaTournamentModuleQueryKeys.ownership(client?.contractAddress),
    queryFn: () => client ? client.ownership() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  })
};
export interface ArenaTournamentModuleReactQuery<TResponse, TData = TResponse> {
  client: ArenaTournamentModuleQueryClient | undefined;
  options?: Omit<UseQueryOptions<TResponse, Error, TData>, "'queryKey' | 'queryFn' | 'initialData'"> & {
    initialData?: undefined;
  };
}
export interface ArenaTournamentModuleOwnershipQuery<TData> extends ArenaTournamentModuleReactQuery<OwnershipForString, TData> {}
export function useArenaTournamentModuleOwnershipQuery<TData = OwnershipForString>({
  client,
  options
}: ArenaTournamentModuleOwnershipQuery<TData>) {
  return useQuery<OwnershipForString, Error, TData>(arenaTournamentModuleQueryKeys.ownership(client?.contractAddress), () => client ? client.ownership() : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModuleStatQuery<TData> extends ArenaTournamentModuleReactQuery<StatMsg, TData> {
  args: {
    addr: string;
    competitionId: Uint128;
    height?: number;
    statName: string;
  };
}
export function useArenaTournamentModuleStatQuery<TData = StatMsg>({
  client,
  args,
  options
}: ArenaTournamentModuleStatQuery<TData>) {
  return useQuery<StatMsg, Error, TData>(arenaTournamentModuleQueryKeys.stat(client?.contractAddress, args), () => client ? client.stat({
    addr: args.addr,
    competitionId: args.competitionId,
    height: args.height,
    statName: args.statName
  }) : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModuleStatsTableQuery<TData> extends ArenaTournamentModuleReactQuery<ArrayOfStatTableEntry, TData> {
  args: {
    competitionId: Uint128;
    limit?: number;
    startAfter?: string[][];
  };
}
export function useArenaTournamentModuleStatsTableQuery<TData = ArrayOfStatTableEntry>({
  client,
  args,
  options
}: ArenaTournamentModuleStatsTableQuery<TData>) {
  return useQuery<ArrayOfStatTableEntry, Error, TData>(arenaTournamentModuleQueryKeys.statsTable(client?.contractAddress, args), () => client ? client.statsTable({
    competitionId: args.competitionId,
    limit: args.limit,
    startAfter: args.startAfter
  }) : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModuleHistoricalStatsQuery<TData> extends ArenaTournamentModuleReactQuery<ArrayOfArrayOfStatMsg, TData> {
  args: {
    addr: string;
    competitionId: Uint128;
  };
}
export function useArenaTournamentModuleHistoricalStatsQuery<TData = ArrayOfArrayOfStatMsg>({
  client,
  args,
  options
}: ArenaTournamentModuleHistoricalStatsQuery<TData>) {
  return useQuery<ArrayOfArrayOfStatMsg, Error, TData>(arenaTournamentModuleQueryKeys.historicalStats(client?.contractAddress, args), () => client ? client.historicalStats({
    addr: args.addr,
    competitionId: args.competitionId
  }) : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModuleStatTypesQuery<TData> extends ArenaTournamentModuleReactQuery<NullableArrayOfStatType, TData> {
  args: {
    competitionId: Uint128;
  };
}
export function useArenaTournamentModuleStatTypesQuery<TData = NullableArrayOfStatType>({
  client,
  args,
  options
}: ArenaTournamentModuleStatTypesQuery<TData>) {
  return useQuery<NullableArrayOfStatType, Error, TData>(arenaTournamentModuleQueryKeys.statTypes(client?.contractAddress, args), () => client ? client.statTypes({
    competitionId: args.competitionId
  }) : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModulePaymentRegistryQuery<TData> extends ArenaTournamentModuleReactQuery<NullableString, TData> {}
export function useArenaTournamentModulePaymentRegistryQuery<TData = NullableString>({
  client,
  options
}: ArenaTournamentModulePaymentRegistryQuery<TData>) {
  return useQuery<NullableString, Error, TData>(arenaTournamentModuleQueryKeys.paymentRegistry(client?.contractAddress), () => client ? client.paymentRegistry() : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModuleQueryExtensionQuery<TData> extends ArenaTournamentModuleReactQuery<Binary, TData> {
  args: {
    msg: QueryExt;
  };
}
export function useArenaTournamentModuleQueryExtensionQuery<TData = Binary>({
  client,
  args,
  options
}: ArenaTournamentModuleQueryExtensionQuery<TData>) {
  return useQuery<Binary, Error, TData>(arenaTournamentModuleQueryKeys.queryExtension(client?.contractAddress, args), () => client ? client.queryExtension({
    msg: args.msg
  }) : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModuleResultQuery<TData> extends ArenaTournamentModuleReactQuery<NullableDistributionForString, TData> {
  args: {
    competitionId: Uint128;
  };
}
export function useArenaTournamentModuleResultQuery<TData = NullableDistributionForString>({
  client,
  args,
  options
}: ArenaTournamentModuleResultQuery<TData>) {
  return useQuery<NullableDistributionForString, Error, TData>(arenaTournamentModuleQueryKeys.result(client?.contractAddress, args), () => client ? client.result({
    competitionId: args.competitionId
  }) : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModuleEvidenceQuery<TData> extends ArenaTournamentModuleReactQuery<ArrayOfEvidence, TData> {
  args: {
    competitionId: Uint128;
    limit?: number;
    startAfter?: Uint128;
  };
}
export function useArenaTournamentModuleEvidenceQuery<TData = ArrayOfEvidence>({
  client,
  args,
  options
}: ArenaTournamentModuleEvidenceQuery<TData>) {
  return useQuery<ArrayOfEvidence, Error, TData>(arenaTournamentModuleQueryKeys.evidence(client?.contractAddress, args), () => client ? client.evidence({
    competitionId: args.competitionId,
    limit: args.limit,
    startAfter: args.startAfter
  }) : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModuleCompetitionsQuery<TData> extends ArenaTournamentModuleReactQuery<ArrayOfCompetitionResponseForTournamentExt, TData> {
  args: {
    filter?: CompetitionsFilter;
    limit?: number;
    startAfter?: Uint128;
  };
}
export function useArenaTournamentModuleCompetitionsQuery<TData = ArrayOfCompetitionResponseForTournamentExt>({
  client,
  args,
  options
}: ArenaTournamentModuleCompetitionsQuery<TData>) {
  return useQuery<ArrayOfCompetitionResponseForTournamentExt, Error, TData>(arenaTournamentModuleQueryKeys.competitions(client?.contractAddress, args), () => client ? client.competitions({
    filter: args.filter,
    limit: args.limit,
    startAfter: args.startAfter
  }) : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModuleCompetitionQuery<TData> extends ArenaTournamentModuleReactQuery<CompetitionResponseForTournamentExt, TData> {
  args: {
    competitionId: Uint128;
  };
}
export function useArenaTournamentModuleCompetitionQuery<TData = CompetitionResponseForTournamentExt>({
  client,
  args,
  options
}: ArenaTournamentModuleCompetitionQuery<TData>) {
  return useQuery<CompetitionResponseForTournamentExt, Error, TData>(arenaTournamentModuleQueryKeys.competition(client?.contractAddress, args), () => client ? client.competition({
    competitionId: args.competitionId
  }) : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModuleCompetitionCountQuery<TData> extends ArenaTournamentModuleReactQuery<Uint128, TData> {}
export function useArenaTournamentModuleCompetitionCountQuery<TData = Uint128>({
  client,
  options
}: ArenaTournamentModuleCompetitionCountQuery<TData>) {
  return useQuery<Uint128, Error, TData>(arenaTournamentModuleQueryKeys.competitionCount(client?.contractAddress), () => client ? client.competitionCount() : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModuleDAOQuery<TData> extends ArenaTournamentModuleReactQuery<String, TData> {}
export function useArenaTournamentModuleDAOQuery<TData = String>({
  client,
  options
}: ArenaTournamentModuleDAOQuery<TData>) {
  return useQuery<String, Error, TData>(arenaTournamentModuleQueryKeys.dAO(client?.contractAddress), () => client ? client.dAO() : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModuleConfigQuery<TData> extends ArenaTournamentModuleReactQuery<ConfigForEmpty, TData> {}
export function useArenaTournamentModuleConfigQuery<TData = ConfigForEmpty>({
  client,
  options
}: ArenaTournamentModuleConfigQuery<TData>) {
  return useQuery<ConfigForEmpty, Error, TData>(arenaTournamentModuleQueryKeys.config(client?.contractAddress), () => client ? client.config() : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTournamentModuleUpdateOwnershipMutation {
  client: ArenaTournamentModuleClient;
  msg: Action;
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTournamentModuleUpdateOwnershipMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTournamentModuleUpdateOwnershipMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTournamentModuleUpdateOwnershipMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.updateOwnership(msg, fee, memo, funds), options);
}
export interface ArenaTournamentModuleUpdateStatTypesMutation {
  client: ArenaTournamentModuleClient;
  msg: {
    competitionId: Uint128;
    toAdd: StatType[];
    toRemove: string[];
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTournamentModuleUpdateStatTypesMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTournamentModuleUpdateStatTypesMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTournamentModuleUpdateStatTypesMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.updateStatTypes(msg, fee, memo, funds), options);
}
export interface ArenaTournamentModuleInputStatsMutation {
  client: ArenaTournamentModuleClient;
  msg: {
    competitionId: Uint128;
    stats: MemberStatsMsg[];
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTournamentModuleInputStatsMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTournamentModuleInputStatsMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTournamentModuleInputStatsMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.inputStats(msg, fee, memo, funds), options);
}
export interface ArenaTournamentModuleMigrateEscrowsMutation {
  client: ArenaTournamentModuleClient;
  msg: {
    escrowCodeId: number;
    escrowMigrateMsg: MigrateMsg;
    filter?: CompetitionsFilter;
    limit?: number;
    startAfter?: Uint128;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTournamentModuleMigrateEscrowsMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTournamentModuleMigrateEscrowsMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTournamentModuleMigrateEscrowsMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.migrateEscrows(msg, fee, memo, funds), options);
}
export interface ArenaTournamentModuleExtensionMutation {
  client: ArenaTournamentModuleClient;
  msg: {
    msg: ExecuteExt;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTournamentModuleExtensionMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTournamentModuleExtensionMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTournamentModuleExtensionMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.extension(msg, fee, memo, funds), options);
}
export interface ArenaTournamentModuleProcessCompetitionMutation {
  client: ArenaTournamentModuleClient;
  msg: {
    competitionId: Uint128;
    distribution?: DistributionForString;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTournamentModuleProcessCompetitionMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTournamentModuleProcessCompetitionMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTournamentModuleProcessCompetitionMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.processCompetition(msg, fee, memo, funds), options);
}
export interface ArenaTournamentModuleSubmitEvidenceMutation {
  client: ArenaTournamentModuleClient;
  msg: {
    competitionId: Uint128;
    evidence: string[];
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTournamentModuleSubmitEvidenceMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTournamentModuleSubmitEvidenceMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTournamentModuleSubmitEvidenceMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.submitEvidence(msg, fee, memo, funds), options);
}
export interface ArenaTournamentModuleCreateCompetitionMutation {
  client: ArenaTournamentModuleClient;
  msg: {
    banner?: string;
    categoryId?: Uint128;
    description: string;
    escrow?: EscrowInstantiateInfo;
    expiration: Expiration;
    host?: string;
    instantiateExtension: TournamentInstantiateExt;
    name: string;
    rules?: string[];
    rulesets?: Uint128[];
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTournamentModuleCreateCompetitionMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTournamentModuleCreateCompetitionMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTournamentModuleCreateCompetitionMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.createCompetition(msg, fee, memo, funds), options);
}
export interface ArenaTournamentModuleExecuteCompetitionHookMutation {
  client: ArenaTournamentModuleClient;
  msg: {
    competitionId: Uint128;
    distribution?: DistributionForString;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTournamentModuleExecuteCompetitionHookMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTournamentModuleExecuteCompetitionHookMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTournamentModuleExecuteCompetitionHookMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.executeCompetitionHook(msg, fee, memo, funds), options);
}
export interface ArenaTournamentModuleRemoveCompetitionHookMutation {
  client: ArenaTournamentModuleClient;
  msg: {
    competitionId: Uint128;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTournamentModuleRemoveCompetitionHookMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTournamentModuleRemoveCompetitionHookMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTournamentModuleRemoveCompetitionHookMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.removeCompetitionHook(msg, fee, memo, funds), options);
}
export interface ArenaTournamentModuleAddCompetitionHookMutation {
  client: ArenaTournamentModuleClient;
  msg: {
    competitionId: Uint128;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTournamentModuleAddCompetitionHookMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTournamentModuleAddCompetitionHookMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTournamentModuleAddCompetitionHookMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.addCompetitionHook(msg, fee, memo, funds), options);
}
export interface ArenaTournamentModuleActivateCompetitionMutation {
  client: ArenaTournamentModuleClient;
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTournamentModuleActivateCompetitionMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTournamentModuleActivateCompetitionMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTournamentModuleActivateCompetitionMutation>(({
    client,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.activateCompetition(fee, memo, funds), options);
}
export interface ArenaTournamentModuleJailCompetitionMutation {
  client: ArenaTournamentModuleClient;
  msg: {
    additionalLayeredFees?: FeeInformationForString;
    competitionId: Uint128;
    description: string;
    distribution?: DistributionForString;
    title: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTournamentModuleJailCompetitionMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTournamentModuleJailCompetitionMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTournamentModuleJailCompetitionMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.jailCompetition(msg, fee, memo, funds), options);
}