"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, Tab } from "@nextui-org/react";
import Profile from "@/components/Profile";
import EnrollmentsList from "./components/EnrollmentsList";
// import WagersList from "./components/WagersList";
// import LeaguesList from "./components/LeaguesList";
// import TournamentsList from "./components/TournamentsList";

const UserCompetitionsView = () => {
	const searchParams = useSearchParams();
	const hostAddress = searchParams?.get("host");

	if (!hostAddress) {
		return <h1>Could not get host...</h1>;
	}

	return (
		<div className="container mx-auto gap-4 p-4">
			<h1 className="text-center font-bold text-3xl">User Competitions</h1>
			{hostAddress && (
				<div className="gap-4 pb-6">
					<h2 className="mb-2 text-xl">Host:</h2>
					<Profile address={hostAddress} />
				</div>
			)}
			<Tabs aria-label="Competition Types">
				<Tab key="enrollments" title="Enrollments">
					<EnrollmentsList hostAddress={hostAddress} />
				</Tab>
				{/* <Tab key="wagers" title="Wagers">
					<WagersList hostAddress={hostAddress} />
				</Tab>
				<Tab key="leagues" title="Leagues">
					<LeaguesList hostAddress={hostAddress} />
				</Tab>
				<Tab key="tournaments" title="Tournaments">
					<TournamentsList hostAddress={hostAddress} />
				</Tab> */}
			</Tabs>
		</div>
	);
};

export default UserCompetitionsView;
