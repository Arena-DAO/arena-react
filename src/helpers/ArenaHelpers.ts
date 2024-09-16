import type { ApplicationStatus } from "~/codegen/ArenaTokenGateway.types";
import type {
	CompetitionStatus,
	StatValue,
} from "~/codegen/ArenaWagerModule.types";

type Colors =
	| "default"
	| "primary"
	| "secondary"
	| "success"
	| "warning"
	| "danger"
	| undefined;

export const getStatusColor = (status: CompetitionStatus): Colors => {
	if (status === "pending") {
		return "warning";
	}
	if (status === "inactive") {
		return "default";
	}
	if (isActive(status)) {
		return "success";
	}
	if (isJailed(status)) {
		return "danger";
	}

	// Default case if somehow an unsupported status is provided
	return "default";
};

export const LeagueResultValues = [
	{ value: "team1", display: "Team 1" },
	{ value: "team2", display: "Team 2" },
	{ value: "draw", display: "Draw" },
] as const;

export function isJailed(status: CompetitionStatus): boolean {
	if (typeof status === "object" && "jailed" in status) {
		return true;
	}
	return false;
}

export function isActive(status: CompetitionStatus): boolean {
	if (typeof status === "object" && "active" in status) {
		return true;
	}
	return false;
}

export function getStatusName(status: CompetitionStatus): string {
	if (status === "pending" || status === "inactive") {
		return status;
	}
	if ("active" in status) {
		return "active";
	}
	if ("jailed" in status) {
		return "jailed";
	}

	throw new Error("Unknown status");
}

export function getApplicationStatusName(status: ApplicationStatus): string {
	if ("pending" in status) return "Pending";
	if ("accepted" in status) return "Accepted";
	if ("rejected" in status) return "Rejected";

	throw new Error("Unknown status");
}

export const percentFormatter = new Intl.NumberFormat("en-US", {
	style: "percent",
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
});

export const renderStatValue = (value: StatValue) => {
	if ("bool" in value) return value.bool.toString();
	if ("decimal" in value) return percentFormatter.format(Number(value.decimal));
	if ("uint" in value) return value.uint;
	return "N/A";
};
