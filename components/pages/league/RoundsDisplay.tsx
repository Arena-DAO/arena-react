import { ArenaLeagueModuleQueryClient } from "@arena/ArenaLeagueModule.client";
import { useArenaLeagueModuleQueryExtensionQuery } from "@arena/ArenaLeagueModule.react-query";
import { RoundResponse } from "@arena/ArenaLeagueModule.types";
import {
  Box,
  Card,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Skeleton,
} from "@chakra-ui/react";
import { LeagueExtensionProps } from "./LeagueExtension";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { utcToZonedTime } from "date-fns-tz";

function RoundDisplay({
  cosmwasmClient,
  module_addr,
  id,
  round_number,
  setHasNext,
  setIsNextLoading,
}: LeagueExtensionProps & {
  round_number: string;
  setHasNext: Dispatch<SetStateAction<boolean>>;
  setIsNextLoading: Dispatch<SetStateAction<boolean>>;
}) {
  const { data, isLoading, isError } = useArenaLeagueModuleQueryExtensionQuery({
    client: new ArenaLeagueModuleQueryClient(cosmwasmClient, module_addr),
    args: { msg: { round: { league_id: id, round_number: round_number } } },
  });

  useEffect(() => setHasNext(!isError), [isError, setHasNext]);
  useEffect(() => setIsNextLoading(isLoading), [isLoading, setIsNextLoading]);

  if (!data || isError) {
    return null;
  }

  const round = data as unknown as RoundResponse;

  return (
    <Skeleton isLoaded={!isLoading}>
      <Card p={5} shadow="md" borderWidth="1px">
        <Heading fontSize="xl">Round Number: {round?.round_number}</Heading>
        {round && (
          <Text mt={4}>
            Expiration:{" "}
            {"at_height" in round.expiration
              ? `Block ${round.expiration.at_height}`
              : "at_time" in round.expiration
              ? new Date(
                  Number(round.expiration.at_time.slice(0, -6))
                ).toString()
              : "Never"}
          </Text>
        )}
        <Heading mt={4} fontSize="md">
          Matches:
        </Heading>
        {round?.matches.map((match, index) => (
          <VStack align="start" key={index}>
            <Text>Match Number: {match.match_number}</Text>
            <Text>Team 1: {match.team_1}</Text>
            <Text>Team 2: {match.team_2}</Text>
            <Text>Result: {match.result}</Text>
          </VStack>
        ))}
      </Card>
    </Skeleton>
  );
}

export default function RoundsDisplay({
  cosmwasmClient,
  module_addr,
  id,
}: LeagueExtensionProps) {
  const [carouselIndex, setCarouselIndex] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [isNextLoading, setIsNextLoading] = useState(false);

  return (
    <Box>
      <Heading size="xl">Rounds</Heading>
      <HStack justify="center" spacing={4}>
        {carouselIndex > 1 && (
          <Button
            onClick={() => setCarouselIndex((prevIndex) => prevIndex - 1)}
          >
            Previous
          </Button>
        )}
        <RoundDisplay
          cosmwasmClient={cosmwasmClient}
          module_addr={module_addr}
          id={id}
          round_number={carouselIndex.toString()}
          setHasNext={setHasNext}
          setIsNextLoading={setIsNextLoading}
        />
        {hasNext && (
          <Button
            onClick={() => {
              setCarouselIndex((prevIndex) => prevIndex + 1);
            }}
            isLoading={isNextLoading}
          >
            Next
          </Button>
        )}
      </HStack>
    </Box>
  );
}
