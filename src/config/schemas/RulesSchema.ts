import { z } from "zod";

const RulesSchema = z
	.object({
		rule: z.string().min(1, { message: "Rule is required" }),
	})
	.array();

export default RulesSchema;
