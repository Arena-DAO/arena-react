"use client";

import type { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Card,
	CardBody,
	Divider,
	Switch,
	Tab,
	Tabs,
} from "@nextui-org/react";
import { addMonths, addWeeks } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
	FiAward,
	FiBookOpen,
	FiChevronLeft,
	FiChevronRight,
	FiSettings,
	FiUsers,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { ArenaCompetitionEnrollmentClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import type { CompetitionType } from "~/codegen/ArenaCompetitionEnrollment.types";
import { ArenaLeagueModuleClient } from "~/codegen/ArenaLeagueModule.client";
import { ArenaTournamentModuleClient } from "~/codegen/ArenaTournamentModule.client";
import { ArenaWagerModuleClient } from "~/codegen/ArenaWagerModule.client";
import {
	type CreateCompetitionFormValues,
	CreateCompetitionSchema,
} from "~/config/schemas/CreateCompetitionSchema";
import {
	CategoryProvider,
	useCategoryContext,
} from "~/contexts/CategoryContext";
import {
	convertToEscrowInstantiate,
	convertToExpiration,
} from "~/helpers/SchemaHelpers";
import { useEnv } from "~/hooks/useEnv";
import BasicInformationForm from "./components/BasicInformationForm";
import MembersAndDuesForm from "./components/DirectParticipationForm";
import EnrollmentInformationForm from "./components/EnrollmentInformationForm";
import LeagueInformationForm from "./components/LeagueInformationForm";
import ReviewCompetition from "./components/ReviewCompetition";
import RulesAndRulesetsForm from "./components/RulesAndRulesetsForm";
import TournamentInformationForm from "./components/TournamentInformationForm";

const CreateCompetitionPage = () => {
	const [activeTab, setActiveTab] = useState(0);
	const { data: env } = useEnv();
	const params = useSearchParams();
	const category = useCategoryContext(params.get("category"));
	const router = useRouter();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);

	const formMethods = useForm<CreateCompetitionFormValues>({
		resolver: zodResolver(CreateCompetitionSchema),
		defaultValues: {
			competitionType: "wager",
			useCrowdfunding: false,
			name: "",
			description: "",
			expiration: { at_time: addMonths(new Date(), 1).toISOString() },
			rules: [{ rule: "" }],
			rulesets: [],
			additionalLayeredFees: [],
			directParticipation: {
				membersFromDues: true,
				shouldActivateOnFunded: true,
			},
			leagueInfo: {
				matchWinPoints: 3,
				matchDrawPoints: 1,
				matchLosePoints: 0,
				distribution: [{ percent: 100 }],
			},
			tournamentInfo: {
				eliminationType: "single",
				playThirdPlace: true,
				distribution: [{ percent: 100 }],
			},
			enrollmentInfo: {
				maxMembers: 10,
				enrollment_expiration: {
					at_time: addWeeks(new Date(), 1).toISOString(),
				},
				isCreatorMember: false,
			},
		},
	});

	const { handleSubmit, watch, setValue } = formMethods;

	const useCrowdfunding = watch("useCrowdfunding");
	const competitionType = watch("competitionType");

	const tabs = [
		{ key: "basics", icon: FiAward, title: "Basics" },
		{ key: "rules", icon: FiBookOpen, title: "Rules" },
		{ key: "participants", icon: FiUsers, title: "Participants" },
		{ key: "review", icon: FiSettings, title: "Review" },
	];

	const handleTabChange = (index: number) => {
		setActiveTab(index);
	};

	const handleNext = () => {
		if (activeTab < tabs.length - 1) {
			setActiveTab(activeTab + 1);
		}
	};

	const handlePrevious = () => {
		if (activeTab > 0) {
			setActiveTab(activeTab - 1);
		}
	};

	const onSubmit = useCallback(
		async (values: CreateCompetitionFormValues) => {
			try {
				const client = await getSigningCosmWasmClient();
				if (!address) throw new Error("Could not get user address");

				let result: ExecuteResult;

				const categoryId = category?.category_id?.toString();
				const commonMsg = {
					name: values.name,
					description: values.description,
					expiration: convertToExpiration(values.expiration),
					rules: values.rules.map((r) => r.rule),
					rulesets: values.rulesets.map((r) => r.ruleset_id.toString()),
					banner: values.banner,
				};

				if (values.useCrowdfunding) {
					if (!values.enrollmentInfo) {
						throw new Error(
							"Enrollment information is required for crowdfunding",
						);
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
								throw new Error(
									"League information is required for league competitions",
								);
							}
							competitionType = {
								league: {
									distribution: values.leagueInfo.distribution.map((mp) =>
										mp.percent.toString(),
									),
									match_win_points: values.leagueInfo.matchWinPoints.toString(),
									match_draw_points:
										values.leagueInfo.matchDrawPoints.toString(),
									match_lose_points:
										values.leagueInfo.matchLosePoints.toString(),
								},
							};
							break;
						case "tournament":
							if (!values.tournamentInfo) {
								throw new Error(
									"Tournament information is required for tournament competitions",
								);
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
							throw new Error(
								`Invalid competition type: ${values.competitionType}`,
							);
					}

					result = await enrollmentClient.createEnrollment({
						categoryId,
						competitionType,
						competitionInfo: {
							...commonMsg,
							additional_layered_fees: values.additionalLayeredFees?.map(
								(x) => {
									return { receiver: x.addr, tax: x.percentage.toString() };
								},
							),
						},
						maxMembers: values.enrollmentInfo.maxMembers.toString(),
						minMembers: values.enrollmentInfo.minMembers?.toString(),
						entryFee: values.enrollmentInfo.entryFee,
						expiration: convertToExpiration(
							values.enrollmentInfo.enrollment_expiration,
						),
						isCreatorMember: values.enrollmentInfo.isCreatorMember,
					});

					// Extract competition ID from the result
					let enrollmentId: string | undefined;
					for (const event of result.events) {
						for (const attribute of event.attributes) {
							if (attribute.key === "id") {
								enrollmentId = attribute.value;
								break;
							}
						}
						if (enrollmentId) break;
					}

					// Redirect to the appropriate page
					if (enrollmentId) {
						router.push(
							`/enrollment/view?${category?.url ? `category=${category.url}&` : ""}enrollmentId=${enrollmentId}`,
						);
					} else {
						console.warn("Enrollment created but ID not found in the result");
					}
				} else {
					if (!values.directParticipation) {
						throw new Error(
							"Direct participation information is required for crowdfunding",
						);
					}

					// Construct the members array based on the logic
					let members: string[] = [];
					if (values.directParticipation.membersFromDues) {
						members = values.directParticipation.dues
							? values.directParticipation.dues.map((due) => due.addr)
							: [];
					} else if (values.directParticipation.members) {
						members = values.directParticipation.members.map(
							(member) => member.address,
						);
					}

					const escrow =
						values.directParticipation.dues &&
						values.directParticipation.dues.length > 0
							? convertToEscrowInstantiate(
									env.CODE_ID_ESCROW,
									values.directParticipation.dues,
									values.additionalLayeredFees,
								)
							: undefined;

					switch (values.competitionType) {
						case "wager": {
							const wagerClient = new ArenaWagerModuleClient(
								client,
								address,
								env.ARENA_WAGER_MODULE_ADDRESS,
							);
							result = await wagerClient.createCompetition({
								...commonMsg,
								categoryId,
								escrow,
								shouldActivateOnFunded:
									values.directParticipation.shouldActivateOnFunded,
								instantiateExtension: {
									registered_members:
										members.length === 2 ? members : undefined,
								},
							});
							break;
						}
						case "league": {
							if (!values.leagueInfo) {
								throw new Error(
									"League information is required for league competitions",
								);
							}
							const leagueClient = new ArenaLeagueModuleClient(
								client,
								address,
								env.ARENA_LEAGUE_MODULE_ADDRESS,
							);
							result = await leagueClient.createCompetition({
								...commonMsg,
								categoryId,
								escrow,
								shouldActivateOnFunded:
									values.directParticipation.shouldActivateOnFunded,
								instantiateExtension: {
									distribution: values.leagueInfo.distribution.map((mp) =>
										mp.percent.toString(),
									),
									match_win_points: values.leagueInfo.matchWinPoints.toString(),
									match_draw_points:
										values.leagueInfo.matchDrawPoints.toString(),
									match_lose_points:
										values.leagueInfo.matchLosePoints.toString(),
									teams: members,
								},
							});
							break;
						}
						case "tournament": {
							if (!values.tournamentInfo) {
								throw new Error(
									"Tournament information is required for tournament competitions",
								);
							}
							const tournamentClient = new ArenaTournamentModuleClient(
								client,
								address,
								env.ARENA_TOURNAMENT_MODULE_ADDRESS,
							);

							result = await tournamentClient.createCompetition({
								...commonMsg,
								escrow,
								categoryId,
								shouldActivateOnFunded:
									values.directParticipation.shouldActivateOnFunded,
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
									teams: members,
								},
							});

							// Extract competition ID from the result
							let competitionId: string | undefined;
							for (const event of result.events) {
								for (const attribute of event.attributes) {
									if (attribute.key === "competition_id") {
										competitionId = attribute.value;
										break;
									}
								}
								if (competitionId) break;
							}

							// Redirect to the appropriate page
							if (competitionId) {
								router.push(
									`/${competitionType}/view?${category?.url ? `category=${category.url}&` : ""}competitionId=${competitionId}`,
								);
							} else {
								console.warn(
									"Competition created but ID not found in the result",
								);
							}
							break;
						}
						default:
							throw new Error(
								`Invalid competition type: ${values.competitionType}`,
							);
					}
				}

				toast.success(`The ${values.competitionType} was created successfully`);
				// biome-ignore lint/suspicious/noExplicitAny: try-catch
			} catch (e: any) {
				console.error(e);
				toast.error(e.toString());
			}
		},
		[getSigningCosmWasmClient, address, category, env, router, competitionType],
	);

	return (
		<CategoryProvider value={category?.url}>
			<div className="container mx-auto space-y-4 p-4">
				<h1 className="pb-6 text-center text-5xl">Create a Competition</h1>

				<FormProvider {...formMethods}>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
						<Tabs
							aria-label="Competition Creation Tabs"
							color="primary"
							variant="bordered"
							selectedKey={tabs[activeTab]?.key}
							onSelectionChange={(key) =>
								handleTabChange(tabs.findIndex((tab) => tab.key === key))
							}
						>
							{tabs.map((tab) => (
								<Tab
									key={tab.key}
									title={
										<div className="flex items-center space-x-2">
											<tab.icon />
											<span>{tab.title}</span>
										</div>
									}
								>
									{tab.key === "review" ? (
										<ReviewCompetition />
									) : (
										<Card>
											<CardBody>
												{tab.key === "basics" && (
													<>
														<div className="flex flex-col items-start justify-between gap-2 pb-4 sm:flex-row sm:items-center sm:gap-0">
															<h3>Competition Info</h3>
															{category && <h3>Category: {category.title}</h3>}
														</div>
														<BasicInformationForm />
														{competitionType === "league" && (
															<>
																<Divider className="my-6" />
																<LeagueInformationForm />
															</>
														)}
														{competitionType === "tournament" && (
															<>
																<Divider className="my-6" />
																<TournamentInformationForm />
															</>
														)}
													</>
												)}
												{tab.key === "rules" && <RulesAndRulesetsForm />}
												{tab.key === "participants" && (
													<>
														<div className="flex flex-col items-start justify-between gap-2 pb-4 sm:flex-row sm:items-center sm:gap-0">
															<h3>Participation Details</h3>
															<Switch
																isSelected={useCrowdfunding}
																onValueChange={(checked) =>
																	setValue("useCrowdfunding", checked)
																}
															>
																Use Crowdfunding
															</Switch>
														</div>
														{useCrowdfunding ? (
															<EnrollmentInformationForm />
														) : (
															<MembersAndDuesForm />
														)}
													</>
												)}
											</CardBody>
										</Card>
									)}
								</Tab>
							))}
						</Tabs>

						<div className="mt-8 flex justify-between">
							<Button
								onClick={handlePrevious}
								isDisabled={activeTab === 0}
								startContent={<FiChevronLeft />}
							>
								Previous
							</Button>
							<Button
								onClick={handleNext}
								isDisabled={activeTab === tabs.length - 1}
								endContent={<FiChevronRight />}
							>
								Next
							</Button>
						</div>
					</form>
				</FormProvider>
			</div>
		</CategoryProvider>
	);
};

export default CreateCompetitionPage;
