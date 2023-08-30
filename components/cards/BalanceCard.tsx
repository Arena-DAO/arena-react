import { Card, CardBody, CardFooter, CardProps } from "@chakra-ui/card";
import { Heading, Stack, StackDivider } from "@chakra-ui/layout";
import { NativeCard } from "./NativeCard";
import { ReactNode, useEffect, useState } from "react";
import { BalanceVerified } from "@arena/ArenaEscrow.types";
import { Cw20Card } from "./Cw20Card";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Cw721Card } from "./Cw721Card";
import { DataLoadedResult } from "~/types/DataLoadedResult";
import { ExponentInfo } from "~/types/ExponentInfo";

interface BalanceCardProps extends CardProps {
  header?: ReactNode;
  addrCard?: ReactNode;
  balance: BalanceVerified;
  cosmwasmClient: CosmWasmClient;
  onDataLoaded?: (data: ExponentInfo) => void;
  actions?: ReactNode;
}

export function BalanceCard({
  header,
  addrCard,
  balance,
  cosmwasmClient,
  onDataLoaded,
  actions,
  ...cardProps
}: BalanceCardProps) {
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
    if (
      !cw20Data ||
      cw20Data.exponent === undefined ||
      cw20Data.exponent === null
    )
      return;
    exponentInfo.cw20.set(cw20Data.key, cw20Data.exponent);
    onDataLoaded?.(exponentInfo);
    setExponentInfo(exponentInfo);
    setCw20Data(undefined);
  }, [cw20Data, exponentInfo, onDataLoaded]);
  useEffect(() => {
    if (
      !nativeData ||
      nativeData.exponent === undefined ||
      nativeData.exponent === null
    )
      return;
    exponentInfo.native.set(nativeData.key, nativeData.exponent);
    setExponentInfo(exponentInfo);
    onDataLoaded?.(exponentInfo);
    setNativeData(undefined);
  }, [nativeData, exponentInfo, onDataLoaded]);

  const childCardProps: CardProps = { p: 4 };

  return (
    <Card {...cardProps}>
      {header}
      <CardBody>
        <Stack>
          {addrCard}
          <Stack divider={<StackDivider />}>
            {balance.native.length > 0 && (
              <Stack>
                <Heading size="xs">Native Tokens</Heading>
                {balance.native.map((x, i) => (
                  <NativeCard
                    key={i}
                    denom={x.denom}
                    amount={x.amount}
                    onDataLoaded={setNativeData}
                    {...childCardProps}
                  />
                ))}
              </Stack>
            )}
            {balance.cw20.length > 0 && (
              <Stack>
                <Heading size="xs">Cw20 Tokens</Heading>
                {balance.cw20.map((x, i) => (
                  <Cw20Card
                    key={i}
                    cosmwasmClient={cosmwasmClient}
                    address={x.address}
                    amount={x.amount}
                    onDataLoaded={setCw20Data}
                    {...childCardProps}
                  />
                ))}
              </Stack>
            )}
            {balance.cw721.length > 0 && (
              <Stack>
                <Heading size="xs">Cw721 Tokens</Heading>
                {balance.cw721.map((x, i) => (
                  <Cw721Card
                    key={i}
                    cosmwasmClient={cosmwasmClient}
                    address={x.addr}
                    token_ids={x.token_ids}
                    {...childCardProps}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      </CardBody>
      {actions && <CardFooter>{actions}</CardFooter>}
    </Card>
  );
}
