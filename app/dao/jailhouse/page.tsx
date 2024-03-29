"use client";

import { Tab, Tabs } from "@nextui-org/react";
import { useEnv } from "~/hooks/useEnv";
import CompetitionModuleSection from "./components/CompetitionModuleSection";

const Jailhouse = () => {
	const { data: env } = useEnv();

	return (
		<div className="space-y-4">
			<h1 className="text-5xl text-center">Jailhouse</h1>
			<Tabs
				aria-label="Competition Modules"
				disabledKeys={["leagues", "tournaments"]}
			>
				<Tab key="wagers" title="Wagers">
					<CompetitionModuleSection
						path="wager"
						module_addr={env.ARENA_WAGER_MODULE_ADDRESS}
					/>
				</Tab>
				<Tab key="leagues" title="Leagues" />
				<Tab key="tournaments" title="Tournaments" />
			</Tabs>
		</div>
	);
};

export default Jailhouse;
