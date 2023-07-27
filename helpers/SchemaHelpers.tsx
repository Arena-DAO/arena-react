import { z } from "zod";

export const DurationSchema = z.object({
  duration: z
    .number({
      invalid_type_error: "Duration must be a number",
    })
    .positive(),
  duration_units: z.enum(["Time", "Height"]),
});

export const PercentageThresholdSchema = z
  .object({
    percentage_threshold: z.enum(["Majority", "Percent"]),
    percent: z.number().positive().max(100).optional(),
  })
  .refine(
    (context) => {
      return context.percentage_threshold === "Percent"
        ? !!context.percent
        : true;
    },
    {
      message:
        'Percent is required when percentage threshold is set to "Percent"',
    }
  );

export const DAOAddressSchema = (bech32_prefix: string) => {
  return z
    .string()
    .nonempty("DAO address is required")
    .length(63, {
      message: "DAO address must be exactly 63 characters long",
    })
    .refine(
      (value: string) => value.startsWith(bech32_prefix),
      `DAO address must start with the ${bech32_prefix} prefix`
    );
};

export const ExpirationSchema = z
  .object({
    time: z.date(),
    height: z.number().positive(),
    expiration_units: z.enum(["At Time", "At Height", "Never"]),
  })
  .refine(
    (context) => {
      return (
        (context.expiration_units === "At Height" && !!context.height) ||
        (context.expiration_units === "At Time" && !!context.time) ||
        context.expiration_units === "Never"
      );
    },
    {
      message: "A validation expiration value is required.",
    }
  );
