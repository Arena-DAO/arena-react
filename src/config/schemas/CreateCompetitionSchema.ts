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
			.min(2, { message: "At least 2 members are required" })
			.optional(),
		entryFee: z
			.object({
				amount: z.string().min(1, { message: "Entry fee amount is required" }),
				denom: z
					.string()
					.min(1, { message: "Entry fee denomination is required" }),
			})
			.optional(),
		enrollment_expiration: ExpirationSchema,
		isCreatorMember: z.boolean().optional(),
	})
	.refine((data) => !data.minMembers || data.minMembers <= data.maxMembers, {
		message: "Minimum members must be less than or equal to maximum members",
		path: ["minMembers"],
	});

const DirectParticipationSchema = z.object({
	dues: z.array(DueSchema).optional(),
	membersFromDues: z.boolean(),
	members: z.array(z.object({ address: AddressSchema })),
	shouldActivateOnFunded: z.boolean().optional(),
});

const BaseCreateCompetitionSchema = z.object({
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
	leagueInfo: LeagueSchema.optional(),
	tournamentInfo: TournamentSchema.optional(),
	enrollmentInfo: EnrollmentInfoSchema.optional(),
	directParticipation: DirectParticipationSchema.optional(),
}).superRefine((data, ctx) => {
	if (data.useCrowdfunding && !data.enrollmentInfo) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Enrollment information is required when using crowdfunding",
			path: ["enrollmentInfo"],
		});
	}
	if (!data.useCrowdfunding && !data.directParticipation) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message:
				"Direct participation information is required when not using crowdfunding",
			path: ["directParticipation"],
		});
	}
	if (data.competitionType === "league" && !data.leagueInfo) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "League information is required for league competitions",
			path: ["leagueInfo"],
		});
	}
	if (data.competitionType === "tournament" && !data.tournamentInfo) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Tournament information is required for tournament competitions",
			path: ["tournamentInfo"],
		});
	}
});

type CreateCompetitionFormValues = z.infer<typeof CreateCompetitionSchema>;

export { CreateCompetitionSchema, type CreateCompetitionFormValues };
