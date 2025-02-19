import { z } from "zod";
import Uint128Schema from "./AmountSchema";
import PercentageThresholdSchema from "./PercentageThresholdSchema";

export const ThresholdSchema = z.union([
	z.object({
		threshold_quorum: z.object({
			threshold: PercentageThresholdSchema,
			quorum: PercentageThresholdSchema,
		}),
	}),
	z.object({
		absolute_count: z.object({
			threshold: Uint128Schema,
		}),
	}),
	z.object({
		absolute_percentage: z.object({
			percentage: PercentageThresholdSchema,
		}),
	}),
]);
