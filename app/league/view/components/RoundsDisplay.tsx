"use client";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	type CardProps,
} from "@nextui-org/react";
import { useState } from "react";
import type { CompetitionResponseForLeagueExt } from "~/codegen/ArenaLeagueModule.types";
import RoundDisplay from "./RoundDisplay";

interface RoundsDisplayProps extends CardProps {
	league: CompetitionResponseForLeagueExt;
	moduleAddr: string;
}

const RoundsDisplay = ({
	moduleAddr,
	league,
	...props
}: RoundsDisplayProps) => {
	const teams = Number(BigInt(league.extension.teams));
	const total_rounds = teams % 2 === 0 ? teams - 1 : teams;
	const [currentRound, setCurrentRound] = useState(
		Math.max(
			1,
			Math.ceil(
				Number(BigInt(league.extension.processed_matches)) /
					(Number(BigInt(league.extension.matches)) / total_rounds),
			),
		),
	);

	return (
		<Card {...props}>
			<CardBody className="space-y-4">
				<p>
					Round: {currentRound}/{total_rounds}
				</p>
				<RoundDisplay
					leagueId={league.id}
					roundNumber={currentRound.toString()}
					moduleAddr={moduleAddr}
					escrow={league.escrow}
				/>
			</CardBody>
			<CardFooter>
				{currentRound > 1 && (
					<Button onClick={() => setCurrentRound((x) => x - 1)}>
						Previous Round
					</Button>
				)}
				{currentRound < total_rounds && (
					<Button
						onClick={() => setCurrentRound((x) => x + 1)}
						className="ml-auto"
					>
						Next Round
					</Button>
				)}
			</CardFooter>
		</Card>
	);
};

export default RoundsDisplay;
