import { z } from "zod";
import AddressSchema from "./AddressSchema";
import DueSchema from "./DueSchema";
import ExpirationSchema from "./ExpirationSchema";
import MemberPercentageSchema from "./MemberPercentageSchema";
import PercentageListSchema from "./PercentageListSchema";
import RulesSchema from "./RulesSchema";
import RulesetsSchema from "./RulesetsSchema";

const EnrollmentInfoSchema = z
	.object({
		maxMembers: z
			.number()
			.int()
			.min(2, { message: "At least 2 members are required" }),
		minMembers: z
			.number()
			.int()
			.min(2, { message: "At least 2 members are required" }),
		entryFee: z.object({
			amount: z.string().min(1, { message: "Entry fee amount is required" }),
			denom: z
				.string()
				.min(1, { message: "Entry fee denomination is required" }),
		}),
		enrollment_expiration: ExpirationSchema,
	})
	.refine((data) => data.minMembers <= data.maxMembers, {
		message: "Minimum members must be less than or equal to maximum members",
		path: ["minMembers"],
	});

const BaseCreateCompetitionSchema = z.object({
	category_id: z.bigint().nonnegative().optional(),
	description: z
		.string()
		.min(1, { message: "Description is required" })
		.max(1000, { message: "Description must be 1000 characters or less" }),
	expiration: ExpirationSchema,
	name: z
		.string()
		.min(1, { message: "Name is required" })
		.max(100, { message: "Name must be 100 characters or less" }),
	rules: RulesSchema,
	rulesets: RulesetsSchema,
	dues: z.array(DueSchema).min(1, { message: "At least one due is required" }),
	membersFromDues: z.boolean(),
	members: z.array(z.object({ address: AddressSchema })),
	additionalLayeredFees: z.array(MemberPercentageSchema).optional(),
});

const LeagueSchema = z
	.object({
		matchWinPoints: z
			.number()
			.int()
			.min(0, { message: "Win points must be non-negative" }),
		matchDrawPoints: z
			.number()
			.int()
			.min(0, { message: "Draw points must be non-negative" }),
		matchLosePoints: z
			.number()
			.int()
			.min(0, { message: "Lose points must be non-negative" }),
		distribution: PercentageListSchema,
	})
	.refine(
		(data) =>
			data.matchWinPoints > data.matchDrawPoints &&
			data.matchDrawPoints > data.matchLosePoints,
		{
			message:
				"Win points should be greater than draw points, which should be greater than lose points",
			path: ["matchWinPoints"],
		},
	);

const TournamentSchema = z.object({
	eliminationType: z.enum(["single", "double"]),
	playThirdPlace: z.boolean().optional(),
	distribution: PercentageListSchema,
});

const CreateCompetitionSchema = BaseCreateCompetitionSchema.extend({
	competitionType: z.enum(["wager", "league", "tournament"]),
	useCrowdfunding: z.boolean(),
	host: AddressSchema.optional(),
	leagueInfo: LeagueSchema.optional(),
	tournamentInfo: TournamentSchema.optional(),
	enrollmentInfo: EnrollmentInfoSchema.optional(),
})
	.refine(
		(data) => {
			if (data.competitionType === "league") {
				return !!data.leagueInfo;
			}
			return true;
		},
		{
			message: "League information is required for league competitions",
			path: ["leagueInfo"],
		},
	)
	.refine(
		(data) => {
			if (data.competitionType === "tournament") {
				return !!data.tournamentInfo;
			}
			return true;
		},
		{
			message: "Tournament information is required for tournament competitions",
			path: ["tournamentInfo"],
		},
	)
	.refine(
		(data) => {
			if (data.useCrowdfunding) {
				return !!data.enrollmentInfo;
			}
			return true;
		},
		{
			message: "Enrollment information is required for crowdfunding",
			path: ["enrollmentInfo"],
		},
	)
	.refine(
		(data) => {
			if (data.membersFromDues) {
				return data.dues.length >= 2;
			}
			return data.members.length >= 2;
		},
		{
			message: "At least 2 members or dues are required",
			path: ["members"],
		},
	);

type CreateCompetitionFormValues = z.infer<typeof CreateCompetitionSchema>;

export { CreateCompetitionSchema, type CreateCompetitionFormValues };
