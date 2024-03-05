import { isValid, toDate } from "date-fns";
import { z } from "zod";

const TimestampSchema = z
	.string()
	.refine((x) => isValid(toDate(x)), "Invalid timestamp");

export default TimestampSchema;
