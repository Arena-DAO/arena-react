import { CompetitionStatus } from "~/codegen/ArenaWagerModule.types";

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
