import { z } from "zod";
import AddressSchema from "./AddressSchema";
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
	membersFromDues: z.boolean(),
	members: z.array(z.object({ address: AddressSchema })),
});

export default CreateCompetitionSchema;
