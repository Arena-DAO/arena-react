import { z } from "zod";

const DecimalSchema = z
	.number()
	.gt(0, { message: "Percentage must be greater than 0" })
	.max(100, { message: "Percentage cannot exceed 100" })
	.transform((x) => x / 100);

export default DecimalSchema;
