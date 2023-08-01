/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.27.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { UseQueryOptions, useQuery, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { StdFee } from "@cosmjs/amino";
import { Uint128, DepositToken, UncheckedDenom, DepositRefundPolicy, InstantiateMsg, UncheckedDepositInfo, Empty, ExecuteMsg, ProposeMessage, CosmosMsgForEmpty, BankMsg, StakingMsg, DistributionMsg, Binary, IbcMsg, Timestamp, Uint64, WasmMsg, GovMsg, VoteOption, Status, MultipleChoiceOptions, MultipleChoiceOption, Coin, IbcTimeout, IbcTimeoutBlock, QueryMsg, CheckedDenom, Addr, Config, CheckedDepositInfo, DepositInfoResponse, HooksResponse } from "./DaoPreProposeMultiple.types";
import { DaoPreProposeMultipleQueryClient, DaoPreProposeMultipleClient } from "./DaoPreProposeMultiple.client";
export const daoPreProposeMultipleQueryKeys = {
  contract: ([{
    contract: "daoPreProposeMultiple"
  }] as const),
  address: (contractAddress: string | undefined) => ([{ ...daoPreProposeMultipleQueryKeys.contract[0],
    address: contractAddress
  }] as const),
  proposalModule: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...daoPreProposeMultipleQueryKeys.address(contractAddress)[0],
    method: "proposal_module",
    args
  }] as const),
  dao: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...daoPreProposeMultipleQueryKeys.address(contractAddress)[0],
    method: "dao",
    args
  }] as const),
  config: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...daoPreProposeMultipleQueryKeys.address(contractAddress)[0],
    method: "config",
    args
  }] as const),
  depositInfo: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...daoPreProposeMultipleQueryKeys.address(contractAddress)[0],
    method: "deposit_info",
    args
  }] as const),
  proposalSubmittedHooks: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...daoPreProposeMultipleQueryKeys.address(contractAddress)[0],
    method: "proposal_submitted_hooks",
    args
  }] as const),
  queryExtension: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...daoPreProposeMultipleQueryKeys.address(contractAddress)[0],
    method: "query_extension",
    args
  }] as const)
};
export const daoPreProposeMultipleQueries = {
  proposalModule: <TData = Addr,>({
    client,
    options
  }: DaoPreProposeMultipleProposalModuleQuery<TData>): UseQueryOptions<Addr, Error, TData> => ({
    queryKey: daoPreProposeMultipleQueryKeys.proposalModule(client?.contractAddress),
    queryFn: () => client ? client.proposalModule() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  dao: <TData = Addr,>({
    client,
    options
  }: DaoPreProposeMultipleDaoQuery<TData>): UseQueryOptions<Addr, Error, TData> => ({
    queryKey: daoPreProposeMultipleQueryKeys.dao(client?.contractAddress),
    queryFn: () => client ? client.dao() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  config: <TData = Config,>({
    client,
    options
  }: DaoPreProposeMultipleConfigQuery<TData>): UseQueryOptions<Config, Error, TData> => ({
    queryKey: daoPreProposeMultipleQueryKeys.config(client?.contractAddress),
    queryFn: () => client ? client.config() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  depositInfo: <TData = DepositInfoResponse,>({
    client,
    args,
    options
  }: DaoPreProposeMultipleDepositInfoQuery<TData>): UseQueryOptions<DepositInfoResponse, Error, TData> => ({
    queryKey: daoPreProposeMultipleQueryKeys.depositInfo(client?.contractAddress, args),
    queryFn: () => client ? client.depositInfo({
      proposalId: args.proposalId
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  proposalSubmittedHooks: <TData = HooksResponse,>({
    client,
    options
  }: DaoPreProposeMultipleProposalSubmittedHooksQuery<TData>): UseQueryOptions<HooksResponse, Error, TData> => ({
    queryKey: daoPreProposeMultipleQueryKeys.proposalSubmittedHooks(client?.contractAddress),
    queryFn: () => client ? client.proposalSubmittedHooks() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  queryExtension: <TData = Binary,>({
    client,
    args,
    options
  }: DaoPreProposeMultipleQueryExtensionQuery<TData>): UseQueryOptions<Binary, Error, TData> => ({
    queryKey: daoPreProposeMultipleQueryKeys.queryExtension(client?.contractAddress, args),
    queryFn: () => client ? client.queryExtension({
      msg: args.msg
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  })
};
export interface DaoPreProposeMultipleReactQuery<TResponse, TData = TResponse> {
  client: DaoPreProposeMultipleQueryClient | undefined;
  options?: Omit<UseQueryOptions<TResponse, Error, TData>, "'queryKey' | 'queryFn' | 'initialData'"> & {
    initialData?: undefined;
  };
}
export interface DaoPreProposeMultipleQueryExtensionQuery<TData> extends DaoPreProposeMultipleReactQuery<Binary, TData> {
  args: {
    msg: Empty;
  };
}
export function useDaoPreProposeMultipleQueryExtensionQuery<TData = Binary>({
  client,
  args,
  options
}: DaoPreProposeMultipleQueryExtensionQuery<TData>) {
  return useQuery<Binary, Error, TData>(daoPreProposeMultipleQueryKeys.queryExtension(client?.contractAddress, args), () => client ? client.queryExtension({
    msg: args.msg
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface DaoPreProposeMultipleProposalSubmittedHooksQuery<TData> extends DaoPreProposeMultipleReactQuery<HooksResponse, TData> {}
export function useDaoPreProposeMultipleProposalSubmittedHooksQuery<TData = HooksResponse>({
  client,
  options
}: DaoPreProposeMultipleProposalSubmittedHooksQuery<TData>) {
  return useQuery<HooksResponse, Error, TData>(daoPreProposeMultipleQueryKeys.proposalSubmittedHooks(client?.contractAddress), () => client ? client.proposalSubmittedHooks() : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface DaoPreProposeMultipleDepositInfoQuery<TData> extends DaoPreProposeMultipleReactQuery<DepositInfoResponse, TData> {
  args: {
    proposalId: number;
  };
}
export function useDaoPreProposeMultipleDepositInfoQuery<TData = DepositInfoResponse>({
  client,
  args,
  options
}: DaoPreProposeMultipleDepositInfoQuery<TData>) {
  return useQuery<DepositInfoResponse, Error, TData>(daoPreProposeMultipleQueryKeys.depositInfo(client?.contractAddress, args), () => client ? client.depositInfo({
    proposalId: args.proposalId
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface DaoPreProposeMultipleConfigQuery<TData> extends DaoPreProposeMultipleReactQuery<Config, TData> {}
export function useDaoPreProposeMultipleConfigQuery<TData = Config>({
  client,
  options
}: DaoPreProposeMultipleConfigQuery<TData>) {
  return useQuery<Config, Error, TData>(daoPreProposeMultipleQueryKeys.config(client?.contractAddress), () => client ? client.config() : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface DaoPreProposeMultipleDaoQuery<TData> extends DaoPreProposeMultipleReactQuery<Addr, TData> {}
export function useDaoPreProposeMultipleDaoQuery<TData = Addr>({
  client,
  options
}: DaoPreProposeMultipleDaoQuery<TData>) {
  return useQuery<Addr, Error, TData>(daoPreProposeMultipleQueryKeys.dao(client?.contractAddress), () => client ? client.dao() : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface DaoPreProposeMultipleProposalModuleQuery<TData> extends DaoPreProposeMultipleReactQuery<Addr, TData> {}
export function useDaoPreProposeMultipleProposalModuleQuery<TData = Addr>({
  client,
  options
}: DaoPreProposeMultipleProposalModuleQuery<TData>) {
  return useQuery<Addr, Error, TData>(daoPreProposeMultipleQueryKeys.proposalModule(client?.contractAddress), () => client ? client.proposalModule() : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface DaoPreProposeMultipleProposalCompletedHookMutation {
  client: DaoPreProposeMultipleClient;
  msg: {
    newStatus: Status;
    proposalId: number;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useDaoPreProposeMultipleProposalCompletedHookMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, DaoPreProposeMultipleProposalCompletedHookMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, DaoPreProposeMultipleProposalCompletedHookMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.proposalCompletedHook(msg, fee, memo, funds), options);
}
export interface DaoPreProposeMultipleRemoveProposalSubmittedHookMutation {
  client: DaoPreProposeMultipleClient;
  msg: {
    address: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useDaoPreProposeMultipleRemoveProposalSubmittedHookMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, DaoPreProposeMultipleRemoveProposalSubmittedHookMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, DaoPreProposeMultipleRemoveProposalSubmittedHookMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.removeProposalSubmittedHook(msg, fee, memo, funds), options);
}
export interface DaoPreProposeMultipleAddProposalSubmittedHookMutation {
  client: DaoPreProposeMultipleClient;
  msg: {
    address: string;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useDaoPreProposeMultipleAddProposalSubmittedHookMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, DaoPreProposeMultipleAddProposalSubmittedHookMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, DaoPreProposeMultipleAddProposalSubmittedHookMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.addProposalSubmittedHook(msg, fee, memo, funds), options);
}
export interface DaoPreProposeMultipleExtensionMutation {
  client: DaoPreProposeMultipleClient;
  msg: {
    msg: Empty;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useDaoPreProposeMultipleExtensionMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, DaoPreProposeMultipleExtensionMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, DaoPreProposeMultipleExtensionMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.extension(msg, fee, memo, funds), options);
}
export interface DaoPreProposeMultipleWithdrawMutation {
  client: DaoPreProposeMultipleClient;
  msg: {
    denom?: UncheckedDenom;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useDaoPreProposeMultipleWithdrawMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, DaoPreProposeMultipleWithdrawMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, DaoPreProposeMultipleWithdrawMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.withdraw(msg, fee, memo, funds), options);
}
export interface DaoPreProposeMultipleUpdateConfigMutation {
  client: DaoPreProposeMultipleClient;
  msg: {
    depositInfo?: UncheckedDepositInfo;
    openProposalSubmission: boolean;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useDaoPreProposeMultipleUpdateConfigMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, DaoPreProposeMultipleUpdateConfigMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, DaoPreProposeMultipleUpdateConfigMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.updateConfig(msg, fee, memo, funds), options);
}
export interface DaoPreProposeMultipleProposeMutation {
  client: DaoPreProposeMultipleClient;
  msg: {
    msg: ProposeMessage;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useDaoPreProposeMultipleProposeMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, DaoPreProposeMultipleProposeMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, DaoPreProposeMultipleProposeMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.propose(msg, fee, memo, funds), options);
}