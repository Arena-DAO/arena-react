import { z } from "zod";
import DueSchema from "./DueSchema";
import ExpirationSchema from "./ExpirationSchema";
import RulesSchema from "./RulesSchema";
import RulesetsSchema from "./RulesetsSchema";

const CreateCompetitionSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  expiration: ExpirationSchema,
  name: z.string().min(1, { message: "Name is required " }),
  rules: RulesSchema,
  rulesets: RulesetsSchema,
  dues: z.array(DueSchema).nonempty({ message: "Dues cannot be empty" }),
  competition_dao_name: z
    .string()
    .min(1, { message: "Competition DAO name cannot be empty" }),
  competition_dao_description: z
    .string()
    .min(1, { message: "Competition DAO description cannot be empty" }),
});

export default CreateCompetitionSchema;
