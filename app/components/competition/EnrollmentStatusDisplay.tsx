import { Badge, Chip, type ChipProps } from "@heroui/react";
import type React from "react";
import { BsHourglassBottom } from "react-icons/bs";

interface EnrollmentStatusDisplayProps extends ChipProps {
	hasFinalized: boolean;
	isExpired: boolean;
	currentMembers: number;
	maxMembers: number;
	competitionId?: string | null;
}

const EnrollmentStatusDisplay: React.FC<EnrollmentStatusDisplayProps> = ({
	hasFinalized: hasTriggeredExpiration,
	isExpired,
	currentMembers,
	maxMembers,
	competitionId,
	...chipProps
}) => {
	let status = "Open";
	let color: "secondary" | "success" | "default" | "warning" = "secondary";

	if (hasTriggeredExpiration) {
		if (competitionId) {
			status = "Created";
			color = "success";
		} else {
			status = "Expired";
			color = "default";
		}
	} else if (currentMembers >= maxMembers) {
		status = "Full";
		color = "warning";
	}

	return (
		<Badge
			isOneChar
			content={<BsHourglassBottom />}
			color="warning"
			aria-label="Expired"
			isInvisible={!isExpired || hasTriggeredExpiration}
		>
			<Chip color={color} {...chipProps}>
				{status}
			</Chip>
		</Badge>
	);
};

export default EnrollmentStatusDisplay;
