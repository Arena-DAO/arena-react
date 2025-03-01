"use client";

import { Card, Divider, Tab, Tabs, cn } from "@heroui/react";
import { Lock, Trophy, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useEnv } from "~/hooks/useEnv";
import CompetitionModuleSection from "./components/CompetitionModuleSection";

const Jailhouse = () => {
	const env = useEnv();
	const [mounted, setMounted] = useState(false);

	// Animation sequence on mount
	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="container mx-auto space-y-6 px-4 py-8">
			{/* Hero section with animated elements */}
			<div className="relative">
				{/* Background decorative elements */}
				<div className="-top-16 -right-16 absolute h-64 w-64 rounded-full bg-primary/5 opacity-50 blur-3xl" />
				<div className="-bottom-32 -left-16 absolute h-96 w-96 rounded-full bg-primary/10 opacity-30 blur-3xl" />

				{/* Main content */}
				<div
					className={cn(
						"relative z-10 space-y-4 text-center transition-all duration-700",
						mounted ? "transform-none opacity-100" : "translate-y-8 opacity-0",
					)}
				>
					<div className="mb-4 inline-flex items-center justify-center">
						<div className="relative">
							<Lock size={32} className="animate-pulse-subtle text-primary" />
							<div className="absolute inset-0 rounded-full shadow-glow blur-md" />
						</div>
					</div>

					<h1 className="mb-2 font-bold font-cinzel text-6xl text-glow">
						Jailhouse
					</h1>

					<p className="mx-auto max-w-2xl text-background-600 text-lg dark:text-background-400">
						Manage competition security and disputed outcomes. Resolve conflicts
						and ensure fair play across all competitions.
					</p>

					<Divider className="my-8 opacity-30" />
				</div>
			</div>

			{/* Tabs section with glassmorphism */}
			<Card
				className={cn(
					"glassmorphism overflow-hidden border-background-200/20 transition-all delay-300 duration-700",
					mounted ? "transform-none opacity-100" : "translate-y-8 opacity-0",
				)}
			>
				<Tabs
					aria-label="Competition Modules"
					size="lg"
					color="primary"
					classNames={{
						base: "p-0",
						tabList:
							"relative bg-background-50/60 backdrop-blur-md p-2 border-b border-background-200/30",
						cursor: "bg-primary-900/30 shadow-inner-glow",
						tab: "data-[selected=true]:text-primary data-[selected=true]:font-semibold",
						tabContent: "p-0",
					}}
				>
					<Tab
						key="wagers"
						title={
							<div className="flex items-center gap-2 px-2">
								<Zap size={18} />
								<span>Wagers</span>
							</div>
						}
					>
						<div className="p-4">
							<CompetitionModuleSection
								path="wager"
								module_addr={env.ARENA_WAGER_MODULE_ADDRESS}
							/>
						</div>
					</Tab>

					<Tab
						key="leagues"
						title={
							<div className="flex items-center gap-2 px-2">
								<Users size={18} />
								<span>Leagues</span>
							</div>
						}
					>
						<div className="p-4">
							<CompetitionModuleSection
								path="league"
								module_addr={env.ARENA_LEAGUE_MODULE_ADDRESS}
							/>
						</div>
					</Tab>

					<Tab
						key="tournaments"
						title={
							<div className="flex items-center gap-2 px-2">
								<Trophy size={18} />
								<span>Tournaments</span>
							</div>
						}
					>
						<div className="p-4">
							<CompetitionModuleSection
								path="tournament"
								module_addr={env.ARENA_TOURNAMENT_MODULE_ADDRESS}
							/>
						</div>
					</Tab>
				</Tabs>
			</Card>
		</div>
	);
};

export default Jailhouse;
