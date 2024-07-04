import type React from "react";
import type { CompetitionResponseForWagerExt } from "~/codegen/ArenaWagerModule.types";
import Profile from "../Profile";

interface WagerInfoProps {
	wager: CompetitionResponseForWagerExt;
}

const WagerInfo: React.FC<WagerInfoProps> = ({ wager }) => {
	return (
		<div className="flex flex-col gap-3">
			{wager.extension.registered_members && (
				<div className="text-sm">
					<span className="font-semibold">Registered Members:</span>{" "}
					{wager.extension.registered_members.map((x) => (
						<Profile key={x} address={x} />
					))}
				</div>
			)}
		</div>
	);
};

export default WagerInfo;
