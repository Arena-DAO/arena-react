import { z } from "zod";
import AddressSchema from "./AddressSchema";

const MemberSchema = z.object({
	addr: AddressSchema,
});

export default MemberSchema;
