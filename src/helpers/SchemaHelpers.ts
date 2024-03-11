import { toDate } from "date-fns";
import type { z } from "zod";
import type { Expiration } from "~/codegen/ArenaWagerModule.types";
import type { ExpirationSchema } from "~/config/schemas";

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
