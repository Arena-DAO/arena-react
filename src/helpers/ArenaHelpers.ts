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
	pending: "secondary",
	active: "success",
	inactive: "default",
	jailed: "danger",
};
