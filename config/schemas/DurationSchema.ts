import { z } from "zod";

const DurationSchema = z.object({
  duration: z
    .number({
      invalid_type_error: "Duration must be a number",
    })
    .int({ message: "Duration must be a whole number" })
    .positive()
    .optional(),
  duration_units: z.enum(["Time", "Height"]),
});

export default DurationSchema;
