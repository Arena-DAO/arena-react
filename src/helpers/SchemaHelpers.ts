import { toDate } from "date-fns";
import { z } from "zod";
import { Expiration } from "~/codegen/ArenaWagerModule.types";
import { ExpirationSchema } from "~/config/schemas";

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
