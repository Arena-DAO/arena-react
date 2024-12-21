"use client";

import Profile from "@/components/Profile";
import {
	Card,
	CardBody,
	type CardProps,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@nextui-org/react";
import { useMemo } from "react";
import { ArenaLeagueModuleQueryClient } from "~/codegen/ArenaLeagueModule.client";
import { useArenaLeagueModuleQueryExtensionQuery } from "~/codegen/ArenaLeagueModule.react-query";
import type {
	CompetitionResponseForLeagueExt,
	MemberPoints,
} from "~/codegen/ArenaLeagueModule.types";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface LeaderboardDisplayProps extends CardProps {
	league: CompetitionResponseForLeagueExt;
}

const LeaderboardDisplay = ({ league, ...props }: LeaderboardDisplayProps) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { data } = useArenaLeagueModuleQueryExtensionQuery({
		client:
			cosmWasmClient &&
			new ArenaLeagueModuleQueryClient(
				cosmWasmClient,
				env.ARENA_LEAGUE_MODULE_ADDRESS,
			),
		args: { msg: { leaderboard: { league_id: league.id } } },
		options: { enabled: !!cosmWasmClient },
	});

	const parsedData = useMemo(() => {
		if (!data) return [];
		const sortedData = data as unknown as MemberPoints[];
		sortedData.sort((a, b) => Number(BigInt(b.points) - BigInt(a.points)));
		return sortedData;
	}, [data]);

	return (
		<Card {...props}>
			<CardBody className="space-y-4">
				<div className="flex justify-between">
					<div>
						Matches Played: {league.extension.processed_matches}/
						{league.extension.matches}
					</div>
					<div>Teams: {league.extension.teams}</div>
				</div>
				<Table
					aria-label="Leaderboard"
					removeWrapper
					classNames={{
						base: "overflow-auto table-auto",
					}}
				>
					<TableHeader>
						<TableColumn>Member</TableColumn>
						<TableColumn>Matches Played</TableColumn>
						<TableColumn>Points</TableColumn>
					</TableHeader>
					<TableBody
						items={parsedData}
						emptyContent="No matches have been played yet..."
					>
						{(x) => (
							<TableRow key={x.member}>
								<TableCell>
									<Profile address={x.member} />
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
