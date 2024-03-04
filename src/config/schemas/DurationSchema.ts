import { z } from "zod";
import TimestampSchema from "./TimestampSchema";

const DurationSchema = z.union([
	z.object({
		height: z.number().nonnegative(),
	}),
	z.object({
		ime: TimestampSchema,
	}),
]);

export default DurationSchema;
