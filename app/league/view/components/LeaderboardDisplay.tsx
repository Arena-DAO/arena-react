"use client";

import Profile from "@/components/Profile";
import {
	Card,
	CardBody,
	CardHeader,
	type CardProps,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@nextui-org/react";
import { ArenaLeagueModuleQueryClient } from "~/codegen/ArenaLeagueModule.client";
import { useArenaLeagueModuleQueryExtensionQuery } from "~/codegen/ArenaLeagueModule.react-query";
import type {
	CompetitionResponseForCompetitionExt,
	MemberPoints,
} from "~/codegen/ArenaLeagueModule.types";
import type { WithClient } from "~/types/util";

interface LeaderboardDisplayProps extends CardProps {
	league: CompetitionResponseForCompetitionExt;
	moduleAddr: string;
}

const LeaderboardDisplay = ({
	cosmWasmClient,
	moduleAddr,
	league,
	...props
}: WithClient<LeaderboardDisplayProps>) => {
	const { data } = useArenaLeagueModuleQueryExtensionQuery({
		client: new ArenaLeagueModuleQueryClient(cosmWasmClient, moduleAddr),
		args: { msg: { leaderboard: { league_id: league.id } } },
	});

	if (!data) return null;
	const parsedData = data as unknown as MemberPoints[];
	return (
		<Card {...props}>
			<CardHeader>Leaderboard</CardHeader>
			<CardBody className="space-y-4">
				<p>
					Teams: {league.extension.teams} Matches Played:{" "}
					{league.extension.processed_matches}/{league.extension.matches}
				</p>
				<Table aria-label="Leaderboard" removeWrapper hideHeader>
					<TableHeader>
						<TableColumn>Member</TableColumn>
						<TableColumn>Matches Played</TableColumn>
						<TableColumn>Points</TableColumn>
					</TableHeader>
					<TableBody items={parsedData}>
						{(x) => (
							<TableRow key={x.member}>
								<TableCell>
									<Profile address={x.member} cosmWasmClient={cosmWasmClient} />
								</TableCell>
								<TableCell>{x.matches_played}</TableCell>
								<TableCell>{x.points}</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardBody>
		</Card>
	);
};

export default LeaderboardDisplay;
