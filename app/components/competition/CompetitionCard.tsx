import { Card, CardBody, Chip, Image } from "@nextui-org/react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import type { EnrollmentEntryResponse } from "~/codegen/ArenaCompetitionEnrollment.types";
import type { CompetitionResponseForLeagueExt } from "~/codegen/ArenaLeagueModule.types";
import type { CompetitionResponseForTournamentExt } from "~/codegen/ArenaTournamentModule.types";
import type { CompetitionResponseForWagerExt } from "~/codegen/ArenaWagerModule.types";
import { statusColors } from "~/helpers/ArenaHelpers";
import { getCompetitionTypeDisplay } from "~/helpers/EnrollmentHelpers";
import Profile from "../Profile";
import EnrollmentInfo from "./EnrollmentInfo";
import ExpirationDisplay from "./ExpirationDisplay";
import LeagueInfo from "./LeagueInfo";
import TournamentInfo from "./TournamentInfo";
import WagerInfo from "./WagerInfo";

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
	const banner = isEnrollment(competition)
		? competition.competition_info.banner
		: competition.banner;
	const name = isEnrollment(competition)
		? competition.competition_info.name
		: competition.name;
	const description = isEnrollment(competition)
		? competition.competition_info.description
		: competition.description;
	const renderCompetitionInfo = () => {
		if (isEnrollment(competition))
			return <EnrollmentInfo enrollment={competition} />;
		if (isWager(competition)) return <WagerInfo wager={competition} />;
		if (isLeague(competition)) return <LeagueInfo league={competition} />;
		if (isTournament(competition))
			return <TournamentInfo tournament={competition} />;
		return null; // This should never happen if all types are covered
	};

	return (
		<Card
			className="w-full"
			isPressable
			onPress={() => router.push(getViewPath(competition))}
		>
			{banner && (
				<Image
					as={NextImage}
					src={banner}
					alt="Competition Banner"
					className="z-0 h-full w-full object-cover"
					width="1920"
					height="1080"
				/>
			)}
			<CardBody className="p-3">
				<div className="mt-auto mb-3 flex items-center justify-between">
					<h2 className="truncate font-bold text-lg">{name}</h2>
					<Chip
						color={
							isEnrollment(competition)
								? "warning"
								: statusColors[competition.status]
						}
						variant="flat"
						size="sm"
					>
						{isEnrollment(competition)
							? getCompetitionTypeDisplay(competition.competition_type)
							: competition.status}
					</Chip>
				</div>
				<p className="mb-3 text-sm">{description}</p>
				{!hideHost && (
					<div className="mb-3">
						<Profile
							address={competition.host}
							categoryId={competition.category_id}
						/>
					</div>
				)}
				{renderCompetitionInfo()}

				<div className="mt-3 flex items-center justify-between text-sm">
					Expires
					<ExpirationDisplay expiration={competition.expiration} />
				</div>
			</CardBody>
		</Card>
	);
};

export default Competition;
