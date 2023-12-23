import { ArenaLeagueModuleQueryClient } from "@arena/ArenaLeagueModule.client";
import { useArenaLeagueModuleQueryExtensionQuery } from "@arena/ArenaLeagueModule.react-query";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Table, Thead, Tbody, Tr, Th, Td, Heading } from "@chakra-ui/react";
import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";
import { MemberPoints } from "@arena/ArenaLeagueModule.types";

export default function LeaderboardDisplay({
  cosmwasmClient,
  module_addr,
  id,
}: {
  cosmwasmClient: CosmWasmClient;
  module_addr: string;
  id: string;
}) {
  const { data } = useArenaLeagueModuleQueryExtensionQuery({
    client: new ArenaLeagueModuleQueryClient(cosmwasmClient, module_addr),
    args: { msg: { leaderboard: { league_id: id } } },
  });

  if (!data) return null;

  const leaderboard = data as unknown as MemberPoints[];
  leaderboard.sort((a, b) => Number(b.points) - Number(a.points));

  return (
    <>
      <Heading size="xl">Leaderboard</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Member</Th>
            <Th>Points</Th>
            <Th>Matches Played</Th>
          </Tr>
        </Thead>
        <Tbody>
          {leaderboard.map((member, index) => (
            <Tr key={index}>
              <Td>
                <UserOrDAOCard
                  address={member.member}
                  cosmwasmClient={cosmwasmClient}
                />
              </Td>
              <Td>{member.points}</Td>
              <Td>{member.matches_played}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
}
