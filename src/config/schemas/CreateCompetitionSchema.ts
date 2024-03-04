import { z } from "zod";
import DueSchema from "./DueSchema";
import ExpirationSchema from "./ExpirationSchema";
import RulesSchema from "./RulesSchema";
import RulesetsSchema from "./RulesetsSchema";

const CreateCompetitionSchema = z.object({
	category_id: z.bigint().nonnegative().optional(),
	description: z.string().min(1, { message: "Description is required" }),
	expiration: ExpirationSchema,
	name: z.string().min(1, { message: "Name is required " }),
	rules: RulesSchema,
	rulesets: RulesetsSchema,
	dues: z.array(DueSchema),
	competition_dao_name: z
		.string()
		.min(1, { message: "Competition DAO name is required" }),
	competition_dao_description: z
		.string()
		.min(1, { message: "Competition DAO description is required" }),
});

export default CreateCompetitionSchema;
