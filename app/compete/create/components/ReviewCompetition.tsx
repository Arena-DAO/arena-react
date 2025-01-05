import FormErrors from "@/components/FormErrors";
import MaybeLink from "@/components/MaybeLink";
import Profile from "@/components/Profile";
import TokenInfo from "@/components/TokenInfo";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Divider,
	Progress,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@nextui-org/react";
import { useFormContext } from "react-hook-form";
import { BsInfinity } from "react-icons/bs";
import { FiCheck, FiClock, FiHash, FiX } from "react-icons/fi";
import type { Expiration } from "~/codegen/ArenaWagerModule.types";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import { useCategoryContext } from "~/contexts/CategoryContext";
import { getNumberWithOrdinal } from "~/helpers/UIHelpers";

const ReviewCompetition = () => {
	const category = useCategoryContext();
	const {
		watch,
		formState: { errors, isSubmitting },
	} = useFormContext<CreateCompetitionFormValues>();
	const values = watch();

	const renderSection = (title: string, content: React.ReactNode) => (
		<Card className="mb-6">
			<CardHeader>
				<h3 className="font-semibold text-xl">{title}</h3>
			</CardHeader>
			<CardBody className="gap-4">{content}</CardBody>
		</Card>
	);

	const renderKeyValue = (key: string, value: React.ReactNode) => (
		<div className="flex justify-between">
			<span className="font-medium">{key}:</span>
			<span>{value}</span>
		</div>
	);

	const renderBooleanValue = (value: boolean) =>
		value ? (
			<FiCheck className="text-success" />
		) : (
			<FiX className="text-danger" />
		);

	const renderDistribution = (distribution: { percent: number }[]) => (
		<Table aria-label="Distribution table" removeWrapper>
			<TableHeader>
				<TableColumn>Place</TableColumn>
				<TableColumn>Percentage</TableColumn>
			</TableHeader>
			<TableBody>
				{distribution.map((dist, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: No key
					<TableRow key={index}>
						<TableCell>{getNumberWithOrdinal(index + 1)}</TableCell>
						<TableCell>
							<Progress value={dist.percent} className="max-w-md" />
							<span className="ml-2">{dist.percent}%</span>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);

	const formatExpiration = (expiration: Expiration) => {
		if ("never" in expiration) {
			return (
				<Chip color="success" startContent={<BsInfinity />}>
					Never
				</Chip>
			);
		}
		if ("at_time" in expiration) {
			return (
				<div className="flex items-center">
					<FiClock className="mr-2" />
					{new Date(expiration.at_time).toLocaleString()}
				</div>
			);
		}
		if ("at_height" in expiration) {
			return (
				<div className="flex items-center">
					<FiHash className="mr-2" />
					Block Height: {expiration.at_height}
				</div>
			);
		}
		return "Invalid Expiration";
	};

	const renderRulesAndRulesets = () => {
		const hasRules = values.rules && values.rules.length > 0;
		const hasRulesets = values.rulesets && values.rulesets.length > 0;

		if (!hasRules && !hasRulesets) {
			return null;
		}

		return renderSection(
			"Rules and Rulesets",
			<>
				{hasRules && (
					<>
						<h4 className="mb-2 font-semibold">Rules:</h4>
						<ul className="mb-4 list-disc pl-5">
							{values.rules.map((rule, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: No key
								<li key={index} className="mb-1">
									<MaybeLink content={rule.rule} />
								</li>
							))}
						</ul>
					</>
				)}
				{hasRules && hasRulesets && <Divider className="my-4" />}
				{hasRulesets && (
					<>
						<h4 className="mb-2 font-semibold">Rulesets:</h4>
						<ul className="list-disc pl-5">
							{values.rulesets.map((ruleset) => (
								<li key={ruleset.ruleset_id}>
									Ruleset ID: {ruleset.ruleset_id.toString()}
								</li>
							))}
						</ul>
					</>
				)}
			</>,
		);
	};

	return (
		<div className="space-y-6">
			<h2 className="mb-6 text-center font-bold text-3xl">
				Competition Summary
			</h2>

			<FormErrors errors={errors} />

			{renderSection(
				"Basic Information",
				<>
					{category &&
						renderKeyValue(
							"Category",
							<span className="font-semibold">{category.title}</span>,
						)}
					{renderKeyValue(
						"Name",
						<span className="font-semibold">{values.name}</span>,
					)}
					{renderKeyValue(
						"Description",
						<p className="text-sm">{values.description}</p>,
					)}
					{renderKeyValue(
						"Type",
						<Chip color="primary">{values.competitionType}</Chip>,
					)}
					{renderKeyValue("Expiration", formatExpiration(values.expiration))}
				</>,
			)}

			{values.additionalLayeredFees &&
				values.additionalLayeredFees.length > 0 &&
				renderSection(
					"Additional Layered Fees",
					<Table aria-label="Additional Layered Fees table" removeWrapper>
						<TableHeader>
							<TableColumn>Receiver</TableColumn>
							<TableColumn>Percentage</TableColumn>
						</TableHeader>
						<TableBody>
							{values.additionalLayeredFees.map((fee, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: No key
								<TableRow key={index}>
									<TableCell>
										<Profile address={fee.addr} />
									</TableCell>
									<TableCell>{fee.percentage}%</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>,
				)}

			{renderRulesAndRulesets()}

			{renderSection(
				"Participation",
				<>
					{renderKeyValue(
						"Enrollments",
						renderBooleanValue(values.useEnrollments),
					)}
					{values.useEnrollments && values.enrollmentInfo ? (
						<>
							{renderKeyValue("Min Members", values.enrollmentInfo.minMembers)}
							{renderKeyValue("Max Members", values.enrollmentInfo.maxMembers)}
							{renderKeyValue(
								"Required Team Size",
								values.enrollmentInfo.requiredTeamSize,
							)}
							{renderKeyValue(
								"Entry Fee",
								values.enrollmentInfo.entryFee && (
									<div className="flex items-center">
										<TokenInfo
											denomOrAddress={values.enrollmentInfo.entryFee.denom}
											amount={BigInt(values.enrollmentInfo.entryFee.amount)}
											isNative={true}
										/>
									</div>
								),
							)}
							{renderKeyValue(
								"Enrollment Expiration",
								formatExpiration(values.enrollmentInfo.enrollment_expiration),
							)}
						</>
					) : values.directParticipation ? (
						<>
							{renderKeyValue(
								"Members from Dues",
								renderBooleanValue(values.directParticipation.membersFromDues),
							)}
							{values.directParticipation.dues &&
							values.directParticipation.dues?.length > 0 ? (
								<>
									{renderKeyValue(
										"Number of Dues",
										values.directParticipation.dues.length,
									)}
								</>
							) : (
								<p className="mb-2 font-semibold">Dues: None</p>
							)}
						</>
					) : (
						<p>No participation information provided.</p>
					)}
				</>,
			)}

			{values.competitionType === "league" &&
				values.leagueInfo &&
				renderSection(
					"League Information",
					<>
						{renderKeyValue("Win Points", values.leagueInfo.matchWinPoints)}
						{renderKeyValue("Draw Points", values.leagueInfo.matchDrawPoints)}
						{renderKeyValue("Lose Points", values.leagueInfo.matchLosePoints)}
						<Divider className="my-4" />
						<h4 className="mb-2 font-semibold">Distribution:</h4>
						{renderDistribution(values.leagueInfo.distribution)}
					</>,
				)}

			{values.competitionType === "tournament" &&
				values.tournamentInfo &&
				renderSection(
					"Tournament Information",
					<>
						{renderKeyValue(
							"Elimination Type",
							<Chip color="primary">
								{values.tournamentInfo.eliminationType === "single"
									? "Single Elimination"
									: "Double Elimination"}
							</Chip>,
						)}
						{values.tournamentInfo.eliminationType === "single" &&
							renderKeyValue(
								"Play Third Place Match",
								renderBooleanValue(
									values.tournamentInfo.playThirdPlace ?? false,
								),
							)}
						<Divider className="my-4" />
						<h4 className="mb-2 font-semibold">Distribution:</h4>
						{renderDistribution(values.tournamentInfo.distribution)}
					</>,
				)}
			<div className="flex justify-end">
				<Button type="submit" color="primary" isLoading={isSubmitting}>
					Create Competition
				</Button>
			</div>
		</div>
	);
};

export default ReviewCompetition;
