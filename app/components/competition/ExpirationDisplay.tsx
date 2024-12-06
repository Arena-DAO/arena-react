import { Chip, Tooltip } from "@nextui-org/react";
import type React from "react";
import { BsInfinity } from "react-icons/bs";
import { FiClock, FiLayers } from "react-icons/fi";
import type { Expiration } from "~/codegen/ArenaWagerModule.types";
import { formatTimestampToDisplay } from "~/helpers/DateHelpers";

interface ExpirationDisplayProps {
	expiration: Expiration;
	tooltip?: string;
}

const ExpirationDisplay: React.FC<ExpirationDisplayProps> = ({
	expiration,
	tooltip = "Competition Expiration",
}) => {
	let content: React.ReactNode;
	let icon: React.ReactNode;

	if ("at_height" in expiration) {
		content = `Height: ${expiration.at_height}`;
		icon = <FiLayers />;
	} else if ("at_time" in expiration) {
		content = formatTimestampToDisplay(expiration.at_time);
		icon = <FiClock />;
	} else {
		content = "Never";
		icon = <BsInfinity />;
	}

	return (
		<Tooltip content={tooltip}>
			<Chip startContent={icon} variant="flat">
				{content}
			</Chip>
		</Tooltip>
	);
};

export default ExpirationDisplay;
