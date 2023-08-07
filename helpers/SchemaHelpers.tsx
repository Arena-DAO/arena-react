import { Expiration } from "@arena/ArenaWagerModule.types";
import { Duration } from "@dao/DaoProposalMultiple.types";
import { isBefore } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { z } from "zod";

export const DurationSchema = z.object({
  duration: z
    .number({
      invalid_type_error: "Duration must be a number",
    })
    .positive()
    .optional(),
  duration_units: z.enum(["Time", "Height"]),
});

export const Uint128Schema = z.number().positive();

export function convertToUint128(
  uint128Schema: z.infer<typeof Uint128Schema>,
  decimals: number
): string {
  // Convert to BigInt with appropriate scaling for decimals
  const scaleFactor = BigInt(10 ** decimals);
  const bigNum = BigInt(uint128Schema) * scaleFactor;

  // Convert to string
  return bigNum.toString();
}

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
    time: z.string().optional(),
    timezone: z.string().optional(),
    height: z.number().positive().optional(),
    expiration_units: z.enum(["At Time", "At Height", "Never"]),
  })
  .superRefine((context, ctx) => {
    if (context.expiration_units === "At Height" && !context.height) {
      ctx.addIssue({
        path: ["height"],
        code: z.ZodIssueCode.custom,
        message: "Height is required for expiration unit 'At Height'",
      });
    }

    if (context.expiration_units === "At Time") {
      if (!context.time) {
        ctx.addIssue({
          path: ["time"],
          code: z.ZodIssueCode.custom,
          message: "Time is required for expiration unit 'At Time'",
        });
      }

      if (!context.timezone) {
        ctx.addIssue({
          path: ["timezone"],
          code: z.ZodIssueCode.custom,
          message: "Timezone is required for expiration unit 'At Time'",
        });
      }

      if (context.time && context.timezone) {
        const providedTimeInZone = utcToZonedTime(
          context.time,
          context.timezone
        );
        const currentTimeInZone = utcToZonedTime(
          new Date(),
          Intl.DateTimeFormat().resolvedOptions().timeZone
        );

        // Check if the provided time is greater than the current time in the user's timezone
        if (isBefore(providedTimeInZone, currentTimeInZone)) {
          ctx.addIssue({
            path: ["time"],
            code: z.ZodIssueCode.custom,
            message: "Provided time must be greater than the current time",
          });
        }
      }
    }
  });

export function convertToExpiration(
  expirationSchema: z.infer<typeof ExpirationSchema>
): Expiration {
  switch (expirationSchema.expiration_units) {
    case "At Height":
      return { at_height: expirationSchema.height! };
    case "At Time":
      return {
        at_time: utcToZonedTime(
          expirationSchema.time!,
          expirationSchema.timezone!
        )
          .getTime()
          .toString(),
      };
    case "Never":
      return { never: {} };
    default:
      throw new Error(
        `Unknown expiration units: ${expirationSchema.expiration_units}`
      );
  }
}

export function convertToDuration(
  durationSchema: z.infer<typeof DurationSchema>
): Duration {
  switch (durationSchema.duration_units) {
    case "Height":
      return { height: durationSchema.duration || 0 };
    case "Time":
      return { time: durationSchema.duration || 0 };
  }
}

export const BalanceSchema = z.object({
  cw20: z.array(
    z.object({
      address: z.string().nonempty(),
      amount: z.number().positive(),
    })
  ),
  cw721: z.array(
    z.object({
      addr: z.string().nonempty(),
      token_ids: z.array(z.string().nonempty()).min(1),
    })
  ),
  native: z.array(
    z.object({
      amount: z.number().positive(),
      denom: z.string().nonempty(),
    })
  ),
});

export const DueSchema = z.object({
  addr: z.string().nonempty(),
  balance: BalanceSchema,
});
