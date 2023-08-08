import {
  NftInfoResponseForEmpty,
  ContractInfoResponse,
} from "@cw-nfts/Cw721Base.types";
import { Metadata } from "cosmjs-types/cosmos/bank/v1beta1/bank";
import { Heading, Spacer, Stack, StackDivider } from "@chakra-ui/layout";
import {
  useCw20BaseDownloadLogoQuery,
  useCw20BaseMarketingInfoQuery,
  useCw20BaseTokenInfoQuery,
} from "@cw-plus/Cw20Base.react-query";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Cw20BaseQueryClient } from "@cw-plus/Cw20Base.client";
import {
  Text,
  Skeleton,
  Card,
  CardProps,
  Avatar,
  AvatarProps,
  CardBody,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { UseFormClearErrors, UseFormSetError } from "react-hook-form";
import { BalanceSchema } from "~/helpers/SchemaHelpers";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import env from "@config/env";
import { useChain } from "@cosmos-kit/react-lite";
import { DeleteIcon } from "@chakra-ui/icons";

interface DueCardProps extends CardProps {
  cosmwasmClient: CosmWasmClient;
  balance: z.infer<typeof BalanceSchema>;
  onDataLoaded?: (data: ExponentInfo) => void;
  cw20DeleteFn?: (index: number) => void;
  nativeDeleteFn?: (index: number) => void;
  cw721DeleteFn?: (index: number) => void;
}

interface NativeInfo {
  imageUrl?: string;
  exponent: number;
}

export interface ExponentInfo {
  cw20: Map<string, number>;
  native: Map<string, number>;
}

interface Cw20CardProps extends CardProps {
  cosmwasmClient: CosmWasmClient;
  address: string;
  amount: number;
  deleteFn?: (index: number) => void;
  onDataLoaded?: (data: [string, number]) => void;
  setError?: UseFormSetError<{ address: string }>;
  clearErrors?: UseFormClearErrors<{ address: string }>;
  index: number;
}

interface Cw20LogoProps extends AvatarProps {
  cosmwasmClient: CosmWasmClient;
  addr: string;
}

interface NativeCardProps extends CardProps {
  denom: string;
  amount: number;
  deleteFn?: (index: number) => void;
  onDataLoaded?: (data: [string, number]) => void;
  setError?: UseFormSetError<{ address: string }>;
  clearErrors?: UseFormClearErrors<{ address: string }>;
  index: number;
}

export function NativeCard({
  denom,
  amount,
  onDataLoaded,
  setError,
  clearErrors,
  deleteFn,
  index,
  ...cardProps
}: NativeCardProps) {
  const { assets } = useChain(env.CHAIN);
  const asset = useMemo(() => {
    return assets?.assets.find((x) =>
      x.denom_units.find((y) => y.denom.toLowerCase() === denom.toLowerCase())
    );
  }, [assets, denom]);
  const [nativeInfo, setNativeInfo] = useState<NativeInfo | undefined>(
    asset && {
      imageUrl:
        asset.logo_URIs?.svg ?? asset.logo_URIs?.png ?? asset.logo_URIs?.jpeg,
      exponent: asset.denom_units.find((x) => x.denom == denom)!.exponent,
    }
  );
  const { isLoading, isError, data } = useQuery({
    queryKey: ["native", denom],
    queryFn: () =>
      fetch(env.JUNO_API_URL + "/cosmos/bank/v1beta1/denoms_metadata/" + denom)
        .then(async (response) => {
          if (!response.ok) {
            const err = await response.json();
            throw err;
          }
          return response.json();
        })
        .then((data) => {
          // Ensure the data is in the correct format according to your Metadata type
          const metadata: Metadata = JSON.parse(data);
          return {
            exponent: metadata.denomUnits.find((x) => x.denom == denom)!
              .exponent,
          } as NativeInfo;
        }),
    enabled: !nativeInfo,
    retry: false,
  });
  useEffect(() => {
    if (data) setNativeInfo(data);
  }, [data]);
  useEffect(() => {
    if (nativeInfo) onDataLoaded?.([denom, nativeInfo.exponent]);
  }, [nativeInfo, onDataLoaded]);
  useEffect(() => {
    if (isError)
      setError?.("address", {
        message: "The given address is not a valid CW20",
      });
    else clearErrors?.("address");
  }, [isError]);

  if (isError) return <></>;
  return (
    <Skeleton isLoaded={!isLoading || !!nativeInfo}>
      <Card
        direction="row"
        px="4"
        overflow="hidden"
        alignItems="center"
        {...cardProps}
      >
        {!!nativeInfo?.imageUrl && (
          <Avatar src={nativeInfo.imageUrl!} mr="3" name={denom} size="md" />
        )}
        <CardBody>
          <Text>
            {amount} {denom}
          </Text>
        </CardBody>
        {deleteFn && (
          <IconButton
            variant="ghost"
            aria-label="Delete"
            onClick={() => deleteFn(index)}
            icon={<DeleteIcon />}
          />
        )}
      </Card>
    </Skeleton>
  );
}

function Cw20Logo({ cosmwasmClient, addr, ...avatarProps }: Cw20LogoProps) {
  const client = new Cw20BaseQueryClient(cosmwasmClient, addr);
  const { data } = useCw20BaseDownloadLogoQuery({ client });

  if (!data) return <></>;

  return (
    <Avatar
      src={`data:${data.mime_type};base64,${data.data}`}
      {...avatarProps}
    />
  );
}

export function Cw20Card({
  cosmwasmClient,
  address,
  amount,
  onDataLoaded,
  setError,
  clearErrors,
  deleteFn,
  index,
  ...cardProps
}: Cw20CardProps) {
  const client = new Cw20BaseQueryClient(cosmwasmClient, address);
  const {
    data: tokenData,
    isLoading: tokenLoading,
    isError: tokenError,
  } = useCw20BaseTokenInfoQuery({ client });
  const { data: marketingData } = useCw20BaseMarketingInfoQuery({
    client,
    options: { enabled: !!tokenData },
  });
  useEffect(() => {
    if (tokenData) onDataLoaded?.([address, tokenData.decimals]);
  }, [tokenData, onDataLoaded]);
  useEffect(() => {
    if (tokenError)
      setError?.("address", {
        message: "The given address is not a valid CW20",
      });
    else clearErrors?.("address");
  }, [tokenError]);

  if (tokenError) return <></>;

  let logo;

  if (tokenData) {
    onDataLoaded?.([address, tokenData.decimals]);
  }
  if (marketingData) {
    const avatarProps: AvatarProps = { mr: "3", name: tokenData?.name };

    if (marketingData.logo == "embedded")
      logo = (
        <Cw20Logo
          cosmwasmClient={cosmwasmClient}
          addr={address}
          {...avatarProps}
        />
      );
    else if (marketingData.logo?.url)
      logo = <Avatar src={marketingData.logo?.url} {...avatarProps} />;
  }

  return (
    <Skeleton isLoaded={!tokenLoading}>
      <Card
        direction="row"
        px="4"
        overflow="hidden"
        alignItems="center"
        {...cardProps}
      >
        {logo}
        <CardBody>
          <Text>
            {amount} {tokenData?.symbol}
          </Text>
        </CardBody>
        {deleteFn && (
          <IconButton
            variant="ghost"
            aria-label="Delete"
            onClick={() => deleteFn(index)}
            icon={<DeleteIcon />}
          />
        )}
      </Card>
    </Skeleton>
  );
}

export function DueCard({
  cosmwasmClient,
  balance,
  onDataLoaded,
  cw20DeleteFn,
  cw721DeleteFn,
  nativeDeleteFn,
  ...cardProps
}: DueCardProps) {
  const [cw20Data, setCw20Data] = useState<[string, number] | undefined>(
    undefined
  );
  const [nativeData, setNativeData] = useState<[string, number] | undefined>(
    undefined
  );
  const [exponentInfo, setExponentInfo] = useState<ExponentInfo>({
    cw20: new Map(),
    native: new Map(),
  });
  useEffect(() => {
    if (!cw20Data) return;
    exponentInfo.cw20.set(cw20Data[0], cw20Data[1]);
    onDataLoaded?.(exponentInfo);
    setExponentInfo(exponentInfo);
  }, [cw20Data]);
  useEffect(() => {
    if (!nativeData) return;
    exponentInfo.native.set(nativeData[0], nativeData[1]);
    setExponentInfo(exponentInfo);
    onDataLoaded?.(exponentInfo);
  }, [nativeData]);

  const childCardProps: CardProps = { p: 4 };

  return (
    <Card {...cardProps}>
      <CardBody>
        <Stack divider={<StackDivider />}>
          {balance.native && balance.native.length > 0 && (
            <Stack>
              <Heading size="xs">Native Tokens</Heading>
              {balance.native.map((x, i) => (
                <NativeCard
                  key={i}
                  denom={x.denom}
                  amount={x.amount}
                  onDataLoaded={setNativeData}
                  deleteFn={nativeDeleteFn}
                  index={i}
                  {...childCardProps}
                />
              ))}
            </Stack>
          )}
          {balance.cw20 && balance.cw20.length > 0 && (
            <Stack>
              <Heading size="xs">Cw20 Tokens</Heading>
              {balance.cw20.map((x, i) => (
                <Cw20Card
                  key={i}
                  cosmwasmClient={cosmwasmClient}
                  address={x.address}
                  amount={x.amount}
                  onDataLoaded={setCw20Data}
                  deleteFn={cw20DeleteFn}
                  index={i}
                  {...childCardProps}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}
