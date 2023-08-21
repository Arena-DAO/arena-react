import {
  CardProps,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@chakra-ui/card";
import { DeleteIcon } from "@chakra-ui/icons";
import {
  Skeleton,
  Tooltip,
  IconButton,
  Text,
  Image,
  Button,
  HStack,
  Heading,
} from "@chakra-ui/react";
import {
  useCw721BaseContractInfoQuery,
  useCw721BaseNftInfoQuery,
} from "@cw-nfts/Cw721Base.react-query";
import {
  useCw20BaseTokenInfoQuery,
  useCw20BaseMarketingInfoQuery,
} from "@cw-plus/Cw20Base.react-query";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Cw721BaseQueryClient } from "@cw-nfts/Cw721Base.client";
import { DataLoadedResult } from "./DueCard";
import { useEffect } from "react";

interface Cw721CardProps extends CardProps {
  cosmwasmClient: CosmWasmClient;
  address: string;
  token_ids: string[];
  deleteFn?: (index: number) => void;
  deleteNFTFn?: (token_id: string) => void;
  nftCardProps?: CardProps;
  index?: number;
  onDataLoaded?: (data: DataLoadedResult) => void;
}

interface Cw721NFTCardProps extends CardProps {
  cosmwasmClient: CosmWasmClient;
  address: string;
  token_id: string;
  deleteNFTFn?: (token_id: string) => void;
}

export function Cw721NFTCard({
  address,
  token_id,
  cosmwasmClient,
  deleteNFTFn,
  ...nftCardProps
}: Cw721NFTCardProps) {
  const { data, isLoading, isError } = useCw721BaseNftInfoQuery({
    client: new Cw721BaseQueryClient(cosmwasmClient, address),
    args: { tokenId: token_id },
    options: { retry: false, staleTime: Infinity },
  });

  if (isError) return <></>;
  return (
    <Skeleton isLoaded={!isLoading}>
      <Card {...nftCardProps}>
        <CardBody>
          <Image
            objectFit="cover"
            src={data?.token_uri || undefined}
            alt="NFT"
          />
        </CardBody>
        <CardFooter>
          {deleteNFTFn && (
            <Tooltip label="Delete NFT">
              <IconButton
                aria-label="Delete NFT"
                icon={<DeleteIcon />}
                onClick={() => deleteNFTFn(token_id)}
              />
            </Tooltip>
          )}
        </CardFooter>
      </Card>
    </Skeleton>
  );
}

export function Cw721Card({
  cosmwasmClient,
  address,
  token_ids,
  deleteFn,
  deleteNFTFn,
  nftCardProps,
  index = 0,
  onDataLoaded,
  ...cardProps
}: Cw721CardProps) {
  const { data, isLoading, isError } = useCw721BaseContractInfoQuery({
    client: new Cw721BaseQueryClient(cosmwasmClient, address),
    options: { retry: false, staleTime: Infinity },
  });

  useEffect(() => {
    onDataLoaded?.({
      key: address,
      exponent: !!data ? 0 : undefined,
    });
  }, [data, onDataLoaded, address]);

  if (isError) return <></>;
  return (
    <Skeleton isLoaded={!isLoading}>
      <Card
        direction="row"
        px="4"
        overflow="hidden"
        alignItems="center"
        {...cardProps}
      >
        <CardHeader>
          <Heading>{data?.name}</Heading>
        </CardHeader>
        <CardBody>
          <HStack overflowX="auto">
            {token_ids.map((x, i) => {
              return (
                <Cw721NFTCard
                  key={i}
                  cosmwasmClient={cosmwasmClient}
                  address={address}
                  token_id={x}
                  deleteNFTFn={deleteNFTFn}
                  {...nftCardProps}
                />
              );
            })}
          </HStack>
        </CardBody>
        <CardFooter>
          {deleteFn && (
            <Tooltip label="Delete Collection">
              <IconButton
                variant="ghost"
                aria-label="Delete"
                onClick={() => deleteFn(index)}
                icon={<DeleteIcon />}
              />
            </Tooltip>
          )}
        </CardFooter>
      </Card>
    </Skeleton>
  );
}
