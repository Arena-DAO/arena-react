import { z } from "zod";

const DecimalSchema = z.coerce
	.number()
	.int()
	.gt(0, { message: "Percentage must be greater than 0" })
	.max(100, { message: "Percentage cannot exceed 100" })
	.positive()
	.transform((x) => (x / 100).toString());

export default DecimalSchema;
