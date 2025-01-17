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
		<div className="space-y-2">
			<h4 className="font-semibold">Distribution</h4>
			{distribution.map((value, index) => {
				const percentage = Number.parseFloat(value) * 100;
				return (
					// biome-ignore lint/suspicious/noArrayIndexKey: best option
					<div className="flex items-center gap-2" key={index}>
						<span className="min-w-20 text-sm">{`${getNumberWithOrdinal(index + 1)} place:`}</span>
						<Progress
							aria-label={`${getNumberWithOrdinal(index + 1)} place distribution`}
							value={percentage}
							className="flex-grow"
							color="primary"
						/>
						<span className="min-w-12 text-end text-sm">{`${percentage.toFixed(1)}%`}</span>
					</div>
				);
			})}
		</div>
	);
};

export default DistributionDisplay;
