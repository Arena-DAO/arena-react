"use client";

import {
	type ExecuteResult,
	type SigningCosmWasmClient,
	toBinary,
} from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { Button, Card, CardBody, CardHeader, Tooltip, addToast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Info, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
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
import { convertToNanoseconds } from "~/config/schemas/TimestampSchema";
import { CategoryProvider, useCategoryContext } from "~/contexts/CategoryContext";
import { convertToEscrowInstantiate } from "~/helpers/SchemaHelpers";
import { useEnv } from "~/hooks/useEnv";
import BasicInformationForm, {
	type BasicInformationFormRef,
} from "./components/BasicInformationForm";
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
	const { getSigningCosmWasmClient, address, isWalletConnected } = useChain(env.CHAIN);
	const basicInformationFormRef = useRef<BasicInformationFormRef>(null);

	const formMethods = useForm<CreateCompetitionFormValues>({
		resolver: zodResolver(CreateCompetitionSchema),
		defaultValues: {
			competitionType: "wager",
			useEnrollments: true,
			name: "",
			description: "",
			duration: { units: "days", amount: "1" },
			rules: [],
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
				maxMembers: "2",
				duration_before: { units: "minutes", amount: "30" },
			},
		},
	});

	const {
		handleSubmit,
		watch,
		formState: { isSubmitting },
	} = formMethods;

	const competitionType = watch("competitionType");
	const useEnrollments = watch("useEnrollments");

	const handleEnrollmentSubmission = async (
		client: SigningCosmWasmClient,
		values: CreateCompetitionFormValues,
		address: string,
		categoryId?: string
	) => {
		if (!values.enrollmentInfo) {
			throw new Error("Enrollment information is required");
		}

		const enrollmentClient = new ArenaCompetitionEnrollmentClient(
			client,
			address,
			env.ARENA_COMPETITION_ENROLLMENT_ADDRESS
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
						distribution: values.leagueInfo.distribution.map((mp) => mp.percent.toString()),
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
						distribution: values.tournamentInfo.distribution.map((mp) => mp.percent.toString()),
						elimination_type:
							values.tournamentInfo.eliminationType === "single"
								? {
										single_elimination: {
											play_third_place_match: values.tournamentInfo.playThirdPlace ?? false,
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
				date: convertToNanoseconds(values.date),
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
			useDaoHost: values.enrollmentInfo?.useDaoHost,
		});

		return result;
	};

	const handleDirectSubmission = async (
		client: SigningCosmWasmClient,
		values: CreateCompetitionFormValues,
		address: string,
		categoryId?: string
	) => {
		if (!values.directParticipation) {
			throw new Error("Direct participation information is required");
		}

		const members: AddMemberMsg[] = values.directParticipation.membersFromDues
			? (values.directParticipation.dues?.map((due) => ({
					addr: due.addr,
					power: "1000",
				})) ?? [])
			: (values.directParticipation.members?.map((member) => ({
					addr: member.address,
					power: "1000",
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
			values.additionalLayeredFees
		);

		const commonMsg = {
			name: values.name,
			description: values.description,
			date: convertToNanoseconds(values.date),
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
					env.ARENA_WAGER_MODULE_ADDRESS
				);
				result = await wagerClient.createCompetition({
					...commonMsg,
					instantiateExtension: {},
				});
				break;
			}
			case "league": {
				if (!values.leagueInfo) throw new Error("League information is required");
				const leagueClient = new ArenaLeagueModuleClient(
					client,
					address,
					env.ARENA_LEAGUE_MODULE_ADDRESS
				);
				result = await leagueClient.createCompetition({
					...commonMsg,
					instantiateExtension: {
						distribution: values.leagueInfo.distribution.map((mp) => mp.percent.toString()),
						match_win_points: values.leagueInfo.matchWinPoints.toString(),
						match_draw_points: values.leagueInfo.matchDrawPoints.toString(),
						match_lose_points: values.leagueInfo.matchLosePoints.toString(),
					},
				});
				break;
			}
			case "tournament": {
				if (!values.tournamentInfo) throw new Error("Tournament information is required");
				const tournamentClient = new ArenaTournamentModuleClient(
					client,
					address,
					env.ARENA_TOURNAMENT_MODULE_ADDRESS
				);
				result = await tournamentClient.createCompetition({
					...commonMsg,
					instantiateExtension: {
						distribution: values.tournamentInfo.distribution.map((mp) => mp.percent.toString()),
						elimination_type:
							values.tournamentInfo.eliminationType === "single"
								? {
										single_elimination: {
											play_third_place_match: values.tournamentInfo.playThirdPlace ?? false,
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
			if (!isWalletConnected) {
				addToast({
					color: "danger",
					description: "Please connect your wallet to create a competition",
				});
				return;
			}

			// Upload banner image first if one was selected
			const uploadedBannerUrl = await basicInformationFormRef.current?.uploadBannerImage();
			if (uploadedBannerUrl) {
				values.banner = uploadedBannerUrl;
			}

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
					if (attribute.key === (values.useEnrollments ? "id" : "competition_id")) {
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
						: `/${values.competitionType}/view?competitionId=${id}`
				);
				addToast({
					color: "success",
					description: `Your ${values.competitionType} competition was created successfully!`,
				});
			} else {
				console.warn("Competition created but ID not found in the result");
				addToast({
					color: "warning",
					description: "Competition created but redirect failed",
				});
			}
		} catch (e) {
			console.error(e);
			addToast({
				color: "danger",
				description: `Error creating competition: ${(e as Error).message}`,
			});
		}
	};

	return (
		<CategoryProvider value={category?.url}>
			<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
				<div className="container mx-auto space-y-6 px-4 py-6 md:space-y-8 md:py-8">
					{/* Header Section */}
					<div className="flex flex-col gap-4 md:gap-6">
						<motion.div
							initial={{ opacity: 0, y: -20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<div className="text-center">
								<h1 className="mb-4 font-bold text-3xl md:text-4xl">Create Competition</h1>
								<p className="mx-auto mb-8 max-w-2xl opacity-70">
									Choose your competition type and set up the details
								</p>
							</div>
						</motion.div>
					</div>

					<FormProvider {...formMethods}>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							{/* Competition Type Selection */}
							<Card>
								<CardHeader className="px-6 py-4">
									<h2 className="font-bold text-xl">Choose Competition Type</h2>
								</CardHeader>
								<CardBody className="px-6 py-4">
									<Controller
										name="competitionType"
										control={formMethods.control}
										render={({ field }) => (
											<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
												{[
													{
														value: "wager",
														title: "Wager",
														icon: "🎯",
														description: "Simple head-to-head competition with direct wagering",
													},
													{
														value: "tournament",
														title: "Tournament",
														icon: "🏆",
														description: "Elimination-style brackets with multiple rounds",
													},
													{
														value: "league",
														title: "League",
														icon: "🥇",
														description: "Round-robin format with point-based scoring",
													},
												].map(({ value, title, icon, description }) => (
													<Card
														key={value}
														isPressable
														onPress={() => field.onChange(value)}
														className={`relative border-2 transition-all duration-200 hover:scale-[1.02] ${
															field.value === value
																? "border-primary bg-primary/5 shadow-lg"
																: "border-default-200 hover:border-primary/30"
														}`}
													>
														<CardBody className="space-y-4 p-6 text-center">
															<div className="text-4xl">{icon}</div>
															<div>
																<h3 className="mb-2 font-bold text-lg">{title}</h3>
																<p className="text-default-600 text-sm">{description}</p>
															</div>
														</CardBody>
													</Card>
												))}
											</div>
										)}
									/>
								</CardBody>
							</Card>

							{/* Basic Information */}
							<Card>
								<CardHeader className="px-6 py-4">
									<h2 className="font-bold text-xl">Competition Details</h2>
								</CardHeader>
								<CardBody className="space-y-6 px-6 py-4">
									<BasicInformationForm ref={basicInformationFormRef} />
								</CardBody>
							</Card>

							{/* Competition-specific Settings */}
							{competitionType === "league" && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.3 }}
								>
									<Card>
										<CardHeader className="px-6 py-4">
											<h2 className="font-bold text-xl">League Settings</h2>
										</CardHeader>
										<CardBody className="space-y-6 px-6 py-4">
											<LeagueInformationForm />
										</CardBody>
									</Card>
								</motion.div>
							)}

							{competitionType === "tournament" && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.3 }}
								>
									<Card>
										<CardHeader className="px-6 py-4">
											<h2 className="font-bold text-xl">Tournament Settings</h2>
										</CardHeader>
										<CardBody className="space-y-6 px-6 py-4">
											<TournamentInformationForm />
										</CardBody>
									</Card>
								</motion.div>
							)}

							{/* Rules */}
							<Card>
								<CardHeader className="px-6 py-4">
									<div className="flex items-center gap-2">
										<h2 className="font-bold text-xl">Rules & Guidelines</h2>
										<Tooltip content="Set competition rules and select rulesets">
											<Info size={16} className="cursor-help opacity-60" />
										</Tooltip>
									</div>
								</CardHeader>
								<CardBody className="space-y-6 px-6 py-4">
									<RulesAndRulesetsForm />
								</CardBody>
							</Card>

							{/* Participation Mode Selection */}
							<Card>
								<CardHeader className="px-6 py-4">
									<h2 className="font-bold text-xl">How will participants join?</h2>
								</CardHeader>
								<CardBody className="px-6 py-4">
									<Controller
										name="useEnrollments"
										render={({ field }) => (
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												<Card
													isPressable
													onPress={() => field.onChange(true)}
													className={`border-2 transition-all duration-200 ${
														field.value
															? "border-primary bg-primary/5 shadow-lg"
															: "border-default-200 hover:border-primary/30"
													}`}
												>
													<CardBody className="space-y-3 p-6">
														<div className="flex items-center gap-3">
															<div className="text-2xl">📝</div>
															<div>
																<h3 className="font-bold text-lg">Open Enrollments</h3>
																<p className="text-default-600 text-sm">
																	Recommended for most competitions
																</p>
															</div>
														</div>
														<ul className="space-y-1 text-default-600 text-sm">
															<li>• Anyone can sign up and pay entry fees</li>
															<li>• Set registration deadlines</li>
															<li>• Configure min/max participants</li>
															<li>• Perfect for public competitions</li>
														</ul>
													</CardBody>
												</Card>

												<Card
													isPressable
													onPress={() => field.onChange(false)}
													className={`border-2 transition-all duration-200 ${
														!field.value
															? "border-primary bg-primary/5 shadow-lg"
															: "border-default-200 hover:border-primary/30"
													}`}
												>
													<CardBody className="space-y-3 p-6">
														<div className="flex items-center gap-3">
															<div className="text-2xl">👥</div>
															<div>
																<h3 className="font-bold text-lg">Direct Participation</h3>
																<p className="text-default-600 text-sm">
																	For private/invited competitions
																</p>
															</div>
														</div>
														<ul className="space-y-1 text-default-600 text-sm">
															<li>• Manually add specific participants</li>
															<li>• Pre-collect funds from participants</li>
															<li>• Immediate competition start</li>
															<li>• Great for friend groups</li>
														</ul>
													</CardBody>
												</Card>
											</div>
										)}
									/>
								</CardBody>
							</Card>

							{/* Participation Configuration */}
							<Card>
								<CardHeader className="px-6 py-4">
									<h2 className="font-bold text-xl">
										{useEnrollments ? "Enrollment Settings" : "Participant Setup"}
									</h2>
								</CardHeader>
								<CardBody className="space-y-6 px-6 py-4">
									<motion.div
										initial={false}
										animate={{ opacity: 1, height: "auto" }}
										transition={{ duration: 0.3 }}
									>
										{useEnrollments ? <EnrollmentInformationForm /> : <MembersAndDuesForm />}
									</motion.div>
								</CardBody>
							</Card>

							{/* Submit Button */}
							<div className="flex justify-end gap-4 pt-4">
								<Button
									type="submit"
									color="primary"
									variant="shadow"
									size="lg"
									isLoading={isSubmitting}
									startContent={!isSubmitting && <Plus size={18} />}
									className="min-w-[200px]"
								>
									{isSubmitting
										? "Creating..."
										: `Create ${competitionType.charAt(0).toUpperCase() + competitionType.slice(1)}`}
								</Button>
							</div>
						</form>
					</FormProvider>
				</div>
			</motion.div>
		</CategoryProvider>
	);
};

export default CreateCompetitionPage;
