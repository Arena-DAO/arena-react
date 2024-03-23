"use client";

import { Card, CardBody, CardHeader, Image, Link } from "@nextui-org/react";
import { useTheme } from "next-themes";
import NextImage from "next/image";
import Chart from "react-google-charts";
import {
	BsBookFill,
	BsBuildingFill,
	BsCalendarEventFill,
	BsChatFill,
	BsCheck2All,
	BsClockFill,
	BsCurrencyBitcoin,
	BsHddNetworkFill,
	BsLightningFill,
	BsLockFill,
	BsPeopleFill,
	BsPersonFill,
	BsPersonRolodex,
	BsShieldFillCheck,
	BsTable,
} from "react-icons/bs";
import { useEnv } from "~/hooks/useEnv";

interface FeatureProps {
	title: string;
	description: string;
	icon: React.ReactNode;
}

function Feature({ title, description, icon }: FeatureProps) {
	return (
		<Card className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3 p-4">
			<CardHeader>
				<h3 className="flex gap-4 items-center ml-2 font-bold">
					<span className="text-primary">{icon}</span> {title}
				</h3>
			</CardHeader>
			<CardBody>
				<p>{description}</p>
			</CardBody>
		</Card>
	);
}

export default function HomePage() {
	const { theme } = useTheme();
	const { data: env } = useEnv();

	return (
		<div className="space-y-4">
			<h1 className="font-extrabold text-5xl text-center">
				Welcome to the future of{" "}
				<span className="text-primary">competition</span>!
			</h1>
			<Image
				as={NextImage}
				src="/future_of_competition.png"
				alt="The future of competition"
				width="800"
				height="400"
				className="trophy_cursor mx-auto"
			/>
			<div className="block text-start">
				<Link href="#about">
					<h2 id="about" className="text-foreground font-bold text-4xl">
						<span className="text-primary">#</span> About
					</h2>
				</Link>
			</div>
			<div className="grid grid-cols-12 gap-4">
				<Feature
					icon={<BsShieldFillCheck />}
					title="Trustless Competition"
					description="Our platform offers a robust, trust-minimized escrow solution.
							When conflicts or indecision arise, the Arena DAO can step in to
							ensure fair and transparent outcomes through decentralized
							governance."
				/>
				<Feature
					icon={<BsBuildingFill />}
					title="Infrastructure"
					description="We provide the infrastructure necessary for hosting different types of competitions like wagers, leagues, and eventually tournaments. These can happen in any type of token standard (cw20, cw721, or native)."
				/>
				<Feature
					icon={<BsLockFill />}
					title="Built-in Security"
					description="Unlike traditional competition services, the Arena DAO does not utilize a centralized credit-system with unknown security risks. We use smart contracts to efficiently move money while inheriting the network's security."
				/>
				<Feature
					icon={<BsLightningFill />}
					title="DAO as a Service"
					description="The Arena DAO is more than just a DAO. It's a a service. The community competes, and we mediate. With each competition, we earn a percentage of the distributed amount."
				/>
			</div>
			<div className="block text-start">
				<Link href="#initial_token_distribution">
					<h2
						id="initial_token_distribution"
						className="text-foreground font-bold text-4xl"
					>
						<span className="text-primary">#</span> Initial Token Distribution
					</h2>
				</Link>
			</div>
			<h4 className="text-xl font-bold">1B Supply</h4>
			<em>(tentative)</em>
			<Chart
				chartType="PieChart"
				className="text-foreground"
				data={[
					["Group", "Percentage"],
					["Liquidity Bootstrapping", 30],
					["Liquidity Incentives", 15],
					["Community Pool", 30],
					["Founder", 20],
					["x/drip (airdrop)", 5],
				]}
				options={{
					backgroundColor: "transparent",
					legend: {
						textStyle: { color: theme === "dark" ? "white" : "black" },
					},
				}}
				legendToggle
				width={"100%"}
				height={"400px"}
			/>
			<div className="block text-start">
				<Link href="#arena_core">
					<h2 id="arena_core" className="text-foreground font-bold text-4xl">
						<span className="text-primary">#</span> Arena Core
					</h2>
				</Link>
			</div>
			<div className="grid grid-cols-12 gap-4">
				<Feature
					icon={<BsChatFill />}
					title="Proposals"
					description="The Arena Core is a custom proposal module attached to the Arena DAO which will allow competitions to ask for mediation without requiring a stake in the DAO."
				/>
				<Feature
					icon={<BsCurrencyBitcoin />}
					title="Tax"
					description={`We also store relevant competition data here like the competition tax. The current rate is set to ${env.ARENA_TAX}%, and this is a field which can be adjusted through a governance proposal. Each processed competition will automatically send the tax to the DAO's treasury.`}
				/>

				<Feature
					icon={<BsBookFill />}
					title="Rulesets"
					description="To avoid constantly applying the same rules when creating competitions. The community can decide upon common sets of rules for a category to be available on competition creation."
				/>
				<Feature
					icon={<BsHddNetworkFill />}
					title="Competition Modules"
					description="Through competition modules, we are able to handle any type of programmable competition. Currently, the Arena DAO supports wagers and round-robin leagues."
				/>
			</div>
			<div className="block text-start">
				<Link href="#escrow">
					<h2 id="escrow" className="text-foreground font-bold text-4xl">
						<span className="text-primary">#</span> Escrows
					</h2>
				</Link>
			</div>
			<div className="grid grid-cols-12 gap-4">
				<Feature
					icon={<BsCalendarEventFill />}
					title="Event-Based"
					description="The escrow will automatically lock itself when all dues are received and send an activation message to its respective competition. Once the competition is processed, the funds will be available to be claimed by each user."
				/>
				<Feature
					icon={<BsPersonRolodex />}
					title="Preset Distribution"
					description="An escrow member can decide to automatically distribute its receiving shares according to a preset distribution. For a team, this can be useful to reduce friction in payouts."
				/>
			</div>
			<div className="block text-start">
				<Link href="#wagers">
					<h2 id="wagers" className="text-foreground font-bold text-4xl">
						<span className="text-primary">#</span> Wagers
					</h2>
				</Link>
			</div>
			<div className="grid grid-cols-12 gap-4">
				<Feature
					icon={<BsPeopleFill />}
					title="Custom Membership"
					description="The wager module allows users to create a wager with any amount of members. A member can be a sole user or a team defined on-chain as a DAO."
				/>
				<Feature
					icon={<BsCheck2All />}
					title="All or Nothing"
					description="Creating a wager will also create a new DAO consisting of each member of the competition. All members of this DAO must agree to the competition result, otherwise the wager will be jailed for the Arena DAO to process."
				/>
			</div>
			<div className="block text-start">
				<Link href="#leagues">
					<h2 id="leagues" className="text-foreground font-bold text-4xl">
						<span className="text-primary">#</span> Leagues
					</h2>
				</Link>
			</div>
			<div className="grid grid-cols-12 gap-4">
				<Feature
					icon={<BsClockFill />}
					title="Round-Robin Format"
					description="Leagues follow the round-robin format. Each member will play each other member once to build up their ranking."
				/>
				<Feature
					icon={<BsPersonFill />}
					title="Host"
					description="Unlike wagers, we cannot expect each member to vote for each match of the league. A league requires a host that is responsible for quickly deciding on match winners and processing the final result."
				/>
				<Feature
					icon={<BsTable />}
					title="Leaderboard"
					description="Each match within the league will build up the users' scores. After the last round is played, a decision can be voted on based off of the leaderboard standings."
				/>
			</div>
		</div>
	);
}
