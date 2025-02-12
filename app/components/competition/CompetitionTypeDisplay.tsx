import { Chip, type ChipProps } from "@heroui/react";
import type React from "react";
import type { CompetitionType } from "~/codegen/ArenaCompetitionEnrollment.types";

const getCompetitionTypeInfo = (
	type: CompetitionType,
): {
	display: string;
	color: "primary" | "secondary" | "success" | "warning";
} => {
	if ("wager" in type) return { display: "Wager", color: "primary" };
	if ("league" in type) return { display: "League", color: "secondary" };
	if ("tournament" in type) return { display: "Tournament", color: "success" };
	return { display: "Unknown", color: "warning" };
};

interface CompetitionTypeDisplayProps extends ChipProps {
	type: CompetitionType;
}

const CompetitionTypeDisplay: React.FC<CompetitionTypeDisplayProps> = ({
	type,
	...props
}) => {
	const { display, color } = getCompetitionTypeInfo(type);

	return (
		<Chip color={color} {...props}>
			{display}
		</Chip>
	);
};

export default CompetitionTypeDisplay;
