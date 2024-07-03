import Profile from "@/components/Profile";
import TokenInfo from "@/components/TokenInfo";
import { Card, CardBody, Chip, Image, Slider } from "@nextui-org/react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useMemo } from "react";
import { FiClock, FiUsers } from "react-icons/fi";
import type { EnrollmentEntryResponse } from "~/codegen/ArenaCompetitionEnrollment.types";
import {
	calculateCurrentPool,
	calculateMinMembers,
	formatExpiration,
	getCompetitionTypeDisplay,
} from "~/helpers/EnrollmentHelpers";

interface EnrollmentCardProps {
	enrollment: EnrollmentEntryResponse;
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ enrollment }) => {
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
	const router = useRouter();

	return (
		<Card
			isPressable
			onPress={() =>
				router.push(`/enrollment/view?enrollmentId=${enrollment.id}`)
			}
			className="w-full"
		>
			{enrollment.competition_info.banner && (
				<Image
					as={NextImage}
					src={enrollment.competition_info.banner}
					alt={enrollment.competition_info.name}
					height="180"
					width="320"
					className="z-0 h-full w-full object-cover"
				/>
			)}
			<CardBody className="p-3">
				<div className="mt-auto mb-2 flex items-center justify-between">
					<h2 className="truncate font-bold text-lg">
						{enrollment.competition_info.name}
					</h2>
					<Chip color="warning" variant="flat" size="sm">
						{getCompetitionTypeDisplay(enrollment.competition_type)}
					</Chip>
				</div>

				<div className="mb-3">
					<Profile address={enrollment.host} />
				</div>

				<div className="mb-3 flex items-center justify-between text-sm">
					Expires
					<div className="flex items-center">
						<FiClock className="mr-2" />
						{formatExpiration(enrollment.expiration)}
					</div>
				</div>

				<div className="mb-3 flex min-h-12 items-center justify-between">
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

				<div className="mb-2">
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
			</CardBody>
		</Card>
	);
};

export default EnrollmentCard;
