import { z } from "zod";
import TimestampSchema from "./TimestampSchema";

const ExpirationSchema = z.union([
	z.object({
		at_height: z.coerce.number().nonnegative(),
	}),
	z.object({
		at_time: TimestampSchema,
	}),
	z.object({
		never: z.object({}),
	}),
]);

export default ExpirationSchema;
