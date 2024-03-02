/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { Executor, Addr, Duration, Uint128, UncheckedDenom, Threshold, Decimal, InstantiateMsg, UncheckedDepositInfo, ExecuteMsg, Expiration, Timestamp, Uint64, CosmosMsgForEmpty, BankMsg, WasmMsg, Binary, Vote, Coin, Empty, MemberChangedHookMsg, MemberDiff, QueryMsg, Cw4Contract, Denom, Config, DepositInfo, Status, ThresholdResponse, ProposalListResponseForEmpty, ProposalResponseForEmpty, VoterListResponse, VoterDetail, VoteListResponse, VoteInfo, VoteResponse, VoterResponse } from "./Cw20Base.types";
import { Cw20BaseQueryClient } from "./Cw20Base.client";
export interface Cw20BaseReactQuery<TResponse, TData = TResponse> {
  client: Cw20BaseQueryClient;
  options?: Omit<UseQueryOptions<TResponse, Error, TData>, "'queryKey' | 'queryFn' | 'initialData'"> & {
    initialData?: undefined;
  };
}
export interface Cw20BaseConfigQuery<TData> extends Cw20BaseReactQuery<Config, TData> {}
export function useCw20BaseConfigQuery<TData = Config>({
  client,
  options
}: Cw20BaseConfigQuery<TData>) {
  return useQuery<Config, Error, TData>(["cw20BaseConfig", client.contractAddress], () => client.config(), options);
}
export interface Cw20BaseListVotersQuery<TData> extends Cw20BaseReactQuery<VoterListResponse, TData> {
  args: {
    limit?: number;
    startAfter?: string;
  };
}
export function useCw20BaseListVotersQuery<TData = VoterListResponse>({
  client,
  args,
  options
}: Cw20BaseListVotersQuery<TData>) {
  return useQuery<VoterListResponse, Error, TData>(["cw20BaseListVoters", client.contractAddress, JSON.stringify(args)], () => client.listVoters({
    limit: args.limit,
    startAfter: args.startAfter
  }), options);
}
export interface Cw20BaseVoterQuery<TData> extends Cw20BaseReactQuery<VoterResponse, TData> {
  args: {
    address: string;
  };
}
export function useCw20BaseVoterQuery<TData = VoterResponse>({
  client,
  args,
  options
}: Cw20BaseVoterQuery<TData>) {
  return useQuery<VoterResponse, Error, TData>(["cw20BaseVoter", client.contractAddress, JSON.stringify(args)], () => client.voter({
    address: args.address
  }), options);
}
export interface Cw20BaseListVotesQuery<TData> extends Cw20BaseReactQuery<VoteListResponse, TData> {
  args: {
    limit?: number;
    proposalId: number;
    startAfter?: string;
  };
}
export function useCw20BaseListVotesQuery<TData = VoteListResponse>({
  client,
  args,
  options
}: Cw20BaseListVotesQuery<TData>) {
  return useQuery<VoteListResponse, Error, TData>(["cw20BaseListVotes", client.contractAddress, JSON.stringify(args)], () => client.listVotes({
    limit: args.limit,
    proposalId: args.proposalId,
    startAfter: args.startAfter
  }), options);
}
export interface Cw20BaseVoteQuery<TData> extends Cw20BaseReactQuery<VoteResponse, TData> {
  args: {
    proposalId: number;
    voter: string;
  };
}
export function useCw20BaseVoteQuery<TData = VoteResponse>({
  client,
  args,
  options
}: Cw20BaseVoteQuery<TData>) {
  return useQuery<VoteResponse, Error, TData>(["cw20BaseVote", client.contractAddress, JSON.stringify(args)], () => client.vote({
    proposalId: args.proposalId,
    voter: args.voter
  }), options);
}
export interface Cw20BaseReverseProposalsQuery<TData> extends Cw20BaseReactQuery<ProposalListResponseForEmpty, TData> {
  args: {
    limit?: number;
    startBefore?: number;
  };
}
export function useCw20BaseReverseProposalsQuery<TData = ProposalListResponseForEmpty>({
  client,
  args,
  options
}: Cw20BaseReverseProposalsQuery<TData>) {
  return useQuery<ProposalListResponseForEmpty, Error, TData>(["cw20BaseReverseProposals", client.contractAddress, JSON.stringify(args)], () => client.reverseProposals({
    limit: args.limit,
    startBefore: args.startBefore
  }), options);
}
export interface Cw20BaseListProposalsQuery<TData> extends Cw20BaseReactQuery<ProposalListResponseForEmpty, TData> {
  args: {
    limit?: number;
    startAfter?: number;
  };
}
export function useCw20BaseListProposalsQuery<TData = ProposalListResponseForEmpty>({
  client,
  args,
  options
}: Cw20BaseListProposalsQuery<TData>) {
  return useQuery<ProposalListResponseForEmpty, Error, TData>(["cw20BaseListProposals", client.contractAddress, JSON.stringify(args)], () => client.listProposals({
    limit: args.limit,
    startAfter: args.startAfter
  }), options);
}
export interface Cw20BaseProposalQuery<TData> extends Cw20BaseReactQuery<ProposalResponseForEmpty, TData> {
  args: {
    proposalId: number;
  };
}
export function useCw20BaseProposalQuery<TData = ProposalResponseForEmpty>({
  client,
  args,
  options
}: Cw20BaseProposalQuery<TData>) {
  return useQuery<ProposalResponseForEmpty, Error, TData>(["cw20BaseProposal", client.contractAddress, JSON.stringify(args)], () => client.proposal({
    proposalId: args.proposalId
  }), options);
}
export interface Cw20BaseThresholdQuery<TData> extends Cw20BaseReactQuery<ThresholdResponse, TData> {}
export function useCw20BaseThresholdQuery<TData = ThresholdResponse>({
  client,
  options
}: Cw20BaseThresholdQuery<TData>) {
  return useQuery<ThresholdResponse, Error, TData>(["cw20BaseThreshold", client.contractAddress], () => client.threshold(), options);
}