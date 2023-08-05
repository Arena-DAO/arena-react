import {
  Box,
  BoxProps,
  Image,
  Link,
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

interface DAOCardProps extends BoxProps {
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
  ...boxProps
}: DAOCardProps) {
  const { data, isLoading, isError } = useDaoDaoCoreConfigQuery({
    client: new DaoDaoCoreQueryClient(cosmwasmClient, addr),
    options: { cacheTime: 1000 * 60 * 60, retry: false },
  });
  useEffect(() => {
    if (isError)
      setError("dao", { message: "The given address is not a valid dao" });
    else clearErrors("dao");
  }, [isError]);
  useEffect(() => {
    if (data && !isError && !isLoading) onDataLoaded?.(data);
    else onDataLoaded?.(undefined);
  }, [isError, data, isLoading, onDataLoaded]);

  if (isError) {
    return <></>;
  }

  // Render different content based on the loading and error state
  let content;
  if (isLoading) {
    content = <Text fontSize="xl">Loading...</Text>;
  } else if (data) {
    content = (
      <>
        <Image
          boxSize="50px"
          borderRadius="full"
          src={convertIPFSToHttp(data.image_url)}
          fallbackSrc="/logo.svg"
          alt="DAO Image"
          marginRight="3"
        />
        <Text fontSize="xl">{data.name}</Text>
        <Spacer />
        <Link
          as={NextLink}
          href={process.env.NEXT_PUBLIC_DAO_DAO! + "/dao/" + addr}
          _hover={{ textDecoration: "none" }}
          _focus={{ outline: "none" }}
          target="_blank"
        >
          <ExternalLinkIcon mr="3" />
        </Link>
      </>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      padding="2"
      borderRadius="md"
      boxShadow="md"
      bgColor={useColorModeValue("gray.200", "gray.700")}
      {...boxProps}
    >
      {content}
    </Box>
  );
}
