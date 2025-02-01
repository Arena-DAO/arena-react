import { Badge, Chip, type ChipProps } from "@heroui/react";
import { Hourglass } from "lucide-react";
import type React from "react";
import type { CompetitionStatus } from "~/codegen/ArenaWagerModule.types";
import {
	getStatusColor,
	getStatusName,
	isActive,
} from "~/helpers/ArenaHelpers";

interface CompetitionStatusDisplayProps extends ChipProps {
	status: CompetitionStatus;
	isExpired: boolean;
}

const CompetitionStatusDisplay: React.FC<CompetitionStatusDisplayProps> = ({
	status,
	isExpired,
	...chipProps
}) => {
	return (
		<Badge
			isOneChar
			content={<Hourglass />}
			color="warning"
			aria-label="Expired"
			isInvisible={!(isExpired && (isActive(status) || status === "pending"))}
		>
			<Chip color={getStatusColor(status)} {...chipProps}>
				{getStatusName(status)}
			</Chip>
		</Badge>
	);
};

export default CompetitionStatusDisplay;
