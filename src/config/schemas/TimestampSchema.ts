import { z } from "zod";

const TimestampSchema = z.string().datetime();

export default TimestampSchema;
