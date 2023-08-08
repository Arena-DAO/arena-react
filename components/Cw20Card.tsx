import {
  useCw20BaseMarketingInfoQuery,
  useCw20BaseTokenInfoQuery,
} from "@cw-plus/Cw20Base.react-query";
import { Cw20BaseQueryClient } from "@cw-plus/Cw20Base.client";
import {
  Text,
  Skeleton,
  Card,
  Avatar,
  AvatarProps,
  CardBody,
  IconButton,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import { Cw20CardProps, Cw20Logo } from "./DueCard";

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
          <Tooltip label="Delete Rule">
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
