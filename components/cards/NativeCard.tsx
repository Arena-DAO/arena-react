import { CardProps, Card, CardBody } from "@chakra-ui/card";
import { DeleteIcon } from "@chakra-ui/icons";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Avatar, Tooltip, IconButton, Text } from "@chakra-ui/react";
import { useChain } from "@cosmos-kit/react-lite";
import { Metadata } from "cosmjs-types/cosmos/bank/v1beta1/bank";
import env from "@config/env";
import { useMemo, useState, useEffect } from "react";
import { DataLoadedResult } from "~/types/DataLoadedResult";

interface NativeInfo {
  imageUrl?: string;
  exponent: number;
}

interface NativeCardProps extends CardProps {
  denom: string;
  amount: string;
  deleteFn?: (index: number) => void;
  onDataLoaded?: (data: DataLoadedResult) => void;
  isValidCallback?: (result: boolean | undefined) => void;
  index?: number;
}

export async function fetchNativeInfo(denom: string): Promise<NativeInfo> {
  const response = await fetch(
    env.JUNO_API_URL + "/cosmos/bank/v1beta1/denoms_metadata/" + denom
  );
  if (!response.ok) {
    const err = await response.json();
    throw err;
  }
  const data = await response.json();
  // Ensure the data is in the correct format according to your Metadata type
  const metadata: Metadata = JSON.parse(data);
  return {
    exponent: metadata.denomUnits.find((x) => x.denom == denom)!.exponent,
  } as NativeInfo;
}

export function NativeCard({
  denom,
  amount,
  onDataLoaded,
  deleteFn,
  index = 0,
  ...cardProps
}: NativeCardProps) {
  const { assets } = useChain(env.CHAIN);
  const asset = useMemo(() => {
    return assets?.assets.find((x) =>
      x.denom_units.find((y) => y.denom.toLowerCase() === denom.toLowerCase())
    );
  }, [assets, denom]);
  const [nativeInfo, setNativeInfo] = useState<NativeInfo | undefined>(
    undefined
  );
  useEffect(() => {
    if (asset) {
      const info: NativeInfo = {
        imageUrl:
          asset.logo_URIs?.svg ?? asset.logo_URIs?.png ?? asset.logo_URIs?.jpeg,
        exponent:
          asset.denom_units.find((x) => x.denom == denom)?.exponent ?? 0,
      };
      setNativeInfo(info);
    } else setNativeInfo(undefined);
  }, [asset, denom, setNativeInfo]);

  const { isLoading, isError, data } = useQuery({
    queryKey: ["native", denom],
    queryFn: async () => await fetchNativeInfo(denom),
    enabled: !asset && !nativeInfo,
    retry: false,
    staleTime: Infinity,
  });
  useEffect(() => {
    if (data && !isLoading && !isError) setNativeInfo(data);
  }, [data, isLoading, isError]);
  useEffect(() => {
    onDataLoaded?.({
      key: denom,
      exponent: nativeInfo?.exponent,
    });
  }, [nativeInfo, onDataLoaded, denom]);

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
        <CardBody overflowX={"auto"} whiteSpace={"nowrap"}>
          <Text>
            {amount.toLocaleString()} {denom}
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
