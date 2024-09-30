/**
* This file was automatically generated by @cosmwasm/ts-codegen@1.11.1.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { UseQueryOptions, useQuery, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { StdFee, Coin } from "@cosmjs/amino";
import { Decimal, InstantiateMsg, VestingConfiguration, ExecuteMsg, Uint128, Action, Expiration, Timestamp, Uint64, ApplyMsg, ProjectLink, QueryMsg, ApplicationsFilter, ApplicationStatus, MigrateMsg, Addr, ApplicationResponse, ApplicationInfo, ArrayOfApplicationResponse, OwnershipForString } from "./ArenaTokenGateway.types";
import { ArenaTokenGatewayQueryClient, ArenaTokenGatewayClient } from "./ArenaTokenGateway.client";
export const arenaTokenGatewayQueryKeys = {
  contract: ([{
    contract: "arenaTokenGateway"
  }] as const),
  address: (contractAddress: string | undefined) => ([{
    ...arenaTokenGatewayQueryKeys.contract[0],
    address: contractAddress
  }] as const),
  vestingConfiguration: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTokenGatewayQueryKeys.address(contractAddress)[0],
    method: "vesting_configuration",
    args
  }] as const),
  application: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTokenGatewayQueryKeys.address(contractAddress)[0],
    method: "application",
    args
  }] as const),
  applications: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTokenGatewayQueryKeys.address(contractAddress)[0],
    method: "applications",
    args
  }] as const),
  payrollAddress: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTokenGatewayQueryKeys.address(contractAddress)[0],
    method: "payroll_address",
    args
  }] as const),
  ownership: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{
    ...arenaTokenGatewayQueryKeys.address(contractAddress)[0],
    method: "ownership",
    args
  }] as const)
};
export const arenaTokenGatewayQueries = {
  vestingConfiguration: <TData = VestingConfiguration,>({
    client,
    options
  }: ArenaTokenGatewayVestingConfigurationQuery<TData>): UseQueryOptions<VestingConfiguration, Error, TData> => ({
    queryKey: arenaTokenGatewayQueryKeys.vestingConfiguration(client?.contractAddress),
    queryFn: () => client ? client.vestingConfiguration() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  application: <TData = ApplicationResponse,>({
    client,
    args,
    options
  }: ArenaTokenGatewayApplicationQuery<TData>): UseQueryOptions<ApplicationResponse, Error, TData> => ({
    queryKey: arenaTokenGatewayQueryKeys.application(client?.contractAddress, args),
    queryFn: () => client ? client.application({
      applicationId: args.applicationId
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  applications: <TData = ArrayOfApplicationResponse,>({
    client,
    args,
    options
  }: ArenaTokenGatewayApplicationsQuery<TData>): UseQueryOptions<ArrayOfApplicationResponse, Error, TData> => ({
    queryKey: arenaTokenGatewayQueryKeys.applications(client?.contractAddress, args),
    queryFn: () => client ? client.applications({
      filter: args.filter,
      limit: args.limit,
      startAfter: args.startAfter
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  payrollAddress: <TData = Addr,>({
    client,
    options
  }: ArenaTokenGatewayPayrollAddressQuery<TData>): UseQueryOptions<Addr, Error, TData> => ({
    queryKey: arenaTokenGatewayQueryKeys.payrollAddress(client?.contractAddress),
    queryFn: () => client ? client.payrollAddress() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  ownership: <TData = OwnershipForString,>({
    client,
    options
  }: ArenaTokenGatewayOwnershipQuery<TData>): UseQueryOptions<OwnershipForString, Error, TData> => ({
    queryKey: arenaTokenGatewayQueryKeys.ownership(client?.contractAddress),
    queryFn: () => client ? client.ownership() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  })
};
export interface ArenaTokenGatewayReactQuery<TResponse, TData = TResponse> {
  client: ArenaTokenGatewayQueryClient | undefined;
  options?: Omit<UseQueryOptions<TResponse, Error, TData>, "'queryKey' | 'queryFn' | 'initialData'"> & {
    initialData?: undefined;
  };
}
export interface ArenaTokenGatewayOwnershipQuery<TData> extends ArenaTokenGatewayReactQuery<OwnershipForString, TData> {}
export function useArenaTokenGatewayOwnershipQuery<TData = OwnershipForString>({
  client,
  options
}: ArenaTokenGatewayOwnershipQuery<TData>) {
  return useQuery<OwnershipForString, Error, TData>(arenaTokenGatewayQueryKeys.ownership(client?.contractAddress), () => client ? client.ownership() : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTokenGatewayPayrollAddressQuery<TData> extends ArenaTokenGatewayReactQuery<Addr, TData> {}
export function useArenaTokenGatewayPayrollAddressQuery<TData = Addr>({
  client,
  options
}: ArenaTokenGatewayPayrollAddressQuery<TData>) {
  return useQuery<Addr, Error, TData>(arenaTokenGatewayQueryKeys.payrollAddress(client?.contractAddress), () => client ? client.payrollAddress() : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTokenGatewayApplicationsQuery<TData> extends ArenaTokenGatewayReactQuery<ArrayOfApplicationResponse, TData> {
  args: {
    filter?: ApplicationsFilter;
    limit?: number;
    startAfter?: Uint128;
  };
}
export function useArenaTokenGatewayApplicationsQuery<TData = ArrayOfApplicationResponse>({
  client,
  args,
  options
}: ArenaTokenGatewayApplicationsQuery<TData>) {
  return useQuery<ArrayOfApplicationResponse, Error, TData>(arenaTokenGatewayQueryKeys.applications(client?.contractAddress, args), () => client ? client.applications({
    filter: args.filter,
    limit: args.limit,
    startAfter: args.startAfter
  }) : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTokenGatewayApplicationQuery<TData> extends ArenaTokenGatewayReactQuery<ApplicationResponse, TData> {
  args: {
    applicationId: Uint128;
  };
}
export function useArenaTokenGatewayApplicationQuery<TData = ApplicationResponse>({
  client,
  args,
  options
}: ArenaTokenGatewayApplicationQuery<TData>) {
  return useQuery<ApplicationResponse, Error, TData>(arenaTokenGatewayQueryKeys.application(client?.contractAddress, args), () => client ? client.application({
    applicationId: args.applicationId
  }) : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTokenGatewayVestingConfigurationQuery<TData> extends ArenaTokenGatewayReactQuery<VestingConfiguration, TData> {}
export function useArenaTokenGatewayVestingConfigurationQuery<TData = VestingConfiguration>({
  client,
  options
}: ArenaTokenGatewayVestingConfigurationQuery<TData>) {
  return useQuery<VestingConfiguration, Error, TData>(arenaTokenGatewayQueryKeys.vestingConfiguration(client?.contractAddress), () => client ? client.vestingConfiguration() : Promise.reject(new Error("Invalid client")), {
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaTokenGatewayUpdateOwnershipMutation {
  client: ArenaTokenGatewayClient;
  msg: Action;
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTokenGatewayUpdateOwnershipMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTokenGatewayUpdateOwnershipMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTokenGatewayUpdateOwnershipMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.updateOwnership(msg, fee, memo, funds), options);
}
export interface ArenaTokenGatewayUpdateVestingConfigurationMutation {
  client: ArenaTokenGatewayClient;
  msg: {
    config: VestingConfiguration;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTokenGatewayUpdateVestingConfigurationMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTokenGatewayUpdateVestingConfigurationMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTokenGatewayUpdateVestingConfigurationMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.updateVestingConfiguration(msg, fee, memo, funds), options);
}
export interface ArenaTokenGatewayRejectApplicationMutation {
  client: ArenaTokenGatewayClient;
  msg: {
    applicationId: Uint128;
    reason?: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTokenGatewayRejectApplicationMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTokenGatewayRejectApplicationMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTokenGatewayRejectApplicationMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.rejectApplication(msg, fee, memo, funds), options);
}
export interface ArenaTokenGatewayAcceptApplicationMutation {
  client: ArenaTokenGatewayClient;
  msg: {
    applicationId: Uint128;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTokenGatewayAcceptApplicationMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTokenGatewayAcceptApplicationMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTokenGatewayAcceptApplicationMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.acceptApplication(msg, fee, memo, funds), options);
}
export interface ArenaTokenGatewayWithdrawMutation {
  client: ArenaTokenGatewayClient;
  msg: {
    applicationId: Uint128;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTokenGatewayWithdrawMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTokenGatewayWithdrawMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTokenGatewayWithdrawMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.withdraw(msg, fee, memo, funds), options);
}
export interface ArenaTokenGatewayUpdateMutation {
  client: ArenaTokenGatewayClient;
  msg: {
    applicationId: Uint128;
    applicationInfo: ApplyMsg;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTokenGatewayUpdateMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTokenGatewayUpdateMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTokenGatewayUpdateMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.update(msg, fee, memo, funds), options);
}
export interface ArenaTokenGatewayApplyMutation {
  client: ArenaTokenGatewayClient;
  msg: {
    description: string;
    project_links: ProjectLink[];
    requested_amount: Uint128;
    title: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaTokenGatewayApplyMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaTokenGatewayApplyMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaTokenGatewayApplyMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.apply(msg, fee, memo, funds), options);
}