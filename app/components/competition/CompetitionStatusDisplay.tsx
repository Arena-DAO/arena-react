import { Badge, Chip } from "@nextui-org/react";
import type React from "react";
import { BsHourglassBottom } from "react-icons/bs";
import type { CompetitionStatus } from "~/codegen/ArenaWagerModule.types";
import { statusColors } from "~/helpers/ArenaHelpers";

interface CompetitionStatusDisplayProps {
	status: CompetitionStatus;
	isExpired: boolean;
}

const CompetitionStatusDisplay: React.FC<CompetitionStatusDisplayProps> = ({
	status,
	isExpired,
}) => {
	return (
		<Badge
			isOneChar
			content={<BsHourglassBottom />}
			color="warning"
			aria-label="Expired"
			isInvisible={
				!(isExpired && (status === "active" || status === "pending"))
			}
		>
			<Chip color={statusColors[status]}>{status}</Chip>
		</Badge>
	);
};

export default CompetitionStatusDisplay;
