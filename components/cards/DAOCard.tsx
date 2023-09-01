import {
  Avatar,
  Card,
  CardBody,
  CardFooter,
  CardProps,
  IconButton,
  Link,
  Skeleton,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useDaoDaoCoreConfigQuery } from "@dao/DaoDaoCore.react-query";
import { convertIPFSToHttp } from "~/helpers/IPFSHelpers";
import NextLink from "next/link";
import { DaoDaoCoreQueryClient } from "@dao/DaoDaoCore.client";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import env from "config/env";
import { CopyAddressButton } from "@components/buttons/CopyAddressButton";

interface DAOCardProps extends CardProps {
  address: string;
  cosmwasmClient: CosmWasmClient;
}

export function DAOCard({
  address,
  cosmwasmClient,
  ...cardProps
}: DAOCardProps) {
  const { data, isLoading, isError } = useDaoDaoCoreConfigQuery({
    client: new DaoDaoCoreQueryClient(cosmwasmClient, address),
    options: {
      staleTime: Infinity,
      retry: false,
    },
  });

  if (isError) {
    return <></>;
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
        <Avatar
          src={convertIPFSToHttp(data?.image_url)}
          marginRight="3"
          name={data?.name}
        />
        <CardBody overflowX={"auto"} whiteSpace={"nowrap"}>
          <Text fontSize="xl">{data?.name}</Text>
        </CardBody>
        <CardFooter alignItems={"center"}>
          <Tooltip label="View">
            <Link
              as={NextLink}
              href={env.DAO_DAO_URL + "/dao/" + address}
              _hover={{ textDecoration: "none" }}
              _focus={{ outline: "none" }}
              target="_blank"
            >
              <IconButton
                icon={<ExternalLinkIcon />}
                aria-label="View"
                variant="ghost"
              />
            </Link>
          </Tooltip>
          <CopyAddressButton addr={address} aria-label="Copy Address" />
        </CardFooter>
      </Card>
    </Skeleton>
  );
}
