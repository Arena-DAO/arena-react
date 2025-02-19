/**
* This file was automatically generated by @cosmwasm/ts-codegen@1.12.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { UseQueryOptions, useQuery, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { StdFee, Coin } from "@cosmjs/amino";
import { InstantiateMsg, ExecuteMsg, Decimal, DistributionForString, MemberPercentageForString, QueryMsg, MigrateMsg, NullableDistributionForString } from "./ArenaPaymentRegistry.types";
import { ArenaPaymentRegistryQueryClient, ArenaPaymentRegistryClient } from "./ArenaPaymentRegistry.client";
export const arenaPaymentRegistryQueryKeys = {
  contract: ([{
    contract: "arenaPaymentRegistry"
  }] as const),
  address: (contractAddress: string | undefined) => ([{
    ...arenaPaymentRegistryQueryKeys.contract[0],
    address: contractAddress
  }] as const),
  getDistribution: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaPaymentRegistryQueryKeys.address(contractAddress)[0],
    method: "get_distribution",
    args
  }] as const)
};
export const arenaPaymentRegistryQueries = {
  getDistribution: <TData = NullableDistributionForString,>({
    client,
    args,
    options
  }: ArenaPaymentRegistryGetDistributionQuery<TData>): UseQueryOptions<NullableDistributionForString, Error, TData> => ({
    queryKey: arenaPaymentRegistryQueryKeys.getDistribution(client?.contractAddress, args),
    queryFn: () => client ? client.getDistribution({
      addr: args.addr,
      height: args.height
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  })
};
export interface ArenaPaymentRegistryReactQuery<TResponse, TData = TResponse> {
  client: ArenaPaymentRegistryQueryClient | undefined;
  options?: Omit<UseQueryOptions<TResponse, Error, TData>, "'queryKey' | 'queryFn' | 'initialData'"> & {
    initialData?: undefined;
  };
}
export interface ArenaPaymentRegistryGetDistributionQuery<TData> extends ArenaPaymentRegistryReactQuery<NullableDistributionForString, TData> {
  args: {
    addr: string;
    height?: number;
  };
}
export function useArenaPaymentRegistryGetDistributionQuery<TData = NullableDistributionForString>({
  client,
  args,
  options
}: ArenaPaymentRegistryGetDistributionQuery<TData>) {
  return useQuery<NullableDistributionForString, Error, TData>(arenaPaymentRegistryQueryKeys.getDistribution(client?.contractAddress, args), () => client ? client.getDistribution({
    addr: args.addr,
    height: args.height
  }) : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaPaymentRegistryRemoveDistributionMutation {
  client: ArenaPaymentRegistryClient;
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaPaymentRegistryRemoveDistributionMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaPaymentRegistryRemoveDistributionMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaPaymentRegistryRemoveDistributionMutation>(({
    client,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.removeDistribution(fee, memo, funds), options);
}
export interface ArenaPaymentRegistrySetDistributionRemainderSelfMutation {
  client: ArenaPaymentRegistryClient;
  msg: {
    memberPercentages: MemberPercentageForString[];
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaPaymentRegistrySetDistributionRemainderSelfMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaPaymentRegistrySetDistributionRemainderSelfMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaPaymentRegistrySetDistributionRemainderSelfMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.setDistributionRemainderSelf(msg, fee, memo, funds), options);
}
export interface ArenaPaymentRegistrySetDistributionMutation {
  client: ArenaPaymentRegistryClient;
  msg: {
    distribution: DistributionForString;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaPaymentRegistrySetDistributionMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaPaymentRegistrySetDistributionMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaPaymentRegistrySetDistributionMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.setDistribution(msg, fee, memo, funds), options);
}