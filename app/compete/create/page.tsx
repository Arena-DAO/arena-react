"use client";

import {
	type ExecuteResult,
	type SigningCosmWasmClient,
	toBinary,
} from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Switch,
	Tooltip,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {} from "@internationalized/date";
import { Info } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ArenaCompetitionEnrollmentClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import type { CompetitionType } from "~/codegen/ArenaCompetitionEnrollment.types";
import type { InstantiateMsg as ArenaEscrowInstantiateMsg } from "~/codegen/ArenaEscrow.types";
import type {
	AddMemberMsg,
	InstantiateMsg as GroupInstantiateMsg,
} from "~/codegen/ArenaGroup.types";
import { ArenaLeagueModuleClient } from "~/codegen/ArenaLeagueModule.client";
import { ArenaTournamentModuleClient } from "~/codegen/ArenaTournamentModule.client";
import { ArenaWagerModuleClient } from "~/codegen/ArenaWagerModule.client";
import type { GroupContractInfo } from "~/codegen/ArenaWagerModule.types";
import {
	type CreateCompetitionFormValues,
	CreateCompetitionSchema,
} from "~/config/schemas/CreateCompetitionSchema";
import { parseToNanos } from "~/config/schemas/TimestampSchema";
import {
	CategoryProvider,
	useCategoryContext,
} from "~/contexts/CategoryContext";
import { convertToEscrowInstantiate } from "~/helpers/SchemaHelpers";
import { useEnv } from "~/hooks/useEnv";
import BasicInformationForm from "./components/BasicInformationForm";
import MembersAndDuesForm from "./components/DirectParticipationForm";
import EnrollmentInformationForm from "./components/EnrollmentInformationForm";
import LeagueInformationForm from "./components/LeagueInformationForm";
import RulesAndRulesetsForm from "./components/RulesAndRulesetsForm";
import TournamentInformationForm from "./components/TournamentInformationForm";

