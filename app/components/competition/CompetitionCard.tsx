import { Card, CardBody, Image } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import type React from "react";
import type { EnrollmentEntryResponse } from "~/codegen/ArenaCompetitionEnrollment.types";
import type { CompetitionResponseForLeagueExt } from "~/codegen/ArenaLeagueModule.types";
import type { CompetitionResponseForTournamentExt } from "~/codegen/ArenaTournamentModule.types";
import type { CompetitionResponseForWagerExt } from "~/codegen/ArenaWagerModule.types";
import { useIsExpired } from "~/hooks/useIsExpired";
import Profile from "../Profile";
import CompetitionStatusDisplay from "./CompetitionStatusDisplay";
import CompetitionTypeDisplay from "./CompetitionTypeDisplay";
import EnrollmentInfo from "./EnrollmentInfo";
import EnrollmentStatusDisplay from "./EnrollmentStatusDisplay";
import LeagueInfo from "./LeagueInfo";
import TournamentInfo from "./TournamentInfo";
import CompetitionDates from "./view/components/CompetitionDates";

type Competition =
	| CompetitionResponseForWagerExt
	| CompetitionResponseForLeagueExt
	| CompetitionResponseForTournamentExt
	| EnrollmentEntryResponse;

interface CompetitionProps {
	competition: Competition;
	hideHost?: boolean;
}

const isEnrollment = (
	competition: Competition,
): competition is EnrollmentEntryResponse => "competition_info" in competition;

const isWager = (
	competition: Competition,
): competition is CompetitionResponseForWagerExt =>
	"extension" in competition && "registered_members" in competition.extension;

const isLeague = (
	competition: Competition,
): competition is CompetitionResponseForLeagueExt =>
	"extension" in competition && "teams" in competition.extension;

const isTournament = (
	competition: Competition,
): competition is CompetitionResponseForTournamentExt =>
	"extension" in competition && "elimination_type" in competition.extension;

const getViewPath = (competition: Competition): string => {
	if (isEnrollment(competition))
		return `/enrollment/view?enrollmentId=${competition.id}`;
	if (isLeague(competition))
		return `/league/view?competitionId=${competition.id}`;
	if (isTournament(competition))
		return `/tournament/view?competitionId=${competition.id}`;
	return `/wager/view?competitionId=${competition.id}`;
};

const Competition: React.FC<CompetitionProps> = ({
	competition,
	hideHost = false,
}) => {
	const router = useRouter();
	const isEnrollmentCompetition = isEnrollment(competition);
	const isExpired = isEnrollmentCompetition
		? useIsExpired(
				competition.competition_info.date,
				undefined,
				competition.duration_before,
			)
		: useIsExpired(competition.date, competition.duration);
	const banner = isEnrollmentCompetition
		? competition.competition_info.banner
		: competition.banner;
	const name = isEnrollmentCompetition
		? competition.competition_info.name
		: competition.name;
	const description = isEnrollmentCompetition
		? competition.competition_info.description
		: competition.description;
	const renderCompetitionInfo = () => {
		if (isEnrollmentCompetition)
			return <EnrollmentInfo enrollment={competition} />;
		if (isLeague(competition)) return <LeagueInfo league={competition} />;
		if (isTournament(competition))
			return <TournamentInfo tournament={competition} />;
		return null;
	};

	return (
		<Card
			className="w-full"
			isPressable
			onPress={() => router.push(getViewPath(competition))}
		>
			{banner && (
				<Image
					src={banner}
					alt="Competition Banner"
					className="z-0 h-full w-full object-cover"
				/>
			)}
			<CardBody className="p-3">
				<div className="mt-auto mb-3 flex items-center justify-between">
					<h2 className="truncate font-bold text-lg">{name}</h2>
					{isEnrollment(competition) && (
						<CompetitionTypeDisplay type={competition.competition_type} />
					)}
				</div>
				<p className="mb-3 line-clamp-3 text-sm">{description}</p>
				{!hideHost && (
					<div className="mb-3">
						<Profile address={competition.host} />
					</div>
				)}
				{renderCompetitionInfo()}

				<div className="mt-3 flex items-center justify-between">
					{isEnrollment(competition) ? (
						<>
							<CompetitionDates
								competitionDateNanos={competition.competition_info.date}
								duration={competition.competition_info.duration}
								deadlineBefore={competition.duration_before}
							/>
							<EnrollmentStatusDisplay
								hasTriggeredExpiration={competition.has_finalized}
								isExpired={isExpired}
								currentMembers={Number(competition.current_members)}
								maxMembers={Number(competition.max_members)}
								competitionId={competition.competition_info.competition_id}
							/>
						</>
					) : (
						<>
							<CompetitionDates
								competitionDateNanos={competition.date}
								duration={competition.duration}
							/>
							<CompetitionStatusDisplay
								status={competition.status}
								isExpired={isExpired}
							/>
						</>
					)}
				</div>
			</CardBody>
		</Card>
	);
};

export default Competition;
