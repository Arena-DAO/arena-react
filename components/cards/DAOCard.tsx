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
import { ViewIcon } from "@chakra-ui/icons";
import { useDaoDaoCoreConfigQuery } from "@dao/DaoDaoCore.react-query";
import { convertIPFSToHttp } from "~/helpers/IPFSHelpers";
import NextLink from "next/link";
import { DaoDaoCoreQueryClient } from "@dao/DaoDaoCore.client";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { CopyAddressButton } from "@components/buttons/CopyAddressButton";
import env from "@config/env";
import { BsYinYang } from "react-icons/bs";
import { AddressSchema } from "@config/schemas";

interface DAOCardProps extends CardProps {
  address: string;
  cosmwasmClient: CosmWasmClient;
  showViewLink?: boolean;
}

export function DAOCard({
  address,
  cosmwasmClient,
  showViewLink = true,
  ...cardProps
}: DAOCardProps) {
  const isEnabled = AddressSchema.safeParse(address).success;
  const { data, isLoading, isError } = useDaoDaoCoreConfigQuery({
    client: new DaoDaoCoreQueryClient(cosmwasmClient, address),
    options: {
      staleTime: Infinity,
      retry: false,
      enabled: isEnabled,
    },
  });

  if (isError || !isEnabled) {
    return null;
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
        <CardBody overflowX={"auto"} whiteSpace={"nowrap"} minW="100px">
          <Text fontSize="xl">{data?.name}</Text>
        </CardBody>
        <CardFooter
          alignItems={"center"}
          overflowX={"auto"}
          whiteSpace={"nowrap"}
          px="0"
        >
          <CopyAddressButton addr={address} aria-label="Copy Address" />
          {showViewLink && (
            <Tooltip label="View Arena Page">
              <Link
                as={NextLink}
                href={"/dao/view?dao=" + address}
                _hover={{ textDecoration: "none" }}
                _focus={{ outline: "none" }}
              >
                <IconButton
                  icon={<ViewIcon />}
                  aria-label="View"
                  variant="ghost"
                />
              </Link>
            </Tooltip>
          )}
          <Tooltip label="View on DAO DAO">
            <Link
              as={NextLink}
              href={env.DAO_DAO_URL + "/dao/" + address}
              _hover={{ textDecoration: "none" }}
              _focus={{ outline: "none" }}
              target="_blank"
            >
              <IconButton
                icon={<BsYinYang />}
                aria-label="View"
                variant="ghost"
              />
            </Link>
          </Tooltip>
        </CardFooter>
      </Card>
    </Skeleton>
  );
}
