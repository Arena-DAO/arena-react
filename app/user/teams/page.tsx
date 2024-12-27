"use client";

import Profile from "@/components/Profile";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Link,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@nextui-org/react";
import { useTeamStore } from "~/store/teamStore";

const TeamsPage = () => {
	const teams = useTeamStore((state) => state.teams);

	return (
		<div className="container mx-auto space-y-6 p-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between gap-3">
					<h1 className="font-bold text-2xl">Teams</h1>
					<Button color="primary" as={Link} href="/team/create">
						Create Team
					</Button>
				</CardHeader>
				<CardBody>
					<Table aria-label="Teams table" hideHeader removeWrapper>
						<TableHeader>
							<TableColumn>TEAM NAME</TableColumn>
						</TableHeader>
						<TableBody emptyContent="No teams yet... create one!">
							{teams.map((team, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: Best option
								<TableRow key={index}>
									<TableCell>
										<Profile address={team} isRatingDisabled />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardBody>
			</Card>
		</div>
	);
};

export default TeamsPage;
