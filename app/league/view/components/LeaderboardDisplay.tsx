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
import { useEffect, useMemo } from "react";
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
	version: number;
}

const LeaderboardDisplay = ({
	cosmWasmClient,
	moduleAddr,
	league,
	version,
	...props
}: WithClient<LeaderboardDisplayProps>) => {
	const { data, refetch } = useArenaLeagueModuleQueryExtensionQuery({
		client: new ArenaLeagueModuleQueryClient(cosmWasmClient, moduleAddr),
		args: { msg: { leaderboard: { league_id: league.id } } },
	});

	const parsedData = useMemo(() => {
		if (!data) return [];
		const sortedData = data as unknown as MemberPoints[];
		sortedData.sort((a, b) => Number(BigInt(b.points) - BigInt(a.points)));
		return sortedData;
	}, [data]);

	useEffect(() => {
		if (version > 0) refetch();
	}, [version, refetch]);

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
