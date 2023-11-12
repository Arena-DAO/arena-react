import { z } from "zod";

const RulesetsSchema = z
  .object({
    ruleset_id: z.string().nonempty({ message: "Id cannot be empty" }),
  })
  .array();

export default RulesetsSchema;
