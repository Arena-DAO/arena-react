import { z } from "zod";
import DecimalSchema from "./DecimalSchema";

const PercentageThresholdSchema = z.union([
	z.object({
		majority: z.object({}).strict(),
	}),
	z.object({
		percent: DecimalSchema,
	}),
]);

export default PercentageThresholdSchema;
