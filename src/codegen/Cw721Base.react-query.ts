/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { InstantiateMsg, ExecuteMsg, Binary, Expiration, Timestamp, Uint64, Uint128, Action, Empty, Coin, QueryMsg, AllNftInfoResponseForEmpty, OwnerOfResponse, Approval, NftInfoResponseForEmpty, OperatorsResponse, TokensResponse, ApprovalResponse, ApprovalsResponse, ContractInfoResponse, Null, NullableString, MinterResponse, NumTokensResponse, OperatorResponse, OwnershipForString } from "./Cw721Base.types";
import { Cw721BaseQueryClient } from "./Cw721Base.client";
export interface Cw721BaseReactQuery<TResponse, TData = TResponse> {
  client: Cw721BaseQueryClient;
  options?: Omit<UseQueryOptions<TResponse, Error, TData>, "'queryKey' | 'queryFn' | 'initialData'"> & {
    initialData?: undefined;
  };
}
export interface Cw721BaseOwnershipQuery<TData> extends Cw721BaseReactQuery<OwnershipForString, TData> {}
export function useCw721BaseOwnershipQuery<TData = OwnershipForString>({
  client,
  options
}: Cw721BaseOwnershipQuery<TData>) {
  return useQuery<OwnershipForString, Error, TData>(["cw721BaseOwnership", client.contractAddress], () => client.ownership(), options);
}
export interface Cw721BaseGetWithdrawAddressQuery<TData> extends Cw721BaseReactQuery<NullableString, TData> {}
export function useCw721BaseGetWithdrawAddressQuery<TData = NullableString>({
  client,
  options
}: Cw721BaseGetWithdrawAddressQuery<TData>) {
  return useQuery<NullableString, Error, TData>(["cw721BaseGetWithdrawAddress", client.contractAddress], () => client.getWithdrawAddress(), options);
}
export interface Cw721BaseExtensionQuery<TData> extends Cw721BaseReactQuery<Null, TData> {
  args: {
    msg: Empty;
  };
}
export function useCw721BaseExtensionQuery<TData = Null>({
  client,
  args,
  options
}: Cw721BaseExtensionQuery<TData>) {
  return useQuery<Null, Error, TData>(["cw721BaseExtension", client.contractAddress, JSON.stringify(args)], () => client.extension({
    msg: args.msg
  }), options);
}
export interface Cw721BaseMinterQuery<TData> extends Cw721BaseReactQuery<MinterResponse, TData> {}
export function useCw721BaseMinterQuery<TData = MinterResponse>({
  client,
  options
}: Cw721BaseMinterQuery<TData>) {
  return useQuery<MinterResponse, Error, TData>(["cw721BaseMinter", client.contractAddress], () => client.minter(), options);
}
export interface Cw721BaseAllTokensQuery<TData> extends Cw721BaseReactQuery<TokensResponse, TData> {
  args: {
    limit?: number;
    startAfter?: string;
  };
}
export function useCw721BaseAllTokensQuery<TData = TokensResponse>({
  client,
  args,
  options
}: Cw721BaseAllTokensQuery<TData>) {
  return useQuery<TokensResponse, Error, TData>(["cw721BaseAllTokens", client.contractAddress, JSON.stringify(args)], () => client.allTokens({
    limit: args.limit,
    startAfter: args.startAfter
  }), options);
}
export interface Cw721BaseTokensQuery<TData> extends Cw721BaseReactQuery<TokensResponse, TData> {
  args: {
    limit?: number;
    owner: string;
    startAfter?: string;
  };
}
export function useCw721BaseTokensQuery<TData = TokensResponse>({
  client,
  args,
  options
}: Cw721BaseTokensQuery<TData>) {
  return useQuery<TokensResponse, Error, TData>(["cw721BaseTokens", client.contractAddress, JSON.stringify(args)], () => client.tokens({
    limit: args.limit,
    owner: args.owner,
    startAfter: args.startAfter
  }), options);
}
export interface Cw721BaseAllNftInfoQuery<TData> extends Cw721BaseReactQuery<AllNftInfoResponseForEmpty, TData> {
  args: {
    includeExpired?: boolean;
    tokenId: string;
  };
}
export function useCw721BaseAllNftInfoQuery<TData = AllNftInfoResponseForEmpty>({
  client,
  args,
  options
}: Cw721BaseAllNftInfoQuery<TData>) {
  return useQuery<AllNftInfoResponseForEmpty, Error, TData>(["cw721BaseAllNftInfo", client.contractAddress, JSON.stringify(args)], () => client.allNftInfo({
    includeExpired: args.includeExpired,
    tokenId: args.tokenId
  }), options);
}
export interface Cw721BaseNftInfoQuery<TData> extends Cw721BaseReactQuery<NftInfoResponseForEmpty, TData> {
  args: {
    tokenId: string;
  };
}
export function useCw721BaseNftInfoQuery<TData = NftInfoResponseForEmpty>({
  client,
  args,
  options
}: Cw721BaseNftInfoQuery<TData>) {
  return useQuery<NftInfoResponseForEmpty, Error, TData>(["cw721BaseNftInfo", client.contractAddress, JSON.stringify(args)], () => client.nftInfo({
    tokenId: args.tokenId
  }), options);
}
export interface Cw721BaseContractInfoQuery<TData> extends Cw721BaseReactQuery<ContractInfoResponse, TData> {}
export function useCw721BaseContractInfoQuery<TData = ContractInfoResponse>({
  client,
  options
}: Cw721BaseContractInfoQuery<TData>) {
  return useQuery<ContractInfoResponse, Error, TData>(["cw721BaseContractInfo", client.contractAddress], () => client.contractInfo(), options);
}
export interface Cw721BaseNumTokensQuery<TData> extends Cw721BaseReactQuery<NumTokensResponse, TData> {}
export function useCw721BaseNumTokensQuery<TData = NumTokensResponse>({
  client,
  options
}: Cw721BaseNumTokensQuery<TData>) {
  return useQuery<NumTokensResponse, Error, TData>(["cw721BaseNumTokens", client.contractAddress], () => client.numTokens(), options);
}
export interface Cw721BaseAllOperatorsQuery<TData> extends Cw721BaseReactQuery<OperatorsResponse, TData> {
  args: {
    includeExpired?: boolean;
    limit?: number;
    owner: string;
    startAfter?: string;
  };
}
export function useCw721BaseAllOperatorsQuery<TData = OperatorsResponse>({
  client,
  args,
  options
}: Cw721BaseAllOperatorsQuery<TData>) {
  return useQuery<OperatorsResponse, Error, TData>(["cw721BaseAllOperators", client.contractAddress, JSON.stringify(args)], () => client.allOperators({
    includeExpired: args.includeExpired,
    limit: args.limit,
    owner: args.owner,
    startAfter: args.startAfter
  }), options);
}
export interface Cw721BaseOperatorQuery<TData> extends Cw721BaseReactQuery<OperatorResponse, TData> {
  args: {
    includeExpired?: boolean;
    operator: string;
    owner: string;
  };
}
export function useCw721BaseOperatorQuery<TData = OperatorResponse>({
  client,
  args,
  options
}: Cw721BaseOperatorQuery<TData>) {
  return useQuery<OperatorResponse, Error, TData>(["cw721BaseOperator", client.contractAddress, JSON.stringify(args)], () => client.operator({
    includeExpired: args.includeExpired,
    operator: args.operator,
    owner: args.owner
  }), options);
}
export interface Cw721BaseApprovalsQuery<TData> extends Cw721BaseReactQuery<ApprovalsResponse, TData> {
  args: {
    includeExpired?: boolean;
    tokenId: string;
  };
}
export function useCw721BaseApprovalsQuery<TData = ApprovalsResponse>({
  client,
  args,
  options
}: Cw721BaseApprovalsQuery<TData>) {
  return useQuery<ApprovalsResponse, Error, TData>(["cw721BaseApprovals", client.contractAddress, JSON.stringify(args)], () => client.approvals({
    includeExpired: args.includeExpired,
    tokenId: args.tokenId
  }), options);
}
export interface Cw721BaseApprovalQuery<TData> extends Cw721BaseReactQuery<ApprovalResponse, TData> {
  args: {
    includeExpired?: boolean;
    spender: string;
    tokenId: string;
  };
}
export function useCw721BaseApprovalQuery<TData = ApprovalResponse>({
  client,
  args,
  options
}: Cw721BaseApprovalQuery<TData>) {
  return useQuery<ApprovalResponse, Error, TData>(["cw721BaseApproval", client.contractAddress, JSON.stringify(args)], () => client.approval({
    includeExpired: args.includeExpired,
    spender: args.spender,
    tokenId: args.tokenId
  }), options);
}
export interface Cw721BaseOwnerOfQuery<TData> extends Cw721BaseReactQuery<OwnerOfResponse, TData> {
  args: {
    includeExpired?: boolean;
    tokenId: string;
  };
}
export function useCw721BaseOwnerOfQuery<TData = OwnerOfResponse>({
  client,
  args,
  options
}: Cw721BaseOwnerOfQuery<TData>) {
  return useQuery<OwnerOfResponse, Error, TData>(["cw721BaseOwnerOf", client.contractAddress, JSON.stringify(args)], () => client.ownerOf({
    includeExpired: args.includeExpired,
    tokenId: args.tokenId
  }), options);
}