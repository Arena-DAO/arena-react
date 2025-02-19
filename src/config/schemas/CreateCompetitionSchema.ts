import { z } from "zod";
import AddressSchema from "./AddressSchema";
import DueSchema from "./DueSchema";
import DurationSchema from "./DurationSchema";
import MemberPercentageSchema from "./MemberPercentageSchema";
import PercentageListSchema from "./PercentageListSchema";
import RulesSchema from "./RulesSchema";
import RulesetsSchema from "./RulesetsSchema";
import { ThresholdSchema } from "./ThresholdSchema";
import { TimestampSchema } from "./TimestampSchema";

const DaoConfigSchema = z.object({
	dao_code_id: z.coerce.number().int().positive(),
	proposal_single_code_id: z.coerce.number().int().positive(),
	prepropose_single_code_id: z.coerce.number().int().positive(),
	cw4_voting_code_id: z.coerce.number().int().positive(),
	max_voting_period: z.object({
		time: z.coerce.number().int().positive(),
	}),
	threshold: ThresholdSchema,
});

export const EnrollmentInfoSchema = z
	.object({
		maxMembers: z.coerce
			.number()
			.int()
			.positive()
			.transform((x) => x.toString()),
		minMembers: z.coerce
			.number()
			.int()
			.positive()
			.optional()
			.transform((x) => x?.toString()),
		entryFee: z
			.object({
				amount: z.coerce.number().transform((x) => x.toString()),
				denom: z
					.string()
					.min(1, { message: "Entry fee denomination is required" }),
			})
			.optional(),
		duration_before: DurationSchema,
		isCreatorMember: z.boolean().optional(),
		requiredTeamSize: z.coerce
			.number()
			.int()
			.positive()
			.min(1, "1 is the min team size")
			.max(30, "30 is the max team size")
			.optional()
			.transform((x) => x?.toString()),
		useDaoHost: DaoConfigSchema.optional(),
	})
	.refine(
		(data) =>
			!data.minMembers || Number(data.minMembers) <= Number(data.maxMembers),
		{
			message: "Minimum members must be less than or equal to maximum members",
			path: ["minMembers"],
		},
	);

const DirectParticipationSchema = z
	.object({
		dues: z.array(DueSchema).optional(),
		membersFromDues: z.boolean().default(false),
		members: z.array(z.object({ address: AddressSchema })),
	})
	.refine(
		(data) => {
			// If membersFromDues is true, we need non-zero dues
			if (data.membersFromDues) {
				return data.dues && data.dues.length > 0;
			}
			// Otherwise, we need non-zero members
			return data.members.length > 0;
		},
		{
			message:
				"Either non-zero dues with members from dues or non-zero members are required",
			path: ["members"],
		},
	);

const BaseCreateCompetitionSchema = z.object({
	banner: z.string().optional(),
	description: z
		.string()
		.min(1, { message: "Description is required" })
		.max(1000, { message: "Description must be 1000 characters or less" }),
	date: TimestampSchema,
	duration: DurationSchema,
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
		matchWinPoints: z.coerce
			.number()
			.int()
			.min(0, { message: "Win points must be non-negative" }),
		matchDrawPoints: z.coerce
			.number()
			.int()
			.min(0, { message: "Draw points must be non-negative" }),
		matchLosePoints: z.coerce
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
	useEnrollments: z.boolean(),
	leagueInfo: LeagueSchema.optional(),
	tournamentInfo: TournamentSchema.optional(),
	enrollmentInfo: EnrollmentInfoSchema.optional(),
	directParticipation: DirectParticipationSchema.optional(),
}).superRefine((data, ctx) => {
	if (data.useEnrollments && !data.enrollmentInfo) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Enrollment information is required when using enrollments",
			path: ["enrollmentInfo"],
		});
	}
	if (!data.useEnrollments && !data.directParticipation) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message:
				"Direct participation information is required when not using enrollments",
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
