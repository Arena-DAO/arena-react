/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { UseQueryOptions, useQuery, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { StdFee } from "@cosmjs/amino";
import { InstantiateMsg, ExecuteMsg, Uint128, Binary, Decimal, Expiration, Timestamp, Uint64, CompetitionType, EliminationType, Action, CompetitionInfoMsg, FeeInformationForString, Coin, QueryMsg, EnrollmentFilter, MigrateMsg, Addr, SudoMsg, EnrollmentEntryResponse, CompetitionInfoResponse, ArrayOfAddr, ArrayOfEnrollmentEntryResponse, Boolean, OwnershipForString } from "./ArenaCompetitionEnrollment.types";
import { ArenaCompetitionEnrollmentQueryClient, ArenaCompetitionEnrollmentClient } from "./ArenaCompetitionEnrollment.client";
export const arenaCompetitionEnrollmentQueryKeys = {
  contract: ([{
    contract: "arenaCompetitionEnrollment"
  }] as const),
  address: (contractAddress: string | undefined) => ([{ ...arenaCompetitionEnrollmentQueryKeys.contract[0],
    address: contractAddress
  }] as const),
  enrollments: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...arenaCompetitionEnrollmentQueryKeys.address(contractAddress)[0],
    method: "enrollments",
    args
  }] as const),
  enrollment: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...arenaCompetitionEnrollmentQueryKeys.address(contractAddress)[0],
    method: "enrollment",
    args
  }] as const),
  enrollmentCount: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...arenaCompetitionEnrollmentQueryKeys.address(contractAddress)[0],
    method: "enrollment_count",
    args
  }] as const),
  enrollmentMembers: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...arenaCompetitionEnrollmentQueryKeys.address(contractAddress)[0],
    method: "enrollment_members",
    args
  }] as const),
  isMember: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...arenaCompetitionEnrollmentQueryKeys.address(contractAddress)[0],
    method: "is_member",
    args
  }] as const),
  ownership: (contractAddress: string | undefined, args?: Record<string, unknown>) => ([{ ...arenaCompetitionEnrollmentQueryKeys.address(contractAddress)[0],
    method: "ownership",
    args
  }] as const)
};
export const arenaCompetitionEnrollmentQueries = {
  enrollments: <TData = ArrayOfEnrollmentEntryResponse,>({
    client,
    args,
    options
  }: ArenaCompetitionEnrollmentEnrollmentsQuery<TData>): UseQueryOptions<ArrayOfEnrollmentEntryResponse, Error, TData> => ({
    queryKey: arenaCompetitionEnrollmentQueryKeys.enrollments(client?.contractAddress, args),
    queryFn: () => client ? client.enrollments({
      filter: args.filter,
      limit: args.limit,
      startAfter: args.startAfter
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  enrollment: <TData = EnrollmentEntryResponse,>({
    client,
    args,
    options
  }: ArenaCompetitionEnrollmentEnrollmentQuery<TData>): UseQueryOptions<EnrollmentEntryResponse, Error, TData> => ({
    queryKey: arenaCompetitionEnrollmentQueryKeys.enrollment(client?.contractAddress, args),
    queryFn: () => client ? client.enrollment({
      enrollmentId: args.enrollmentId
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  enrollmentCount: <TData = Uint128,>({
    client,
    options
  }: ArenaCompetitionEnrollmentEnrollmentCountQuery<TData>): UseQueryOptions<Uint128, Error, TData> => ({
    queryKey: arenaCompetitionEnrollmentQueryKeys.enrollmentCount(client?.contractAddress),
    queryFn: () => client ? client.enrollmentCount() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  enrollmentMembers: <TData = ArrayOfAddr,>({
    client,
    args,
    options
  }: ArenaCompetitionEnrollmentEnrollmentMembersQuery<TData>): UseQueryOptions<ArrayOfAddr, Error, TData> => ({
    queryKey: arenaCompetitionEnrollmentQueryKeys.enrollmentMembers(client?.contractAddress, args),
    queryFn: () => client ? client.enrollmentMembers({
      enrollmentId: args.enrollmentId,
      limit: args.limit,
      startAfter: args.startAfter
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  isMember: <TData = Boolean,>({
    client,
    args,
    options
  }: ArenaCompetitionEnrollmentIsMemberQuery<TData>): UseQueryOptions<Boolean, Error, TData> => ({
    queryKey: arenaCompetitionEnrollmentQueryKeys.isMember(client?.contractAddress, args),
    queryFn: () => client ? client.isMember({
      addr: args.addr,
      enrollmentId: args.enrollmentId
    }) : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  }),
  ownership: <TData = OwnershipForString,>({
    client,
    options
  }: ArenaCompetitionEnrollmentOwnershipQuery<TData>): UseQueryOptions<OwnershipForString, Error, TData> => ({
    queryKey: arenaCompetitionEnrollmentQueryKeys.ownership(client?.contractAddress),
    queryFn: () => client ? client.ownership() : Promise.reject(new Error("Invalid client")),
    ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  })
};
export interface ArenaCompetitionEnrollmentReactQuery<TResponse, TData = TResponse> {
  client: ArenaCompetitionEnrollmentQueryClient | undefined;
  options?: Omit<UseQueryOptions<TResponse, Error, TData>, "'queryKey' | 'queryFn' | 'initialData'"> & {
    initialData?: undefined;
  };
}
export interface ArenaCompetitionEnrollmentOwnershipQuery<TData> extends ArenaCompetitionEnrollmentReactQuery<OwnershipForString, TData> {}
export function useArenaCompetitionEnrollmentOwnershipQuery<TData = OwnershipForString>({
  client,
  options
}: ArenaCompetitionEnrollmentOwnershipQuery<TData>) {
  return useQuery<OwnershipForString, Error, TData>(arenaCompetitionEnrollmentQueryKeys.ownership(client?.contractAddress), () => client ? client.ownership() : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaCompetitionEnrollmentIsMemberQuery<TData> extends ArenaCompetitionEnrollmentReactQuery<Boolean, TData> {
  args: {
    addr: string;
    enrollmentId: Uint128;
  };
}
export function useArenaCompetitionEnrollmentIsMemberQuery<TData = Boolean>({
  client,
  args,
  options
}: ArenaCompetitionEnrollmentIsMemberQuery<TData>) {
  return useQuery<Boolean, Error, TData>(arenaCompetitionEnrollmentQueryKeys.isMember(client?.contractAddress, args), () => client ? client.isMember({
    addr: args.addr,
    enrollmentId: args.enrollmentId
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaCompetitionEnrollmentEnrollmentMembersQuery<TData> extends ArenaCompetitionEnrollmentReactQuery<ArrayOfAddr, TData> {
  args: {
    enrollmentId: Uint128;
    limit?: number;
    startAfter?: string;
  };
}
export function useArenaCompetitionEnrollmentEnrollmentMembersQuery<TData = ArrayOfAddr>({
  client,
  args,
  options
}: ArenaCompetitionEnrollmentEnrollmentMembersQuery<TData>) {
  return useQuery<ArrayOfAddr, Error, TData>(arenaCompetitionEnrollmentQueryKeys.enrollmentMembers(client?.contractAddress, args), () => client ? client.enrollmentMembers({
    enrollmentId: args.enrollmentId,
    limit: args.limit,
    startAfter: args.startAfter
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaCompetitionEnrollmentEnrollmentCountQuery<TData> extends ArenaCompetitionEnrollmentReactQuery<Uint128, TData> {}
export function useArenaCompetitionEnrollmentEnrollmentCountQuery<TData = Uint128>({
  client,
  options
}: ArenaCompetitionEnrollmentEnrollmentCountQuery<TData>) {
  return useQuery<Uint128, Error, TData>(arenaCompetitionEnrollmentQueryKeys.enrollmentCount(client?.contractAddress), () => client ? client.enrollmentCount() : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaCompetitionEnrollmentEnrollmentQuery<TData> extends ArenaCompetitionEnrollmentReactQuery<EnrollmentEntryResponse, TData> {
  args: {
    enrollmentId: Uint128;
  };
}
export function useArenaCompetitionEnrollmentEnrollmentQuery<TData = EnrollmentEntryResponse>({
  client,
  args,
  options
}: ArenaCompetitionEnrollmentEnrollmentQuery<TData>) {
  return useQuery<EnrollmentEntryResponse, Error, TData>(arenaCompetitionEnrollmentQueryKeys.enrollment(client?.contractAddress, args), () => client ? client.enrollment({
    enrollmentId: args.enrollmentId
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaCompetitionEnrollmentEnrollmentsQuery<TData> extends ArenaCompetitionEnrollmentReactQuery<ArrayOfEnrollmentEntryResponse, TData> {
  args: {
    filter?: EnrollmentFilter;
    limit?: number;
    startAfter?: Uint128;
  };
}
export function useArenaCompetitionEnrollmentEnrollmentsQuery<TData = ArrayOfEnrollmentEntryResponse>({
  client,
  args,
  options
}: ArenaCompetitionEnrollmentEnrollmentsQuery<TData>) {
  return useQuery<ArrayOfEnrollmentEntryResponse, Error, TData>(arenaCompetitionEnrollmentQueryKeys.enrollments(client?.contractAddress, args), () => client ? client.enrollments({
    filter: args.filter,
    limit: args.limit,
    startAfter: args.startAfter
  }) : Promise.reject(new Error("Invalid client")), { ...options,
    enabled: !!client && (options?.enabled != undefined ? options.enabled : true)
  });
}
export interface ArenaCompetitionEnrollmentUpdateOwnershipMutation {
  client: ArenaCompetitionEnrollmentClient;
  msg: Action;
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaCompetitionEnrollmentUpdateOwnershipMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaCompetitionEnrollmentUpdateOwnershipMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaCompetitionEnrollmentUpdateOwnershipMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.updateOwnership(msg, fee, memo, funds), options);
}
export interface ArenaCompetitionEnrollmentWithdrawMutation {
  client: ArenaCompetitionEnrollmentClient;
  msg: {
    id: Uint128;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaCompetitionEnrollmentWithdrawMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaCompetitionEnrollmentWithdrawMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaCompetitionEnrollmentWithdrawMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.withdraw(msg, fee, memo, funds), options);
}
export interface ArenaCompetitionEnrollmentEnrollMutation {
  client: ArenaCompetitionEnrollmentClient;
  msg: {
    id: Uint128;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaCompetitionEnrollmentEnrollMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaCompetitionEnrollmentEnrollMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaCompetitionEnrollmentEnrollMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.enroll(msg, fee, memo, funds), options);
}
export interface ArenaCompetitionEnrollmentTriggerExpirationMutation {
  client: ArenaCompetitionEnrollmentClient;
  msg: {
    escrowId: number;
    id: Uint128;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaCompetitionEnrollmentTriggerExpirationMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaCompetitionEnrollmentTriggerExpirationMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaCompetitionEnrollmentTriggerExpirationMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.triggerExpiration(msg, fee, memo, funds), options);
}
export interface ArenaCompetitionEnrollmentCreateEnrollmentMutation {
  client: ArenaCompetitionEnrollmentClient;
  msg: {
    categoryId?: Uint128;
    competitionInfo: CompetitionInfoMsg;
    competitionType: CompetitionType;
    entryFee?: Coin;
    expiration: Expiration;
    isCreatorMember?: boolean;
    maxMembers: Uint64;
    minMembers?: Uint64;
  };
  args?: {
    fee?: number | StdFee | "auto";
    memo?: string;
    funds?: Coin[];
  };
}
export function useArenaCompetitionEnrollmentCreateEnrollmentMutation(options?: Omit<UseMutationOptions<ExecuteResult, Error, ArenaCompetitionEnrollmentCreateEnrollmentMutation>, "mutationFn">) {
  return useMutation<ExecuteResult, Error, ArenaCompetitionEnrollmentCreateEnrollmentMutation>(({
    client,
    msg,
    args: {
      fee,
      memo,
      funds
    } = {}
  }) => client.createEnrollment(msg, fee, memo, funds), options);
}