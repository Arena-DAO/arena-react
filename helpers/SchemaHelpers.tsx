import { Expiration } from "@arena/ArenaWagerModule.types";
import { Duration } from "@dao/DaoProposalMultiple.types";
import { bech32 } from "bech32";
import { isBefore } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { z } from "zod";

function isValidBech32(value: string) {
  try {
    const decoded = bech32.decode(value);
    return decoded.prefix !== "" && decoded.words.length > 0;
  } catch (error) {
    return false;
  }
}

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

export const AddressSchema = (bech32_prefix: string) => {
  return z
    .string()
    .nonempty("Address is required")
    .startsWith(bech32_prefix, {
      message: `Address must start with the ${bech32_prefix} prefix`,
    })
    .refine((value) => isValidBech32(value), {
      message: "Invalid Bech32 address",
    });
};

export const ExpirationSchema = z
  .object({
    time: z.string().optional(),
    timezone: z.string().optional(),
    height: z.number().positive().optional(),
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
      address: z.string().nonempty(),
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

export const DueSchema = (bech32_prefix: string) => {
  return z
    .object({
      address: AddressSchema(bech32_prefix),
      balance: BalanceSchema,
    })
    .superRefine((value, context) => {
      if (
        value.balance.cw20.length == 0 &&
        value.balance.cw721.length == 0 &&
        value.balance.native.length == 0
      ) {
        context.addIssue({
          path: ["balance"],
          code: z.ZodIssueCode.custom,
          message: "Due balance cannot be empty",
        });
      }
    });
};
