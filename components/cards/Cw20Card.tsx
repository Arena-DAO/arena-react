import { CardProps, Card, CardBody } from "@chakra-ui/card";
import { DeleteIcon } from "@chakra-ui/icons";
import {
  AvatarProps,
  Skeleton,
  Tooltip,
  IconButton,
  Text,
  Avatar,
} from "@chakra-ui/react";
import { Cw20BaseQueryClient } from "@cw-plus/Cw20Base.client";
import {
  useCw20BaseTokenInfoQuery,
  useCw20BaseMarketingInfoQuery,
  useCw20BaseDownloadLogoQuery,
} from "@cw-plus/Cw20Base.react-query";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useEffect } from "react";
import { convertIPFSToHttp } from "~/helpers/IPFSHelpers";
import { DataLoadedResult } from "~/types/DataLoadedResult";

interface Cw20CardProps extends CardProps {
  cosmwasmClient: CosmWasmClient;
  address: string;
  amount: string;
  deleteFn?: (index: number) => void;
  onDataLoaded?: (data: DataLoadedResult) => void;
  index?: number;
}

interface Cw20LogoProps extends AvatarProps {
  cosmwasmClient: CosmWasmClient;
  addr: string;
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
  deleteFn,
  index = 0,
  ...cardProps
}: Cw20CardProps) {
  const client = new Cw20BaseQueryClient(cosmwasmClient, address);
  const { data, isLoading, isError } = useCw20BaseTokenInfoQuery({
    client,
    options: { retry: false, staleTime: Infinity },
  });
  const { data: marketingData } = useCw20BaseMarketingInfoQuery({
    client,
    options: { enabled: !!data, retry: false, staleTime: Infinity },
  });
  useEffect(() => {
    onDataLoaded?.({
      key: address,
      exponent: data?.decimals,
    });
  }, [data, onDataLoaded, address]);

  if (isError) return <></>;

  let logo;
  if (marketingData) {
    const avatarProps: AvatarProps = { mr: "3", name: data?.name };

    if (marketingData.logo == "embedded")
      logo = (
        <Cw20Logo
          cosmwasmClient={cosmwasmClient}
          addr={address}
          {...avatarProps}
        />
      );
    else if (marketingData.logo?.url)
      logo = (
        <Avatar
          src={convertIPFSToHttp(marketingData.logo?.url)}
          name={data?.name}
          {...avatarProps}
        />
      );
  }

  return (
    <Skeleton isLoaded={!isLoading}>
      <Card
        direction="row"
        px="4"
        overflow="hidden"
        alignItems="center"
        {...cardProps}
      >
        {logo}
        <CardBody overflowX={"auto"} whiteSpace={"nowrap"}>
          <Text>
            {amount.toLocaleString()} {data?.symbol}
          </Text>
        </CardBody>
        {deleteFn && (
          <Tooltip label="Delete Amount">
            <IconButton
              variant="ghost"
              aria-label="Delete"
              onClick={() => deleteFn(index)}
              icon={<DeleteIcon />}
            />
          </Tooltip>
        )}
      </Card>
    </Skeleton>
  );
}
