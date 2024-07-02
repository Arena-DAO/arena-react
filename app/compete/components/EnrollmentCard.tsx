import {
	Button,
	Card,
	CardBody,
	CardFooter,
	Chip,
	Image,
	Slider,
	Tooltip,
} from "@nextui-org/react";
import type React from "react";
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
	entryFee: Coin | null | undefined,
	currentMembers: string,
): string => {
	if (!entryFee) return "N/A";
	const totalAmount = BigInt(entryFee.amount) * BigInt(currentMembers);
	return `${totalAmount.toString()} ${entryFee.denom}`;
};

const calculateMinMembers = (type: CompetitionType): number => {
	if ("wager" in type) {
		return 2;
	}
	if ("league" in type) {
		return Math.max(type.league.distribution.length, 2);
	}
	if ("tournament" in type) {
		const eliminationType = type.tournament.elimination_type;
		if ("double_elimination" === eliminationType) {
			return Math.max(3, type.tournament.distribution.length);
		}
		return Math.max(4, type.tournament.distribution.length);
	}
	return 2; // Default minimum if type is unknown
};

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ enrollment }) => {
	const currentMembers = Number(enrollment.current_members);
	const maxMembers = Number(enrollment.max_members);
	const minMembers = calculateMinMembers(enrollment.competition_type);

	const currentPool = calculateCurrentPool(
		enrollment.entry_fee,
		enrollment.current_members,
	);

	const sliderMarks = [
		{
			value: minMembers,
			label: "Min",
		},
		{
			value: maxMembers,
			label: "Max",
		},
	];

	return (
		<Card className="w-full">
			{enrollment.competition_info.banner && (
				<Image
					src={enrollment.competition_info.banner}
					alt={enrollment.competition_info.name}
					className="h-48 w-full object-cover"
				/>
			)}
			<CardBody className="overflow-visible py-2">
				<div className="mb-2 flex items-center justify-between">
					<h4 className="font-bold text-large">
						{enrollment.competition_info.name}
					</h4>
					<Chip color="primary">
						{getCompetitionTypeDisplay(enrollment.competition_type)}
					</Chip>
				</div>
				<p className="mb-4 text-default-500 text-sm">
					{enrollment.competition_info.description}
				</p>

				<div className="mb-4 grid grid-cols-2 gap-2">
					<Tooltip content="Expiration">
						<div className="flex items-center">
							<FiClock className="mr-2" size={18} />
							<span>{formatExpiration(enrollment.expiration)}</span>
						</div>
					</Tooltip>
					<Tooltip content="Entry Fee">
						<div className="flex items-center">
							<FiDollarSign className="mr-2" size={18} />
							<span>
								{enrollment.entry_fee
									? `${enrollment.entry_fee.amount} ${enrollment.entry_fee.denom}`
									: "Free"}
							</span>
						</div>
					</Tooltip>
					<Tooltip content="Current Pool">
						<div className="flex items-center">
							<FiDollarSign className="mr-2" size={18} />
							<span>{currentPool}</span>
						</div>
					</Tooltip>
				</div>

				<div className="mb-4">
					<Slider
						label="Enrollment Progress"
						showTooltip={true}
						maxValue={maxMembers}
						minValue={0}
						value={currentMembers}
						className="max-w-md"
						isDisabled
						marks={sliderMarks}
						startContent={<FiUsers />}
						endContent={<FiUsers />}
						formatOptions={{ style: "decimal" }}
					/>
				</div>

				<div className="flex justify-between text-default-500 text-sm">
					<span>Min: {minMembers}</span>
					<span>Current: {currentMembers}</span>
					<span>Max: {maxMembers}</span>
				</div>
			</CardBody>
			<CardFooter className="justify-between">
				<Button size="sm" variant="bordered">
					View Details
				</Button>
				<Button
					size="sm"
					color="primary"
					disabled={currentMembers >= maxMembers}
				>
					{currentMembers >= maxMembers ? "Full" : "Join Competition"}
				</Button>
			</CardFooter>
		</Card>
	);
};

export default EnrollmentCard;
