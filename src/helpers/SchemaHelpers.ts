import { toDate } from "date-fns";
import type { z } from "zod";
import type { DistributionForString } from "~/codegen/ArenaCore.types";
import type { Expiration } from "~/codegen/ArenaWagerModule.types";
import type { DistributionSchema, ExpirationSchema } from "~/config/schemas";

export function convertToExpiration(
	expirationSchema: z.infer<typeof ExpirationSchema>,
): Expiration {
	if ("at_time" in expirationSchema) {
		return {
			at_time: (toDate(expirationSchema.at_time).getTime() * 1e6).toString(),
		};
	}
	return expirationSchema;
}

export function convertToDistribution(
	distributionSchema: z.infer<typeof DistributionSchema>,
): DistributionForString {
	return {
		member_percentages: distributionSchema.member_percentages.map(
			({ addr, percentage }) => {
				return { addr, percentage: percentage.toString() };
			},
		),
		remainder_addr: distributionSchema.remainder_addr,
	};
}
