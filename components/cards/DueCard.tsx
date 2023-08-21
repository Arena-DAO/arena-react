import { Heading, Stack, StackDivider } from "@chakra-ui/layout";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Card, CardProps, CardBody } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BalanceSchema } from "~/helpers/SchemaHelpers";
import { z } from "zod";
import { Cw20Card } from "./Cw20Card";
import { Cw721Card } from "./Cw721Card";
import { NativeCard } from "./NativeCard";

interface DueCardProps extends CardProps {
  cosmwasmClient: CosmWasmClient;
  balance: z.infer<typeof BalanceSchema>;
  onDataLoaded?: (data: ExponentInfo) => void;
  cw20DeleteFn?: (index: number) => void;
  nativeDeleteFn?: (index: number) => void;
  cw721DeleteFn?: (index: number) => void;
}

export interface DataLoadedResult {
  key: string;
  exponent: number | undefined;
}

export interface ExponentInfo {
  cw20: Map<string, number>;
  native: Map<string, number>;
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
  const [cw20Data, setCw20Data] = useState<DataLoadedResult | undefined>(
    undefined
  );
  const [nativeData, setNativeData] = useState<DataLoadedResult | undefined>(
    undefined
  );
  const [exponentInfo, setExponentInfo] = useState<ExponentInfo>({
    cw20: new Map(),
    native: new Map(),
  });
  useEffect(() => {
    if (!cw20Data || !cw20Data.exponent) return;
    exponentInfo.cw20.set(cw20Data.key, cw20Data.exponent);
    onDataLoaded?.(exponentInfo);
    setExponentInfo(exponentInfo);
    setCw20Data(undefined);
  }, [cw20Data, exponentInfo, onDataLoaded]);
  useEffect(() => {
    if (!nativeData || !nativeData.exponent) return;
    exponentInfo.native.set(nativeData.key, nativeData.exponent);
    setExponentInfo(exponentInfo);
    onDataLoaded?.(exponentInfo);
    setNativeData(undefined);
  }, [nativeData, exponentInfo, onDataLoaded]);

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
          {balance.cw721 && balance.cw721.length > 0 && (
            <Stack>
              <Heading size="xs">Cw721 Tokens</Heading>
              {balance.cw721.map((x, i) => (
                <Cw721Card
                  key={i}
                  cosmwasmClient={cosmwasmClient}
                  address={x.addr}
                  token_ids={x.token_ids}
                  deleteFn={cw721DeleteFn}
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
