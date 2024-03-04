import { z } from "zod";

const RulesetsSchema = z
	.object({
		ruleset_id: z.bigint().nonnegative(),
	})
	.array();

export default RulesetsSchema;
