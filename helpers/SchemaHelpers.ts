import { Expiration } from "@arena/ArenaWagerModule.types";
import DurationSchema from "@config/schemas/DurationSchema";
import ExpirationSchema from "@config/schemas/ExpirationSchema";
import RulesSchema from "@config/schemas/RulesSchema";
import RulesetsSchema from "@config/schemas/RulesetsSchema";
import Uint128Schema from "@config/schemas/Uint128Schema";
import { Duration } from "@dao/DaoProposalMultiple.types";
import { utcToZonedTime } from "date-fns-tz";
import { z } from "zod";

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

export function convertToExpiration(
  expirationSchema: z.infer<typeof ExpirationSchema>
): Expiration {
  switch (expirationSchema.expiration_units) {
    case "At Height":
      return { at_height: expirationSchema.height! };
    case "At Time":
      return {
        at_time: (
          utcToZonedTime(
            expirationSchema.time!,
            expirationSchema.timezone!
          ).getTime() * 1000000
        ) // Get time in ns
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

export function convertToRules(
  rulesSchema: z.infer<typeof RulesSchema>
): string[] {
  return rulesSchema.map((x) => x.rule);
}

export function convertToRulesets(
  rulesetsSchema: z.infer<typeof RulesetsSchema>
): string[] {
  return rulesetsSchema.map((x) => x.ruleset_id);
}
