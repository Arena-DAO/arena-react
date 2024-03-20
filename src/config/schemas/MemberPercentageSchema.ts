import { z } from "zod";
import AddressSchema from "./AddressSchema";
import DecimalSchema from "./DecimalSchema";

const MemberPercentageSchema = z.object({
	addr: AddressSchema,
	percentage: DecimalSchema,
});

export default MemberPercentageSchema;
