/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { Duration, PreProposeInfo, Admin, Uint128, Binary, VotingStrategy, PercentageThreshold, Decimal, InstantiateMsg, ModuleInstantiateInfo, Coin, VetoConfig, ExecuteMsg, CosmosMsgForEmpty, BankMsg, StakingMsg, DistributionMsg, IbcMsg, Timestamp, Uint64, WasmMsg, GovMsg, VoteOption, MultipleChoiceProposeMsg, MultipleChoiceOptions, MultipleChoiceOption, Empty, IbcTimeout, IbcTimeoutBlock, MultipleChoiceAutoVote, MultipleChoiceVote, QueryMsg, MigrateMsg, Addr, Config, VoteResponse, VoteInfo, InfoResponse, ContractVersion, MultipleChoiceOptionType, Expiration, Status, ProposalListResponse, ProposalResponse, MultipleChoiceProposal, CheckedMultipleChoiceOption, MultipleChoiceVotes, VoteListResponse, ProposalCreationPolicy, HooksResponse } from "./DaoProposalMultiple.types";
import { DaoProposalMultipleQueryClient } from "./DaoProposalMultiple.client";
export interface DaoProposalMultipleReactQuery<TResponse, TData = TResponse> {
  client: DaoProposalMultipleQueryClient;
  options?: Omit<UseQueryOptions<TResponse, Error, TData>, "'queryKey' | 'queryFn' | 'initialData'"> & {
    initialData?: undefined;
  };
}
export interface DaoProposalMultipleNextProposalIdQuery<TData> extends DaoProposalMultipleReactQuery<Uint64, TData> {}
export function useDaoProposalMultipleNextProposalIdQuery<TData = Uint64>({
  client,
  options
}: DaoProposalMultipleNextProposalIdQuery<TData>) {
  return useQuery<Uint64, Error, TData>(["daoProposalMultipleNextProposalId", client.contractAddress], () => client.nextProposalId(), options);
}
export interface DaoProposalMultipleInfoQuery<TData> extends DaoProposalMultipleReactQuery<InfoResponse, TData> {}
export function useDaoProposalMultipleInfoQuery<TData = InfoResponse>({
  client,
  options
}: DaoProposalMultipleInfoQuery<TData>) {
  return useQuery<InfoResponse, Error, TData>(["daoProposalMultipleInfo", client.contractAddress], () => client.info(), options);
}
export interface DaoProposalMultipleDaoQuery<TData> extends DaoProposalMultipleReactQuery<Addr, TData> {}
export function useDaoProposalMultipleDaoQuery<TData = Addr>({
  client,
  options
}: DaoProposalMultipleDaoQuery<TData>) {
  return useQuery<Addr, Error, TData>(["daoProposalMultipleDao", client.contractAddress], () => client.dao(), options);
}
export interface DaoProposalMultipleVoteHooksQuery<TData> extends DaoProposalMultipleReactQuery<HooksResponse, TData> {}
export function useDaoProposalMultipleVoteHooksQuery<TData = HooksResponse>({
  client,
  options
}: DaoProposalMultipleVoteHooksQuery<TData>) {
  return useQuery<HooksResponse, Error, TData>(["daoProposalMultipleVoteHooks", client.contractAddress], () => client.voteHooks(), options);
}
export interface DaoProposalMultipleProposalHooksQuery<TData> extends DaoProposalMultipleReactQuery<HooksResponse, TData> {}
export function useDaoProposalMultipleProposalHooksQuery<TData = HooksResponse>({
  client,
  options
}: DaoProposalMultipleProposalHooksQuery<TData>) {
  return useQuery<HooksResponse, Error, TData>(["daoProposalMultipleProposalHooks", client.contractAddress], () => client.proposalHooks(), options);
}
export interface DaoProposalMultipleProposalCreationPolicyQuery<TData> extends DaoProposalMultipleReactQuery<ProposalCreationPolicy, TData> {}
export function useDaoProposalMultipleProposalCreationPolicyQuery<TData = ProposalCreationPolicy>({
  client,
  options
}: DaoProposalMultipleProposalCreationPolicyQuery<TData>) {
  return useQuery<ProposalCreationPolicy, Error, TData>(["daoProposalMultipleProposalCreationPolicy", client.contractAddress], () => client.proposalCreationPolicy(), options);
}
export interface DaoProposalMultipleProposalCountQuery<TData> extends DaoProposalMultipleReactQuery<Uint64, TData> {}
export function useDaoProposalMultipleProposalCountQuery<TData = Uint64>({
  client,
  options
}: DaoProposalMultipleProposalCountQuery<TData>) {
  return useQuery<Uint64, Error, TData>(["daoProposalMultipleProposalCount", client.contractAddress], () => client.proposalCount(), options);
}
export interface DaoProposalMultipleListVotesQuery<TData> extends DaoProposalMultipleReactQuery<VoteListResponse, TData> {
  args: {
    limit?: number;
    proposalId: number;
    startAfter?: string;
  };
}
export function useDaoProposalMultipleListVotesQuery<TData = VoteListResponse>({
  client,
  args,
  options
}: DaoProposalMultipleListVotesQuery<TData>) {
  return useQuery<VoteListResponse, Error, TData>(["daoProposalMultipleListVotes", client.contractAddress, JSON.stringify(args)], () => client.listVotes({
    limit: args.limit,
    proposalId: args.proposalId,
    startAfter: args.startAfter
  }), options);
}
export interface DaoProposalMultipleGetVoteQuery<TData> extends DaoProposalMultipleReactQuery<VoteResponse, TData> {
  args: {
    proposalId: number;
    voter: string;
  };
}
export function useDaoProposalMultipleGetVoteQuery<TData = VoteResponse>({
  client,
  args,
  options
}: DaoProposalMultipleGetVoteQuery<TData>) {
  return useQuery<VoteResponse, Error, TData>(["daoProposalMultipleGetVote", client.contractAddress, JSON.stringify(args)], () => client.getVote({
    proposalId: args.proposalId,
    voter: args.voter
  }), options);
}
export interface DaoProposalMultipleReverseProposalsQuery<TData> extends DaoProposalMultipleReactQuery<ProposalListResponse, TData> {
  args: {
    limit?: number;
    startBefore?: number;
  };
}
export function useDaoProposalMultipleReverseProposalsQuery<TData = ProposalListResponse>({
  client,
  args,
  options
}: DaoProposalMultipleReverseProposalsQuery<TData>) {
  return useQuery<ProposalListResponse, Error, TData>(["daoProposalMultipleReverseProposals", client.contractAddress, JSON.stringify(args)], () => client.reverseProposals({
    limit: args.limit,
    startBefore: args.startBefore
  }), options);
}
export interface DaoProposalMultipleListProposalsQuery<TData> extends DaoProposalMultipleReactQuery<ProposalListResponse, TData> {
  args: {
    limit?: number;
    startAfter?: number;
  };
}
export function useDaoProposalMultipleListProposalsQuery<TData = ProposalListResponse>({
  client,
  args,
  options
}: DaoProposalMultipleListProposalsQuery<TData>) {
  return useQuery<ProposalListResponse, Error, TData>(["daoProposalMultipleListProposals", client.contractAddress, JSON.stringify(args)], () => client.listProposals({
    limit: args.limit,
    startAfter: args.startAfter
  }), options);
}
export interface DaoProposalMultipleProposalQuery<TData> extends DaoProposalMultipleReactQuery<ProposalResponse, TData> {
  args: {
    proposalId: number;
  };
}
export function useDaoProposalMultipleProposalQuery<TData = ProposalResponse>({
  client,
  args,
  options
}: DaoProposalMultipleProposalQuery<TData>) {
  return useQuery<ProposalResponse, Error, TData>(["daoProposalMultipleProposal", client.contractAddress, JSON.stringify(args)], () => client.proposal({
    proposalId: args.proposalId
  }), options);
}
export interface DaoProposalMultipleConfigQuery<TData> extends DaoProposalMultipleReactQuery<Config, TData> {}
export function useDaoProposalMultipleConfigQuery<TData = Config>({
  client,
  options
}: DaoProposalMultipleConfigQuery<TData>) {
  return useQuery<Config, Error, TData>(["daoProposalMultipleConfig", client.contractAddress], () => client.config(), options);
}