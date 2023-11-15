import { isBefore } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { z } from "zod";

const ExpirationSchema = z
  .object({
    time: z.string().optional(),
    timezone: z.string().optional(),
    height: z
      .number()
      .int({ message: "Height must be a whole number" })
      .positive({ message: "Height must be positive" })
      .optional(),
    expiration_units: z.enum(["At Time", "At Height", "Never"]),
  })
  .superRefine((value, context) => {
    if (value.expiration_units === "At Height" && !value.height) {
      context.addIssue({
        path: ["height"],
        code: z.ZodIssueCode.custom,
        message: "Height is required for expiration unit 'At Height'",
      });
    }

    if (value.expiration_units === "At Time") {
      if (!value.time) {
        context.addIssue({
          path: ["time"],
          code: z.ZodIssueCode.custom,
          message: "Time is required for expiration unit 'At Time'",
        });
      }

      if (!value.timezone) {
        context.addIssue({
          path: ["timezone"],
          code: z.ZodIssueCode.custom,
          message: "Timezone is required for expiration unit 'At Time'",
        });
      }

      if (value.time && value.timezone) {
        const providedTimeInZone = utcToZonedTime(value.time, value.timezone);
        const currentTimeInZone = utcToZonedTime(
          new Date(),
          Intl.DateTimeFormat().resolvedOptions().timeZone
        );

        // Check if the provided time is greater than the current time in the user's timezone
        if (isBefore(providedTimeInZone, currentTimeInZone)) {
          context.addIssue({
            path: ["time"],
            code: z.ZodIssueCode.custom,
            message: "Provided time must be greater than the current time",
          });
        }
      }
    }
  });

export default ExpirationSchema;

