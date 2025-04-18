import { Progress } from "@heroui/react";
import type React from "react";
import { getNumberWithOrdinal } from "~/helpers/UIHelpers";

interface DistributionDisplayProps {
	distribution: string[];
}

const DistributionDisplay: React.FC<DistributionDisplayProps> = ({
	distribution,
}) => {
	return (
		<>
			{distribution.map((value, index) => {
				const percentage = Number.parseFloat(value) * 100;
				return (
					<Progress
						// biome-ignore lint/suspicious/noArrayIndexKey: Best option for now
						key={index}
						aria-label={`${getNumberWithOrdinal(index + 1)} place`}
						value={percentage}
						className="flex-grow"
						color="primary"
						label={`${getNumberWithOrdinal(index + 1)} place:`}
						showValueLabel
					/>
				);
			})}
		</>
	);
};

export default DistributionDisplay;
