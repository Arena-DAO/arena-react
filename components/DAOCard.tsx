import {
  Avatar,
  Box,
  Card,
  CardBody,
  CardProps,
  Image,
  Link,
  Skeleton,
  Spacer,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useDaoDaoCoreConfigQuery } from "@dao/DaoDaoCore.react-query";
import { convertIPFSToHttp } from "~/helpers/IPFSHelpers";
import NextLink from "next/link";
import { DaoDaoCoreQueryClient } from "@dao/DaoDaoCore.client";
import { Config } from "@dao/DaoDaoCore.types";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { UseFormClearErrors, UseFormSetError } from "react-hook-form";
import { useEffect } from "react";
import env from "config/env";

interface DAOCardProps extends CardProps {
  addr: string;
  onDataLoaded?: (data: Config | undefined) => void;
  cosmwasmClient: CosmWasmClient;
  setError: UseFormSetError<{ dao: string }>;
  clearErrors: UseFormClearErrors<{ dao: string }>;
}

export function DAOCard({
  cosmwasmClient,
  addr,
  onDataLoaded,
  setError,
  clearErrors,
  ...cardProps
}: DAOCardProps) {
  const { data, isLoading, isError } = useDaoDaoCoreConfigQuery({
    client: new DaoDaoCoreQueryClient(cosmwasmClient, addr),
    options: { staleTime: Infinity, retry: false },
  });
  useEffect(() => {
    if (isError)
      setError("dao", { message: "The given address is not a valid dao" });
    else clearErrors("dao");
  }, [isError]);
  useEffect(() => {
    if (data) onDataLoaded?.(data);
    else onDataLoaded?.(undefined);
  }, [data, onDataLoaded]);

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
        <CardBody>
          <Text fontSize="xl">{data?.name}</Text>
        </CardBody>
        <Link
          as={NextLink}
          href={env.DAO_DAO_URL + "/dao/" + addr}
          _hover={{ textDecoration: "none" }}
          _focus={{ outline: "none" }}
          target="_blank"
        >
          <ExternalLinkIcon mr="3" />
        </Link>
      </Card>
    </Skeleton>
  );
}
