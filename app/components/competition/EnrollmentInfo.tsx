import TokenInfo from "@/components/TokenInfo";
import { Slider, Tooltip } from "@heroui/react";
import { Users } from "lucide-react";
import type React from "react";
import type { EnrollmentEntryResponse } from "~/codegen/ArenaCompetitionEnrollment.types";
import { calculateMinMembers } from "~/helpers/EnrollmentHelpers";
import EnrollmentStatusDisplay from "./EnrollmentStatusDisplay";

interface EnrollmentInfoProps {
	enrollment: EnrollmentEntryResponse;
	isExpired: boolean;
}

const EnrollmentInfo: React.FC<EnrollmentInfoProps> = ({
	enrollment,
	isExpired,
}) => {
	const currentMembers = Number(enrollment.current_members);
	const maxMembers = Number(enrollment.max_members);
	const minMembers = enrollment.min_members
		? Number(enrollment.min_members)
		: calculateMinMembers(enrollment.competition_type);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex min-h-12 items-center justify-between">
				<div className="flex items-center">
					<span className="mr-1 font-semibold text-sm">Entry:</span>
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
				<EnrollmentStatusDisplay
					hasFinalized={enrollment.has_finalized}
					isExpired={isExpired}
					currentMembers={Number(enrollment.current_members)}
					maxMembers={Number(enrollment.max_members)}
					competitionId={enrollment.competition_info.competition_id}
					className="ml-auto"
				/>
			</div>

			<div>
				<Slider
					label="Enrollment Progress"
					step={1}
					maxValue={maxMembers}
					minValue={0}
					value={currentMembers}
					color="primary"
					showTooltip={true}
					startContent={<Users />}
					endContent={<Users />}
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
				<div className="mt-2 flex justify-between text-sm">
					<Tooltip content="Minimum required members">
						<span className="flex items-center">
							<Users className="mr-1" /> Min: {minMembers}
						</span>
					</Tooltip>
					<span>Current: {currentMembers}</span>
					<Tooltip content="Maximum allowed members">
						<span className="flex items-center">
							<Users className="mr-1" /> Max: {maxMembers}
						</span>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};

export default EnrollmentInfo;
