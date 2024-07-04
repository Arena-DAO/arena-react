import TokenInfo from "@/components/TokenInfo";
import { Slider } from "@nextui-org/react";
import type React from "react";
import { useMemo } from "react";
import { FiUsers } from "react-icons/fi";
import type { EnrollmentEntryResponse } from "~/codegen/ArenaCompetitionEnrollment.types";
import {
	calculateCurrentPool,
	calculateMinMembers,
} from "~/helpers/EnrollmentHelpers";

interface EnrollmentInfoProps {
	enrollment: EnrollmentEntryResponse;
}

const EnrollmentInfo: React.FC<EnrollmentInfoProps> = ({ enrollment }) => {
	const currentMembers = Number(enrollment.current_members);
	const maxMembers = Number(enrollment.max_members);
	const minMembers = enrollment.min_members
		? Number(enrollment.min_members)
		: calculateMinMembers(enrollment.competition_type);
	const currentPool = useMemo(
		() =>
			enrollment.entry_fee
				? calculateCurrentPool(enrollment.entry_fee, enrollment.current_members)
				: null,
		[enrollment.entry_fee, enrollment.current_members],
	);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex min-h-12 items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-sm">Entry:</span>
					{enrollment.entry_fee ? (
						<TokenInfo
							isNative
							denomOrAddress={enrollment.entry_fee.denom}
							amount={BigInt(enrollment.entry_fee.amount)}
						/>
					) : (
						<span className="text-sm">Free</span>
					)}
				</div>
				{currentPool && (
					<div className="flex items-center gap-2">
						<span className="font-semibold text-sm">Pool:</span>
						<TokenInfo
							isNative
							denomOrAddress={currentPool.denom}
							amount={BigInt(currentPool.amount)}
						/>
					</div>
				)}
			</div>

			<Slider
				label="Enrollment Progress"
				step={1}
				maxValue={maxMembers}
				minValue={0}
				value={currentMembers}
				color="primary"
				showTooltip={true}
				startContent={<FiUsers />}
				endContent={<FiUsers />}
				isDisabled
				marks={[
					{
						value: minMembers,
						label: "Min",
					},
					{
						value: maxMembers,
						label: "Max",
					},
				]}
			/>
		</div>
	);
};

export default EnrollmentInfo;
