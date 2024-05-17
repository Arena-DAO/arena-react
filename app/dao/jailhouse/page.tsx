"use client";

import { Tab, Tabs } from "@nextui-org/react";
import { useEnv } from "~/hooks/useEnv";
import CompetitionModuleSection from "./components/CompetitionModuleSection";

const Jailhouse = () => {
	const { data: env } = useEnv();

	return (
		<div className="space-y-4 px-10">
			<h1 className="text-center text-5xl">Jailhouse</h1>
			<Tabs aria-label="Competition Modules" disabledKeys={["tournaments"]}>
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
				<Tab key="tournaments" title="Tournaments" />
			</Tabs>
		</div>
	);
};

export default Jailhouse;
