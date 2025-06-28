"use client";

import { useChain } from "@cosmos-kit/react";
import {
	Card,
	CardBody,
	CardHeader,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { Users } from "lucide-react";
import Profile from "@/components/Profile";
import { ArenaTeamEnrollmentsQueryClient } from "~/codegen/ArenaTeamEnrollments.client";
import { useArenaTeamEnrollmentsListTeamsQuery } from "~/codegen/ArenaTeamEnrollments.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

const TeamsPage = () => {
	const env = useEnv();
	const { data: client } = useCosmWasmClient();
	const { address } = useChain(env.CHAIN);

	// Query user's teams
	const { data: teams, isLoading: isTeamsLoading } = useArenaTeamEnrollmentsListTeamsQuery({
		client:
			client && new ArenaTeamEnrollmentsQueryClient(client, env.ARENA_TEAM_ENROLLMENTS_ADDRESS),
		args: {
			user: address || "",
			limit: 100,
		},
		options: { enabled: !!client && !!address },
	});

	return (
		<div className="container mx-auto space-y-6 p-4">
			<Card>
				<CardHeader className="px-6 py-4">
					<div className="flex items-center gap-2">
						<Users size={20} className="text-primary" />
						<h1 className="font-bold text-2xl">My Teams</h1>
					</div>
				</CardHeader>
				<CardBody>
					{isTeamsLoading ? (
						<div className="flex items-center justify-center py-12">
							<Spinner size="lg" />
						</div>
					) : (
						<Table aria-label="Teams table" hideHeader removeWrapper>
							<TableHeader>
								<TableColumn>TEAM NAME</TableColumn>
							</TableHeader>
							<TableBody emptyContent="No teams yet... create one!">
								{(teams || []).map((team, index) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: Best option
									<TableRow key={index}>
										<TableCell>
											<Profile address={team} isRatingDisabled />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardBody>
			</Card>
		</div>
	);
};

export default TeamsPage;
