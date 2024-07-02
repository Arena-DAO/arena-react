import Profile from "@/components/Profile";
import {
	Card,
	CardBody,
	Chip,
	Image,
	Slider,
	Tooltip,
} from "@nextui-org/react";
import NextImage from "next/image";
import type React from "react";
import { useMemo } from "react";
import { FiClock, FiDollarSign, FiUsers } from "react-icons/fi";
import type {
	Coin,
	CompetitionType,
	EnrollmentEntryResponse,
	Expiration,
} from "~/codegen/ArenaCompetitionEnrollment.types";

interface EnrollmentCardProps {
	enrollment: EnrollmentEntryResponse;
}

const getCompetitionTypeDisplay = (type: CompetitionType): string => {
	if ("wager" in type) return "Wager";
	if ("league" in type) return "League";
	if ("tournament" in type) return "Tournament";
	return "Unknown";
};

const formatExpiration = (expiration: Expiration): string => {
	if ("at_height" in expiration) return `At height: ${expiration.at_height}`;
	if ("at_time" in expiration) {
		const date = new Date(Number.parseInt(expiration.at_time) / 1000000);
		return date.toLocaleString();
	}
	return "Never";
};

const calculateCurrentPool = (
	entryFee: Coin,
	currentMembers: string,
): string => {
	const totalAmount = BigInt(entryFee.amount) * BigInt(currentMembers);
	return `${totalAmount.toString()} ${entryFee.denom}`;
};

const calculateMinMembers = (type: CompetitionType): number => {
	if ("wager" in type) return 2;
	if ("league" in type) return Math.max(type.league.distribution.length, 2);
	if ("tournament" in type) {
		const eliminationType = type.tournament.elimination_type;
		return "double_elimination" === eliminationType
			? Math.max(3, type.tournament.distribution.length)
			: Math.max(4, type.tournament.distribution.length);
	}
	return 2;
};

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ enrollment }) => {
	const currentMembers = Number(enrollment.current_members);
	const maxMembers = Number(enrollment.max_members);
	const minMembers = calculateMinMembers(enrollment.competition_type);
	const currentPool = useMemo(
		() =>
			enrollment.entry_fee
				? calculateCurrentPool(enrollment.entry_fee, enrollment.current_members)
				: null,
		[enrollment.entry_fee, enrollment.current_members],
	);

	return (
		<Card isPressable>
			{enrollment.competition_info.banner && (
				<Image
					as={NextImage}
					src={enrollment.competition_info.banner}
					alt={enrollment.competition_info.name}
					height="180"
					width="320"
					className="object-cover"
				/>
			)}
			<CardBody className="p-3">
				<div className="mb-2 flex items-center justify-between">
					<h2 className="font-bold text-lg">
						{enrollment.competition_info.name}
					</h2>
					<Chip color="warning" variant="flat" size="sm">
						{getCompetitionTypeDisplay(enrollment.competition_type)}
					</Chip>
				</div>

				<div className="mb-3">
					<Profile address={enrollment.host} />
				</div>

				<div className="mb-3 flex items-center text-default-500">
					<FiClock className="mr-2" />
					<span className="text-sm">
						Expires {formatExpiration(enrollment.expiration)}
					</span>
				</div>

				<div className="mb-3 flex items-center justify-between">
					<Tooltip content="Entry Fee">
						<div className="flex items-center">
							<FiDollarSign className="mr-1" />
							<span>
								{enrollment.entry_fee
									? `${enrollment.entry_fee.amount} ${enrollment.entry_fee.denom}`
									: "Free"}
							</span>
						</div>
					</Tooltip>
					{currentPool && (
						<Tooltip content={`Current Pool: ${currentPool}`}>
							<div className="mb-2 flex items-center">
								<FiDollarSign className="mr-1" />
								<span className="font-semibold text-sm">{currentPool}</span>
							</div>
						</Tooltip>
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
