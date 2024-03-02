import { z } from "zod";

const RulesSchema = z
	.object({
		rule: z.string().min(1, { message: "Rule cannot be empty" }),
	})
	.array();

export default RulesSchema;
