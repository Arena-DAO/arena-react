/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { Duration, PreProposeInfo, Admin, Uint128, Binary, Threshold, PercentageThreshold, Decimal, InstantiateMsg, ModuleInstantiateInfo, Coin, VetoConfig, ExecuteMsg, CosmosMsgForEmpty, BankMsg, StakingMsg, DistributionMsg, IbcMsg, Timestamp, Uint64, WasmMsg, GovMsg, VoteOption, Vote, SingleChoiceProposeMsg, Empty, IbcTimeout, IbcTimeoutBlock, SingleChoiceAutoVote, QueryMsg, MigrateMsg, Addr, Config, VoteResponse, VoteInfo, InfoResponse, ContractVersion, Expiration, Status, ProposalListResponse, ProposalResponse, SingleChoiceProposal, Votes, VoteListResponse, ProposalCreationPolicy, HooksResponse } from "./DaoProposalSingle.types";
import { DaoProposalSingleQueryClient } from "./DaoProposalSingle.client";
export interface DaoProposalSingleReactQuery<TResponse, TData = TResponse> {
  client: DaoProposalSingleQueryClient;
  options?: Omit<UseQueryOptions<TResponse, Error, TData>, "'queryKey' | 'queryFn' | 'initialData'"> & {
    initialData?: undefined;
  };
}
export interface DaoProposalSingleNextProposalIdQuery<TData> extends DaoProposalSingleReactQuery<Uint64, TData> {}
export function useDaoProposalSingleNextProposalIdQuery<TData = Uint64>({
  client,
  options
}: DaoProposalSingleNextProposalIdQuery<TData>) {
  return useQuery<Uint64, Error, TData>(["daoProposalSingleNextProposalId", client.contractAddress], () => client.nextProposalId(), options);
}
export interface DaoProposalSingleInfoQuery<TData> extends DaoProposalSingleReactQuery<InfoResponse, TData> {}
export function useDaoProposalSingleInfoQuery<TData = InfoResponse>({
  client,
  options
}: DaoProposalSingleInfoQuery<TData>) {
  return useQuery<InfoResponse, Error, TData>(["daoProposalSingleInfo", client.contractAddress], () => client.info(), options);
}
export interface DaoProposalSingleDaoQuery<TData> extends DaoProposalSingleReactQuery<Addr, TData> {}
export function useDaoProposalSingleDaoQuery<TData = Addr>({
  client,
  options
}: DaoProposalSingleDaoQuery<TData>) {
  return useQuery<Addr, Error, TData>(["daoProposalSingleDao", client.contractAddress], () => client.dao(), options);
}
export interface DaoProposalSingleVoteHooksQuery<TData> extends DaoProposalSingleReactQuery<HooksResponse, TData> {}
export function useDaoProposalSingleVoteHooksQuery<TData = HooksResponse>({
  client,
  options
}: DaoProposalSingleVoteHooksQuery<TData>) {
  return useQuery<HooksResponse, Error, TData>(["daoProposalSingleVoteHooks", client.contractAddress], () => client.voteHooks(), options);
}
export interface DaoProposalSingleProposalHooksQuery<TData> extends DaoProposalSingleReactQuery<HooksResponse, TData> {}
export function useDaoProposalSingleProposalHooksQuery<TData = HooksResponse>({
  client,
  options
}: DaoProposalSingleProposalHooksQuery<TData>) {
  return useQuery<HooksResponse, Error, TData>(["daoProposalSingleProposalHooks", client.contractAddress], () => client.proposalHooks(), options);
}
export interface DaoProposalSingleProposalCreationPolicyQuery<TData> extends DaoProposalSingleReactQuery<ProposalCreationPolicy, TData> {}
export function useDaoProposalSingleProposalCreationPolicyQuery<TData = ProposalCreationPolicy>({
  client,
  options
}: DaoProposalSingleProposalCreationPolicyQuery<TData>) {
  return useQuery<ProposalCreationPolicy, Error, TData>(["daoProposalSingleProposalCreationPolicy", client.contractAddress], () => client.proposalCreationPolicy(), options);
}
export interface DaoProposalSingleProposalCountQuery<TData> extends DaoProposalSingleReactQuery<Uint64, TData> {}
export function useDaoProposalSingleProposalCountQuery<TData = Uint64>({
  client,
  options
}: DaoProposalSingleProposalCountQuery<TData>) {
  return useQuery<Uint64, Error, TData>(["daoProposalSingleProposalCount", client.contractAddress], () => client.proposalCount(), options);
}
export interface DaoProposalSingleListVotesQuery<TData> extends DaoProposalSingleReactQuery<VoteListResponse, TData> {
  args: {
    limit?: number;
    proposalId: number;
    startAfter?: string;
  };
}
export function useDaoProposalSingleListVotesQuery<TData = VoteListResponse>({
  client,
  args,
  options
}: DaoProposalSingleListVotesQuery<TData>) {
  return useQuery<VoteListResponse, Error, TData>(["daoProposalSingleListVotes", client.contractAddress, JSON.stringify(args)], () => client.listVotes({
    limit: args.limit,
    proposalId: args.proposalId,
    startAfter: args.startAfter
  }), options);
}
export interface DaoProposalSingleGetVoteQuery<TData> extends DaoProposalSingleReactQuery<VoteResponse, TData> {
  args: {
    proposalId: number;
    voter: string;
  };
}
export function useDaoProposalSingleGetVoteQuery<TData = VoteResponse>({
  client,
  args,
  options
}: DaoProposalSingleGetVoteQuery<TData>) {
  return useQuery<VoteResponse, Error, TData>(["daoProposalSingleGetVote", client.contractAddress, JSON.stringify(args)], () => client.getVote({
    proposalId: args.proposalId,
    voter: args.voter
  }), options);
}
export interface DaoProposalSingleReverseProposalsQuery<TData> extends DaoProposalSingleReactQuery<ProposalListResponse, TData> {
  args: {
    limit?: number;
    startBefore?: number;
  };
}
export function useDaoProposalSingleReverseProposalsQuery<TData = ProposalListResponse>({
  client,
  args,
  options
}: DaoProposalSingleReverseProposalsQuery<TData>) {
  return useQuery<ProposalListResponse, Error, TData>(["daoProposalSingleReverseProposals", client.contractAddress, JSON.stringify(args)], () => client.reverseProposals({
    limit: args.limit,
    startBefore: args.startBefore
  }), options);
}
export interface DaoProposalSingleListProposalsQuery<TData> extends DaoProposalSingleReactQuery<ProposalListResponse, TData> {
  args: {
    limit?: number;
    startAfter?: number;
  };
}
export function useDaoProposalSingleListProposalsQuery<TData = ProposalListResponse>({
  client,
  args,
  options
}: DaoProposalSingleListProposalsQuery<TData>) {
  return useQuery<ProposalListResponse, Error, TData>(["daoProposalSingleListProposals", client.contractAddress, JSON.stringify(args)], () => client.listProposals({
    limit: args.limit,
    startAfter: args.startAfter
  }), options);
}
export interface DaoProposalSingleProposalQuery<TData> extends DaoProposalSingleReactQuery<ProposalResponse, TData> {
  args: {
    proposalId: number;
  };
}
export function useDaoProposalSingleProposalQuery<TData = ProposalResponse>({
  client,
  args,
  options
}: DaoProposalSingleProposalQuery<TData>) {
  return useQuery<ProposalResponse, Error, TData>(["daoProposalSingleProposal", client.contractAddress, JSON.stringify(args)], () => client.proposal({
    proposalId: args.proposalId
  }), options);
}
export interface DaoProposalSingleConfigQuery<TData> extends DaoProposalSingleReactQuery<Config, TData> {}
export function useDaoProposalSingleConfigQuery<TData = Config>({
  client,
  options
}: DaoProposalSingleConfigQuery<TData>) {
  return useQuery<Config, Error, TData>(["daoProposalSingleConfig", client.contractAddress], () => client.config(), options);
}