import { z } from "zod";
import TimestampSchema from "./TimestampSchema";

const ExpirationSchema = z.union([
	z.object({
		at_height: z.coerce.number().positive().int(),
	}),
	z.object({
		at_time: TimestampSchema,
	}),
	z.object({
		never: z.object({}),
	}),
]);

export default ExpirationSchema;
