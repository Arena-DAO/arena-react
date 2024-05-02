"use client";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	type CardProps,
} from "@nextui-org/react";
import { type Dispatch, type SetStateAction, useState } from "react";
import type { CompetitionResponseForCompetitionExt } from "~/codegen/ArenaLeagueModule.types";
import type { WithClient } from "~/types/util";
import RoundDisplay from "./RoundDisplay";

interface RoundsDisplayProps extends CardProps {
	league: CompetitionResponseForCompetitionExt;
	moduleAddr: string;
	version: number;
	setVersion: Dispatch<SetStateAction<number>>;
}

const RoundsDisplay = ({
	cosmWasmClient,
	moduleAddr,
	league,
	version,
	setVersion,
	...props
}: WithClient<RoundsDisplayProps>) => {
	const teams = Number(BigInt(league.extension.teams));
	const total_rounds = teams % 2 === 0 ? teams - 1 : teams;
	const [currentRound, setCurrentRound] = useState(
		Math.ceil(
			Number(BigInt(league.extension.processed_matches)) /
				Number(BigInt(league.extension.matches)) /
				total_rounds,
		) + 1,
	);

	return (
		<Card {...props}>
			<CardHeader>Rounds</CardHeader>
			<CardBody className="space-y-4">
				<p>
					Round: {currentRound}/{total_rounds}
				</p>
				<RoundDisplay
					cosmWasmClient={cosmWasmClient}
					league_id={league.id}
					round_number={currentRound.toString()}
					moduleAddr={moduleAddr}
					version={version}
					setVersion={setVersion}
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
