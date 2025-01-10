import { toBinary } from "@cosmjs/cosmwasm-stargate";
import type { z } from "zod";
import type { DistributionForString } from "~/codegen/ArenaCore.types";
import type { InstantiateMsg as ArenaEscrowInstantiateMsg } from "~/codegen/ArenaEscrow.types";
import type { EscrowContractInfo } from "~/codegen/ArenaWagerModule.types";
import type {
	DistributionSchema,
	DueSchema,
	MemberPercentageSchema,
} from "~/config/schemas";

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

export function convertToEscrowInstantiate(
	escrowCodeId: number,
	dues: z.infer<typeof DueSchema>[],
	additionalLayeredFees?: z.infer<typeof MemberPercentageSchema>[],
	is_enrollment?: boolean,
): EscrowContractInfo {
	return {
		new: {
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
				is_enrollment: is_enrollment ?? false,
			} as ArenaEscrowInstantiateMsg),
			additional_layered_fees: additionalLayeredFees?.length
				? additionalLayeredFees.map((fee) => ({
						receiver: fee.addr,
						tax: fee.percentage.toString(),
					}))
				: undefined,
		},
	};
}
