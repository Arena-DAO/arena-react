import { z } from "zod";

export const DurationUnits = [
	"seconds",
	"minutes",
	"hours",
	"days",
	"weeks",
	"blocks",
] as const;

const DurationSchema = z.object({
	units: z.enum(DurationUnits),
	amount: z.number().positive(),
});

export default DurationSchema;
