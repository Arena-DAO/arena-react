"use client";

import { Tab, Tabs } from "@heroui/react";
import { useEnv } from "~/hooks/useEnv";
import CompetitionModuleSection from "./components/CompetitionModuleSection";

const Jailhouse = () => {
	const env = useEnv();

	return (
		<div className="container mx-auto space-y-4">
			<h1 className="title text-center text-5xl">Jailhouse</h1>
			<Tabs aria-label="Competition Modules">
				<Tab key="wagers" title="Wagers">
					<CompetitionModuleSection
						path="wager"
						module_addr={env.ARENA_WAGER_MODULE_ADDRESS}
					/>
				</Tab>
				<Tab key="leagues" title="Leagues">
					<CompetitionModuleSection
						path="league"
						module_addr={env.ARENA_LEAGUE_MODULE_ADDRESS}
					/>
				</Tab>
				<Tab key="tournaments" title="Tournaments">
					<CompetitionModuleSection
						path="tournament"
						module_addr={env.ARENA_TOURNAMENT_MODULE_ADDRESS}
					/>
				</Tab>
			</Tabs>
		</div>
	);
};

export default Jailhouse;