const CreateCompetitionPage = () => {
	const env = useEnv();
	const params = useSearchParams();
	const category = useCategoryContext(params.get("category"));
	const router = useRouter();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);

	const formMethods = useForm<CreateCompetitionFormValues>({
		resolver: zodResolver(CreateCompetitionSchema),
		defaultValues: {
			competitionType: "wager",
			useEnrollments: true,
			name: "",
			description: "",
			duration: { units: "days", amount: "1" },
			rules: [{ rule: "" }],
			rulesets: [],
			additionalLayeredFees: [],
			leagueInfo: {
				matchWinPoints: 3,
				matchDrawPoints: 1,
				matchLosePoints: 0,
				distribution: [{ percent: "100" }],
			},
			tournamentInfo: {
				eliminationType: "single",
				playThirdPlace: true,
				distribution: [{ percent: "100" }],
			},
			enrollmentInfo: {
				maxMembers: "16",
				duration_before: { units: "minutes", amount: "30" },
			},
		},
	});

	const {
		handleSubmit,
		watch,
		formState: { isSubmitting, isLoading },
	} = formMethods;
	const competitionType = watch("competitionType");
	const useEnrollments = watch("useEnrollments");

	const handleEnrollmentSubmission = async (
		client: SigningCosmWasmClient,
		values: CreateCompetitionFormValues,
		address: string,
		categoryId?: string,
	) => {
		if (!values.enrollmentInfo) {
			throw new Error("Enrollment information is required");
		}

		const enrollmentClient = new ArenaCompetitionEnrollmentClient(
			client,
			address,
			env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
		);

		let competitionType: CompetitionType;
		switch (values.competitionType) {
			case "wager":
				competitionType = { wager: {} };
				break;
			case "league":
				if (!values.leagueInfo) {
					throw new Error("League information is required");
				}
				competitionType = {
					league: {
						distribution: values.leagueInfo.distribution.map((mp) =>
							mp.percent.toString(),
						),
						match_win_points: values.leagueInfo.matchWinPoints.toString(),
						match_draw_points: values.leagueInfo.matchDrawPoints.toString(),
						match_lose_points: values.leagueInfo.matchLosePoints.toString(),
					},
				};
				break;
			case "tournament":
				if (!values.tournamentInfo) {
					throw new Error("Tournament information is required");
				}
				competitionType = {
					tournament: {
						distribution: values.tournamentInfo.distribution.map((mp) =>
							mp.percent.toString(),
						),
						elimination_type:
							values.tournamentInfo.eliminationType === "single"
								? {
										single_elimination: {
											play_third_place_match:
												values.tournamentInfo.playThirdPlace ?? false,
										},
									}
								: "double_elimination",
					},
				};
				break;
			default:
				throw new Error(`Invalid competition type: ${values.competitionType}`);
		}

		const result = await enrollmentClient.createEnrollment({
			categoryId,
			competitionType,
			competitionInfo: {
				name: values.name,
				description: values.description,
				date: parseToNanos(values.date),
				duration: values.duration.toSeconds(),
				rules: values.rules.map((r) => r.rule),
				rulesets: values.rulesets.map((r) => r.ruleset_id.toString()),
				banner: values.banner,
			},
			maxMembers: values.enrollmentInfo.maxMembers.toString(),
			minMembers: values.enrollmentInfo.minMembers?.toString(),
			entryFee: values.enrollmentInfo.entryFee,
			durationBefore: values.enrollmentInfo.duration_before.toSeconds(),
			groupContractInfo: {
				code_id: env.CODE_ID_GROUP,
				funds: [],
				label: "Arena Group",
				msg: toBinary({} as GroupInstantiateMsg),
			},
			requiredTeamSize: values.enrollmentInfo.requiredTeamSize
				? Number(values.enrollmentInfo.requiredTeamSize)
				: undefined,
			escrowContractInfo: {
				new: {
					code_id: env.CODE_ID_ESCROW,
					label: "Arena Escrow",
					additional_layered_fees: values.additionalLayeredFees?.map((x) => ({
						receiver: x.addr,
						tax: x.percentage.toString(),
					})),
					msg: toBinary({
						dues: [],
						is_enrollment: true,
					} as ArenaEscrowInstantiateMsg),
				},
			},
		});

		return result;
	};

	const handleDirectSubmission = async (
		client: SigningCosmWasmClient,
		values: CreateCompetitionFormValues,
		address: string,
		categoryId?: string,
	) => {
		if (!values.directParticipation) {
			throw new Error("Direct participation information is required");
		}

		const members: AddMemberMsg[] = values.directParticipation.membersFromDues
			? (values.directParticipation.dues?.map((due) => ({ addr: due.addr })) ??
				[])
			: (values.directParticipation.members?.map((member) => ({
					addr: member.address,
				})) ?? []);

		const groupContract = {
			new: {
				info: {
					code_id: env.CODE_ID_GROUP,
					label: "Arena Group",
					funds: [],
					msg: toBinary({ members }),
					admin: { address: { addr: env.ARENA_DAO_ADDRESS } },
				},
			},
		} as GroupContractInfo;

		const escrow = convertToEscrowInstantiate(
			env.CODE_ID_ESCROW,
			values.directParticipation.dues ?? [],
			values.additionalLayeredFees,
		);

		const commonMsg = {
			name: values.name,
			description: values.description,
			date: parseToNanos(values.date),
			duration: values.duration.toSeconds(),
			rules: values.rules.map((r) => r.rule),
			rulesets: values.rulesets.map((r) => r.ruleset_id.toString()),
			banner: values.banner,
			categoryId,
			escrow,
			groupContract,
		};

		let result: ExecuteResult;

		switch (values.competitionType) {
			case "wager": {
				const wagerClient = new ArenaWagerModuleClient(
					client,
					address,
					env.ARENA_WAGER_MODULE_ADDRESS,
				);
				result = await wagerClient.createCompetition({
					...commonMsg,
					instantiateExtension: {},
				});
				break;
			}
			case "league": {
				if (!values.leagueInfo)
					throw new Error("League information is required");
				const leagueClient = new ArenaLeagueModuleClient(
					client,
					address,
					env.ARENA_LEAGUE_MODULE_ADDRESS,
				);
				result = await leagueClient.createCompetition({
					...commonMsg,
					instantiateExtension: {
						distribution: values.leagueInfo.distribution.map((mp) =>
							mp.percent.toString(),
						),
						match_win_points: values.leagueInfo.matchWinPoints.toString(),
						match_draw_points: values.leagueInfo.matchDrawPoints.toString(),
						match_lose_points: values.leagueInfo.matchLosePoints.toString(),
					},
				});
				break;
			}
			case "tournament": {
				if (!values.tournamentInfo)
					throw new Error("Tournament information is required");
				const tournamentClient = new ArenaTournamentModuleClient(
					client,
					address,
					env.ARENA_TOURNAMENT_MODULE_ADDRESS,
				);
				result = await tournamentClient.createCompetition({
					...commonMsg,
					instantiateExtension: {
						distribution: values.tournamentInfo.distribution.map((mp) =>
							mp.percent.toString(),
						),
						elimination_type:
							values.tournamentInfo.eliminationType === "single"
								? {
										single_elimination: {
											play_third_place_match:
												values.tournamentInfo.playThirdPlace ?? false,
										},
									}
								: "double_elimination",
					},
				});
				break;
			}
			default:
				throw new Error(`Invalid competition type: ${values.competitionType}`);
		}

		return result;
	};

	const onSubmit = async (values: CreateCompetitionFormValues) => {
		try {
			const client = await getSigningCosmWasmClient();
			if (!address) throw new Error("Could not get user address");

			const categoryId = category?.category_id?.toString();
			const result = values.useEnrollments
				? await handleEnrollmentSubmission(client, values, address, categoryId)
				: await handleDirectSubmission(client, values, address, categoryId);

			// Extract ID from result
			let id: string | undefined;
			for (const event of result.events) {
				for (const attribute of event.attributes) {
					if (
						attribute.key === (values.useEnrollments ? "id" : "competition_id")
					) {
						id = attribute.value;
						break;
					}
				}
				if (id) break;
			}

			if (id) {
				router.push(
					values.useEnrollments
						? `/enrollment/view?enrollmentId=${id}`
						: `/${values.competitionType}/view?competitionId=${id}`,
				);
				toast.success(`The ${values.competitionType} was created successfully`);
			} else {
				console.warn("Competition created but ID not found in the result");
				toast.warning("Competition created but redirect failed");
			}
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	return (
		<CategoryProvider value={category?.url}>
			<div className="container mx-auto max-w-6xl px-4 py-8">
				<h1 className="mb-8 text-center font-bold text-4xl">
					Create a Competition
				</h1>

				<FormProvider {...formMethods}>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
						<Card>
							<CardHeader>
								<h2 className="font-semibold text-2xl">
									Competition Information
								</h2>
							</CardHeader>
							<CardBody>
								<BasicInformationForm />
							</CardBody>
						</Card>

						{competitionType === "league" && (
							<Card>
								<CardHeader>
									<h2 className="font-semibold text-2xl">League Settings</h2>
								</CardHeader>
								<CardBody>
									<LeagueInformationForm />
								</CardBody>
							</Card>
						)}

						{competitionType === "tournament" && (
							<Card>
								<CardHeader>
									<h2 className="font-semibold text-2xl">
										Tournament Settings
									</h2>
								</CardHeader>
								<CardBody>
									<TournamentInformationForm />
								</CardBody>
							</Card>
						)}

						<Card>
							<CardHeader>
								<h3 className="mb-2 flex items-center font-semibold text-2xl">
									Rules
									<Tooltip content="The competition's rules and rulesets if applicable">
										<span className="ml-2 cursor-help">
											<Info />
										</span>
									</Tooltip>
								</h3>
							</CardHeader>
							<CardBody>
								<RulesAndRulesetsForm />
							</CardBody>
						</Card>

						<Card>
							<CardBody>
								<div className="mb-6 flex flex-wrap items-center justify-between gap-2">
									<h2 className="font-semibold text-2xl">
										Participation Details
									</h2>
									<Controller
										name="useEnrollments"
										render={({ field }) => (
											<Switch
												{...field}
												isSelected={field.value}
												isDisabled={isSubmitting}
											>
												Enable Enrollments
											</Switch>
										)}
									/>
								</div>
								{useEnrollments ? (
									<EnrollmentInformationForm />
								) : (
									<MembersAndDuesForm />
								)}
							</CardBody>
						</Card>

						<div className="mt-8 flex justify-end">
							<Button
								type="submit"
								color="primary"
								size="lg"
								className="px-8"
								isLoading={isLoading}
								isDisabled={isSubmitting}
							>
								Create Competition
							</Button>
						</div>
					</form>
				</FormProvider>
			</div>
		</CategoryProvider>
	);
};

export default CreateCompetitionPage;
