import { toBinary } from "@cosmjs/cosmwasm-stargate";
import { parseISO } from "date-fns";
import type { z } from "zod";
import type { DistributionForString } from "~/codegen/ArenaCore.types";
import type { InstantiateMsg as ArenaEscrowInstantiateMsg } from "~/codegen/ArenaEscrow.types";
import type {
	EscrowInstantiateInfo,
	Expiration,
} from "~/codegen/ArenaWagerModule.types";
import type { Duration } from "~/codegen/DaoDaoCore.types";
import type {
	DistributionSchema,
	DueSchema,
	DurationSchema,
	ExpirationSchema,
	MemberPercentageSchema,
} from "~/config/schemas";

const DurationUnitsToSeconds = {
	seconds: 1,
	minutes: 60,
	hours: 3600,
	days: 86400,
	weeks: 604800,
};

export function convertToExpiration(
	expirationSchema: z.infer<typeof ExpirationSchema>,
): Expiration {
	if ("at_time" in expirationSchema) {
		return {
			at_time: (parseISO(expirationSchema.at_time).getTime() * 1e6).toString(),
		};
	}
	return expirationSchema;
}

export function convertToDistribution(
	distributionSchema: z.infer<typeof DistributionSchema>,
): DistributionForString | undefined {
	if (
		!distributionSchema ||
		distributionSchema.member_percentages.length === 0
	) {
		return undefined;
	}
	return {
		member_percentages: distributionSchema.member_percentages.map(
			({ addr, percentage }) => {
				return { addr, percentage: percentage.toString() };
			},
		),
		// biome-ignore lint/style/noNonNullAssertion: This is handled by the distributionSchema superRefine check
		remainder_addr: distributionSchema.remainder_addr!,
	};
}

export function convertToDuration(
	durationSchema: z.infer<typeof DurationSchema>,
): Duration {
	if (durationSchema.units === "blocks") {
		return { height: durationSchema.amount };
	}
	return {
		time: DurationUnitsToSeconds[durationSchema.units] * durationSchema.amount,
	};
}

export function convertToEscrowInstantiate(
	escrowCodeId: number,
	dues: z.infer<typeof DueSchema>[],
	additionalLayeredFees?: z.infer<typeof MemberPercentageSchema>[],
): EscrowInstantiateInfo {
	return {
		code_id: escrowCodeId,
		label: "Arena Escrow",
		msg: toBinary({
			dues: dues.map(({ addr, balance }) => {
				return {
					addr,
					balance: {
						native: balance.native?.map(({ denom, amount }) => ({
							denom,
							amount: amount.toString(),
						})),
						cw20: balance.cw20?.map(({ address, amount }) => ({
							address,
							amount: amount.toString(),
						})),
						cw721: balance.cw721,
					},
				};
			}),
		} as ArenaEscrowInstantiateMsg),
		additional_layered_fees: additionalLayeredFees?.length
			? additionalLayeredFees.map((fee) => ({
					receiver: fee.addr,
					tax: fee.percentage.toString(),
				}))
			: undefined,
	};
}
