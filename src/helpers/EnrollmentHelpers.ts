import type {
	Coin,
	CompetitionType,
} from "~/codegen/ArenaCompetitionEnrollment.types";

export const calculateCurrentPool = (
	entryFee: Coin,
	currentMembers: string,
): Coin => {
	const totalAmount = BigInt(entryFee.amount) * BigInt(currentMembers);
	return { amount: totalAmount.toString(), denom: entryFee.denom };
};

export const calculateMinMembers = (type: CompetitionType): number => {
	if ("wager" in type) return 2;
	if ("league" in type) return Math.max(type.league.distribution.length, 3);
	if ("tournament" in type) {
		const eliminationType = type.tournament.elimination_type;
		return "double_elimination" === eliminationType
			? Math.max(3, type.tournament.distribution.length)
			: Math.max(4, type.tournament.distribution.length);
	}
	return 2;
};
