import type {
	Coin,
	CompetitionType,
	Expiration,
} from "~/codegen/ArenaCompetitionEnrollment.types";

export const getCompetitionTypeDisplay = (type: CompetitionType): string => {
	if ("wager" in type) return "Wager";
	if ("league" in type) return "League";
	if ("tournament" in type) return "Tournament";
	return "Unknown";
};

export const formatExpiration = (expiration: Expiration): string => {
	if ("at_height" in expiration) return `At height: ${expiration.at_height}`;
	if ("at_time" in expiration) {
		const date = new Date(Number.parseInt(expiration.at_time) / 1000000);
		return date.toLocaleString();
	}
	return "Never";
};

export const calculateCurrentPool = (
	entryFee: Coin,
	currentMembers: string,
): string => {
	const totalAmount = BigInt(entryFee.amount) * BigInt(currentMembers);
	return `${totalAmount.toString()} ${entryFee.denom}`;
};

export const calculateMinMembers = (type: CompetitionType): number => {
	if ("wager" in type) return 2;
	if ("league" in type) return Math.max(type.league.distribution.length, 2);
	if ("tournament" in type) {
		const eliminationType = type.tournament.elimination_type;
		return "double_elimination" === eliminationType
			? Math.max(3, type.tournament.distribution.length)
			: Math.max(4, type.tournament.distribution.length);
	}
	return 2;
};
