import { ZodIssueCode, z } from "zod";
import DecimalSchema from "./DecimalSchema";

const PercentageListSchema = z
	.object({
		percent: DecimalSchema,
	})
	.array()
	.superRefine((val, ctx) => {
		if (val.length > 0) {
			const sum = val.reduce((acc, cur) => acc + cur.percent, 0);
			if (Math.abs(sum - 1) > 0.000001) {
				// Using a small epsilon for floating-point comparison
				ctx.addIssue({
					code: ZodIssueCode.custom,
					path: ["percentages"],
					message: "Sum of percentages must equal 1",
				});
			}
		}
	});

export default PercentageListSchema;
