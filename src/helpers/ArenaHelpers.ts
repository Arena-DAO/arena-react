import type { CompetitionStatus } from "~/codegen/ArenaWagerModule.types";

type Colors =
	| "default"
	| "primary"
	| "secondary"
	| "success"
	| "warning"
	| "danger"
	| undefined;

export const statusColors: { [key in CompetitionStatus]: Colors } = {
	pending: "warning",
	active: "success",
	inactive: "default",
	jailed: "danger",
};

export const LeagueResultValues = [
	{ value: "team1", display: "Team 1" },
	{ value: "team2", display: "Team 2" },
	{ value: "draw", display: "Draw" },
] as const;
