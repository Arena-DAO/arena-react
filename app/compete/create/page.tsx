"use client";

import type { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Divider,
	Switch,
	Tab,
	Tabs,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FiAward, FiBookOpen, FiUsers } from "react-icons/fi";
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
	convertToEscrowInstantiate,
	convertToExpiration,
} from "~/helpers/SchemaHelpers";
import { useCategory } from "~/hooks/useCategory";
import { useEnv } from "~/hooks/useEnv";
import BasicInformationForm from "./components/BasicInformationForm";
import EnrollmentInformationForm from "./components/EnrollmentInformationForm";
import LeagueInformationForm from "./components/LeagueInformationForm";
import MembersAndDuesForm from "./components/MembersAndDuesForm";
import RulesAndRulesetsForm from "./components/RulesAndRulesetsForm";
import TournamentInformationForm from "./components/TournamentInformationForm";

const CreateCompetitionPage = () => {
	const { data: env } = useEnv();
	const { data: category } = useCategory();
	const router = useRouter();
	const { getSigningCosmWasmClient, address, isWalletConnected } = useChain(
		env.CHAIN,
	);

	const formMethods = useForm<CreateCompetitionFormValues>({
		resolver: zodResolver(CreateCompetitionSchema),
		defaultValues: {
			competitionType: "wager",
			useCrowdfunding: false,
			name: "",
			description: "",
			expiration: { at_time: new Date().toISOString() },
			rules: [{ rule: "" }],
			rulesets: [],
			dues: [{ addr: "", balance: { native: [], cw20: [], cw721: [] } }],
			membersFromDues: true,
			members: [{ address: "" }],
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
				minMembers: 2,
				entryFee: { amount: "", denom: "" },
				enrollment_expiration: { at_time: new Date().toISOString() },
			},
		},
	});

	const {
		handleSubmit,
		watch,
		setValue,
		formState: { isValid, isSubmitting },
	} = formMethods;

	const useCrowdfunding = watch("useCrowdfunding");
	const competitionType = watch("competitionType");

	useEffect(() => {
		if (address) {
			setValue("host", address);
		}
	}, [address, setValue]);

	const onSubmit = useCallback(
		async (values: CreateCompetitionFormValues) => {
			try {
				const client = await getSigningCosmWasmClient();
				if (!address) throw new Error("Could not get user address");

				let result: ExecuteResult;

				const commonMsg = {
					categoryId: category?.category_id?.toString(),
					name: values.name,
					description: values.description,
					expiration: convertToExpiration(values.expiration),
					rules: values.rules.map((r) => r.rule),
					rulesets: values.rulesets.map((r) => r.ruleset_id.toString()),
					host: { existing: { addr: values.host ?? address } },
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
						categoryId: commonMsg.categoryId,
						competitionType,
						competitionInfo: {
							name: commonMsg.name,
							description: commonMsg.description,
							expiration: commonMsg.expiration,
							rules: commonMsg.rules,
							rulesets: commonMsg.rulesets,
							additional_layered_fees: values.additionalLayeredFees?.map(
								(x) => {
									return { receiver: x.addr, tax: x.percentage.toString() };
								},
							),
						},
						maxMembers: values.enrollmentInfo.maxMembers.toString(),
						minMembers: values.enrollmentInfo.minMembers.toString(),
						entryFee: values.enrollmentInfo.entryFee,
						isCreatorMember: true,
						expiration: values.enrollmentInfo.enrollment_expiration,
					});
				} else {
					const escrow = convertToEscrowInstantiate(
						env.CODE_ID_ESCROW,
						values.dues,
						values.additionalLayeredFees,
					);

					switch (values.competitionType) {
						case "wager": {
							const wagerClient = new ArenaWagerModuleClient(
								client,
								address,
								env.ARENA_WAGER_MODULE_ADDRESS,
							);
							result = await wagerClient.createCompetition({
								...commonMsg,
								escrow,
								instantiateExtension: {
									registered_members:
										values.dues.length === 2
											? values.dues.map((d) => d.addr)
											: undefined,
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
								escrow,
								instantiateExtension: {
									distribution: values.leagueInfo.distribution.map((mp) =>
										mp.percent.toString(),
									),
									match_win_points: values.leagueInfo.matchWinPoints.toString(),
									match_draw_points:
										values.leagueInfo.matchDrawPoints.toString(),
									match_lose_points:
										values.leagueInfo.matchLosePoints.toString(),
									teams: values.dues.map((d) => d.addr),
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
									teams: values.dues.map((d) => d.addr),
								},
							});
							break;
						}
						default:
							throw new Error(
								`Invalid competition type: ${values.competitionType}`,
							);
					}
				}

				toast.success(`The ${values.competitionType} was created successfully`);

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
					if (values.useCrowdfunding) {
						router.push(`/enrollments/${competitionId}`);
					} else {
						router.push(
							`/compete/view?category=${category?.url}&competitionId=${competitionId}&type=${values.competitionType}`,
						);
					}
				} else {
					console.warn("Competition created but ID not found in the result");
				}
				// biome-ignore lint/suspicious/noExplicitAny: try-catch
			} catch (e: any) {
				console.error(e);
				toast.error(e.toString());
			}
		},
		[getSigningCosmWasmClient, address, category, env, router],
	);

	return (
		<div className="mx-auto w-full max-w-screen-xl justify-center space-y-8 px-4 py-12 lg:px-8 sm:px-6">
			<h1 className="mb-8 text-center font-bold text-5xl">
				Create a Competition
			</h1>

			<FormProvider {...formMethods}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
					<Card>
						<CardHeader className="flex flex-col gap-1">
							<h2 className="flex items-center font-semibold text-2xl">
								<FiAward className="mr-2" /> Competition Details
							</h2>
						</CardHeader>
						<CardBody>
							<Tabs
								aria-label="Competition Type"
								selectedKey={competitionType}
								onSelectionChange={(key) =>
									setValue(
										"competitionType",
										key as "wager" | "league" | "tournament",
									)
								}
							>
								<Tab key="wager" title="Wager">
									<BasicInformationForm />
								</Tab>
								<Tab key="league" title="League">
									<BasicInformationForm />
									<Divider className="my-6" />
									<LeagueInformationForm />
								</Tab>
								<Tab key="tournament" title="Tournament">
									<BasicInformationForm />
									<Divider className="my-6" />
									<TournamentInformationForm />
								</Tab>
							</Tabs>
						</CardBody>
					</Card>

					<Card>
						<CardHeader className="flex flex-col gap-1">
							<h2 className="flex items-center font-semibold text-2xl">
								<FiBookOpen className="mr-2" /> Rules and Rulesets
							</h2>
						</CardHeader>
						<CardBody>
							<RulesAndRulesetsForm />
						</CardBody>
					</Card>

					<Card>
						<CardHeader className="flex items-center justify-between">
							<h2 className="flex items-center font-semibold text-2xl">
								<FiUsers className="mr-2" /> Participation Details
							</h2>
							<Switch
								isSelected={useCrowdfunding}
								onValueChange={(checked) =>
									formMethods.setValue("useCrowdfunding", checked)
								}
							>
								Use Crowdfunding
							</Switch>
						</CardHeader>
						<CardBody>
							{useCrowdfunding ? (
								<EnrollmentInformationForm />
							) : (
								<MembersAndDuesForm />
							)}
						</CardBody>
					</Card>

					<div className="flex justify-center">
						<Button
							type="submit"
							color="primary"
							size="lg"
							isDisabled={!isValid}
							isLoading={isSubmitting}
							className="px-8 py-2 font-semibold text-lg"
						>
							Create Competition
						</Button>
					</div>
				</form>
			</FormProvider>
		</div>
	);
};

export default CreateCompetitionPage;
