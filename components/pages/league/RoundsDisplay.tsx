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
} from "@chakra-ui/react";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useState } from "react";

interface RoundsDisplayProps {
  cosmwasmClient: CosmWasmClient;
  module_addr: string;
  id: string;
}

function RoundDisplay({
  cosmwasmClient,
  module_addr,
  id,
  round_number,
}: RoundsDisplayProps & { round_number: string }) {
  const { data } = useArenaLeagueModuleQueryExtensionQuery({
    client: new ArenaLeagueModuleQueryClient(cosmwasmClient, module_addr),
    args: { msg: { round: { league_id: id, round_number: round_number } } },
  });

  if (!data) return null;
  const round = data as unknown as RoundResponse;

  return (
    <Card p={5} shadow="md" borderWidth="1px">
      <Heading fontSize="xl">Round Number: {round.round_number}</Heading>
      <Text mt={4}>
        Expiration:{" "}
        {"at_height" in round.expiration
          ? `At height: ${round.expiration.at_height}`
          : "at_time" in round.expiration
          ? `At time: ${round.expiration.at_time}`
          : "Never"}
      </Text>
      <Heading mt={4} fontSize="md">
        Matches:
      </Heading>
      {round.matches.map((match, index) => (
        <VStack align="start" key={index}>
          <Text>Match Number: {match.match_number}</Text>
          <Text>Team 1: {match.team_1}</Text>
          <Text>Team 2: {match.team_2}</Text>
          <Text>Result: {match.result}</Text>
        </VStack>
      ))}
    </Card>
  );
}

export default function RoundsDisplay({
  cosmwasmClient,
  module_addr,
  id,
}: RoundsDisplayProps) {
  const [carouselIndex, setCarouselIndex] = useState(1);

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
        />
        <Button onClick={() => setCarouselIndex((prevIndex) => prevIndex + 1)}>
          Next
        </Button>
      </HStack>
    </Box>
  );
}
