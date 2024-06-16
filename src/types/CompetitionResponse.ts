import type { CompetitionResponseForWagerExt } from "~/codegen/ArenaWagerModule.types";

export type CompetitionResponse = Omit<
	CompetitionResponseForWagerExt,
	"extension"
>;
