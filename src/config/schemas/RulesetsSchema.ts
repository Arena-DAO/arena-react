import { z } from "zod";

const RulesetsSchema = z
	.object({
		ruleset_id: z.string().min(1, { message: "Id cannot be empty" }),
	})
	.array();

export default RulesetsSchema;
