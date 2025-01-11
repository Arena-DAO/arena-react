"use client";

import { useChain } from "@cosmos-kit/react";
import type React from "react";
import { isActive } from "~/helpers/ArenaHelpers";
import { useEnv } from "~/hooks/useEnv";
import { useIsExpired } from "~/hooks/useIsExpired";
import type { CompetitionResponse } from "~/types/CompetitionResponse";
import type { CompetitionType } from "~/types/CompetitionType";
import EditStatTypes from "./EditStatTypes";
import InputStatsModal from "./InputStatsModal";
import ProcessForm from "./ProcessForm";

interface CompetitionActionsProps {
	competition: CompetitionResponse;
	hideProcess?: boolean;
	competitionType: CompetitionType;
	moduleAddr: string;
}

const CompetitionActions: React.FC<CompetitionActionsProps> = ({
	competition,
	hideProcess = false,
	competitionType,
	moduleAddr,
}) => {
	const env = useEnv();
	const { address } = useChain(env.CHAIN);
	const isExpired = useIsExpired(competition.date, competition.duration);

	const showEditStatTypes =
		(address === competition.host || address === env.ARENA_DAO_ADDRESS) &&
		(isActive(competition.status) || competition.status === "pending");

	const showHostProcessForm =
		(address === competition.host || address === env.ARENA_DAO_ADDRESS) &&
		!hideProcess &&
		isActive(competition.status);

	const showInputStatsForm =
		address === competition.host || address === env.ARENA_DAO_ADDRESS;

	const showExpiredProcessForm =
		isExpired &&
		competition.status !== "inactive" &&
		competition.status !== "pending";

	const hasAnyAction =
		showEditStatTypes || showHostProcessForm || showExpiredProcessForm;

	if (!hasAnyAction) {
		return null;
	}

	return (
		<div className="flex gap-2">
			{showEditStatTypes && (
				<EditStatTypes moduleAddr={moduleAddr} competitionId={competition.id} />
			)}
			{showInputStatsForm && (
				<InputStatsModal
					moduleAddr={moduleAddr}
					competitionId={competition.id}
				/>
			)}
			{showHostProcessForm && (
				<ProcessForm
					moduleAddr={moduleAddr}
					competitionId={competition.id}
					host={competition.host}
					competitionType={competitionType}
					escrow={competition.escrow}
				/>
			)}
			{showExpiredProcessForm && (
				<ProcessForm
					moduleAddr={moduleAddr}
					competitionId={competition.id}
					is_expired
					competitionType={competitionType}
				/>
			)}
		</div>
	);
};

export default CompetitionActions;
