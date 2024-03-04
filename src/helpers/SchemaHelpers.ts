import { z } from "zod";
import { Duration } from "~/codegen/DaoDaoCore.types";
import DurationSchema from "~/config/schemas/DurationSchema";

export function convertToDuration(
	durationSchema: z.infer<typeof DurationSchema>,
): Duration {
	switch (durationSchema.duration_units) {
		case "Height":
			return { height: durationSchema.duration || 0 };
		case "Time":
			return { time: durationSchema.duration || 0 };
	}
}
