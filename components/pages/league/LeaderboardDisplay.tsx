import { Heading, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";
import { ArenaLeagueModuleQueryClient } from "~/ts-codegen/arena/ArenaLeagueModule.client";
import { useArenaLeagueModuleQueryExtensionQuery } from "~/ts-codegen/arena/ArenaLeagueModule.react-query";
import { MemberPoints } from "~/ts-codegen/arena/ArenaLeagueModule.types";
import { LeagueExtensionProps } from "./LeagueExtension";

export default function LeaderboardDisplay({
	cosmwasmClient,
	module_addr,
	id,
}: LeagueExtensionProps) {
	const { data } = useArenaLeagueModuleQueryExtensionQuery({
		client: new ArenaLeagueModuleQueryClient(cosmwasmClient, module_addr),
		args: { msg: { leaderboard: { league_id: id } } },
	});

	if (!data) return null;

	const leaderboard = data as unknown as MemberPoints[];

	if (leaderboard.length === 0) return null;

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
