import { z } from "zod";

const PercentageThresholdSchema = z
	.object({
		percentage_threshold: z.enum(["Majority", "Percent"]),
		percent: z.number().int().positive().max(100).optional(),
	})
	.refine(
		(context) => {
			return context.percentage_threshold === "Percent"
				? !!context.percent
				: true;
		},
		{
			message:
				'Percent is required when percentage threshold is set to "Percent"',
		},
	);

export default PercentageThresholdSchema;
