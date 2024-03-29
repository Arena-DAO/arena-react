/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.35.7.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { NftContract, InstantiateMsg, NftMintMsg, MetadataExt, ExecuteMsg, QueryMsg, Addr, Config, InfoResponse, ContractVersion, Uint128, TotalPowerAtHeightResponse, VotingPowerAtHeightResponse } from "./DaoVotingCw721Roles.types";
import { DaoVotingCw721RolesQueryClient } from "./DaoVotingCw721Roles.client";
export interface DaoVotingCw721RolesReactQuery<TResponse, TData = TResponse> {
  client: DaoVotingCw721RolesQueryClient;
  options?: Omit<UseQueryOptions<TResponse, Error, TData>, "'queryKey' | 'queryFn' | 'initialData'"> & {
    initialData?: undefined;
  };
}
export interface DaoVotingCw721RolesInfoQuery<TData> extends DaoVotingCw721RolesReactQuery<InfoResponse, TData> {}
export function useDaoVotingCw721RolesInfoQuery<TData = InfoResponse>({
  client,
  options
}: DaoVotingCw721RolesInfoQuery<TData>) {
  return useQuery<InfoResponse, Error, TData>(["daoVotingCw721RolesInfo", client.contractAddress], () => client.info(), options);
}
export interface DaoVotingCw721RolesDaoQuery<TData> extends DaoVotingCw721RolesReactQuery<Addr, TData> {}
export function useDaoVotingCw721RolesDaoQuery<TData = Addr>({
  client,
  options
}: DaoVotingCw721RolesDaoQuery<TData>) {
  return useQuery<Addr, Error, TData>(["daoVotingCw721RolesDao", client.contractAddress], () => client.dao(), options);
}
export interface DaoVotingCw721RolesTotalPowerAtHeightQuery<TData> extends DaoVotingCw721RolesReactQuery<TotalPowerAtHeightResponse, TData> {
  args: {
    height?: number;
  };
}
export function useDaoVotingCw721RolesTotalPowerAtHeightQuery<TData = TotalPowerAtHeightResponse>({
  client,
  args,
  options
}: DaoVotingCw721RolesTotalPowerAtHeightQuery<TData>) {
  return useQuery<TotalPowerAtHeightResponse, Error, TData>(["daoVotingCw721RolesTotalPowerAtHeight", client.contractAddress, JSON.stringify(args)], () => client.totalPowerAtHeight({
    height: args.height
  }), options);
}
export interface DaoVotingCw721RolesVotingPowerAtHeightQuery<TData> extends DaoVotingCw721RolesReactQuery<VotingPowerAtHeightResponse, TData> {
  args: {
    address: string;
    height?: number;
  };
}
export function useDaoVotingCw721RolesVotingPowerAtHeightQuery<TData = VotingPowerAtHeightResponse>({
  client,
  args,
  options
}: DaoVotingCw721RolesVotingPowerAtHeightQuery<TData>) {
  return useQuery<VotingPowerAtHeightResponse, Error, TData>(["daoVotingCw721RolesVotingPowerAtHeight", client.contractAddress, JSON.stringify(args)], () => client.votingPowerAtHeight({
    address: args.address,
    height: args.height
  }), options);
}
export interface DaoVotingCw721RolesConfigQuery<TData> extends DaoVotingCw721RolesReactQuery<Config, TData> {}
export function useDaoVotingCw721RolesConfigQuery<TData = Config>({
  client,
  options
}: DaoVotingCw721RolesConfigQuery<TData>) {
  return useQuery<Config, Error, TData>(["daoVotingCw721RolesConfig", client.contractAddress], () => client.config(), options);
}