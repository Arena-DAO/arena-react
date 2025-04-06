"use client";

import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Select,
	SelectItem,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	addToast,
} from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { arenaCoreQueryKeys } from "~/codegen/ArenaCore.react-query";
import { arenaEscrowQueryKeys } from "~/codegen/ArenaEscrow.react-query";
import {
	ArenaLeagueModuleClient,
	ArenaLeagueModuleQueryClient,
} from "~/codegen/ArenaLeagueModule.client";
import {
	arenaLeagueModuleQueryKeys,
	useArenaLeagueModuleExtensionMutation,
	useArenaLeagueModuleQueryExtensionQuery,
} from "~/codegen/ArenaLeagueModule.react-query";
import type {
	MatchResult,
	RoundResponse,
} from "~/codegen/ArenaLeagueModule.types";
import { useCategoryContext } from "~/contexts/CategoryContext";
import { LeagueResultValues } from "~/helpers/ArenaHelpers";
import { getCompetitionQueryKey } from "~/helpers/CompetitionHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import type { CompetitionResponse } from "~/types/CompetitionResponse";

interface RoundDisplayProps {
	leagueId: string;
	moduleAddr: string;
	roundNumber: string;
	escrow?: string | null;
}

const RoundDisplay = ({
	moduleAddr,
	leagueId,
	roundNumber,
	escrow,
}: RoundDisplayProps) => {
	const queryClient = useQueryClient();
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const category = useCategoryContext();
	const { data } = useArenaLeagueModuleQueryExtensionQuery({
		client:
			cosmWasmClient &&
			new ArenaLeagueModuleQueryClient(cosmWasmClient, moduleAddr),
		args: {
			msg: { round: { league_id: leagueId, round_number: roundNumber } },
		},
		options: { enabled: !!cosmWasmClient },
	});
	const roundMutation = useArenaLeagueModuleExtensionMutation();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [changeMap, setChangeMap] = useState(new Map<string, MatchResult>());
	// biome-ignore lint/correctness/useExhaustiveDependencies: We want to clear the change map if the round number changes
	useEffect(() => {
		setChangeMap(new Map());
	}, [roundNumber]);

	if (!data) return null;

	const parsedData = data as unknown as RoundResponse;
	const handleSelectionChange = (
		match_number: string,
		e: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const { value } = e.target;

		if (!value) {
			const updatedMap = new Map(changeMap);

			updatedMap.delete(match_number);

			setChangeMap(updatedMap);
		} else {
			setChangeMap((x) => new Map(x.set(match_number, value as MatchResult)));
		}
	};

	const onSubmit = async () => {
		try {
			setIsSubmitting(true);
			const cosmWasmClient = await getSigningCosmWasmClient();
			if (!address) throw "Could not get user address";
			if (changeMap.size === 0) throw "No round updates given";

			const leagueModuleClient = new ArenaLeagueModuleClient(
				cosmWasmClient,
				address,
				env.ARENA_LEAGUE_MODULE_ADDRESS,
			);

			await roundMutation.mutateAsync(
				{
					client: leagueModuleClient,
					msg: {
						msg: {
							process_match: {
								league_id: leagueId,
								round_number: roundNumber,
								match_results: Array.from(changeMap.entries()).map((x) => ({
									match_number: x[0],
									match_result: x[1],
								})),
							},
						},
					},
				},
				{
					onSuccess: async (response) => {
						addToast({
							color: "success",
							description: "The results were submitted",
						});

						queryClient.setQueryData<string | undefined>(
							arenaLeagueModuleQueryKeys.queryExtension(
								env.ARENA_LEAGUE_MODULE_ADDRESS,
								{
									msg: {
										round: { league_id: leagueId, round_number: roundNumber },
									},
								},
							),
							(old) => {
								if (old) {
									const parsedData = data as unknown as RoundResponse;

									for (const change of changeMap) {
										const foundData = parsedData.matches.find(
											(x) => x.match_number === change[0],
										);
										if (foundData) {
											foundData.result = change[1];
										}
									}

									return parsedData as unknown as string;
								}

								return old;
							},
						);

						await queryClient.invalidateQueries(
							arenaLeagueModuleQueryKeys.queryExtension(
								env.ARENA_LEAGUE_MODULE_ADDRESS,
								{ msg: { leaderboard: { league_id: leagueId } } },
							),
						);

						if (category?.category_id) {
							const ratingAdjustmentsEvent = response.events.find((event) =>
								event.attributes.find(
									(attr) =>
										attr.key === "action" && attr.value === "adjust_ratings",
								),
							);
							if (ratingAdjustmentsEvent) {
								for (const attr of ratingAdjustmentsEvent.attributes) {
									if (attr.key === "action") continue;

									queryClient.setQueryData<string | undefined>(
										arenaCoreQueryKeys.queryExtension(env.ARENA_CORE_ADDRESS, {
											msg: {
												rating: {
													addr: attr.key,
													category_id: category.category_id,
												},
											},
										}),
										() => attr.value,
									);
								}
							}
						}

						if (
							response.events.find((event) =>
								event.attributes.find(
									(attr) =>
										attr.key === "action" &&
										attr.value === "process_competition",
								),
							)
						) {
							queryClient.setQueryData<CompetitionResponse | undefined>(
								getCompetitionQueryKey(env, "league", leagueId),
								(old) => {
									if (old) {
										return { ...old, status: "inactive" };
									}
									return old;
								},
							);

							if (escrow) {
								await queryClient.invalidateQueries(
									arenaEscrowQueryKeys.dumpState(escrow, { addr: address }),
								);
								await queryClient.invalidateQueries(
									arenaEscrowQueryKeys.balances(escrow),
								);
							}

							addToast({
								color: "success",
								description: "The league is now fully processed",
							});
						}
					},
				},
			);
		} catch (e) {
			console.error(e);
			addToast({ color: "danger", description: (e as Error).toString() });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<Table aria-label="Leaderboard" removeWrapper>
				<TableHeader>
					<TableColumn>Team 1</TableColumn>
					<TableColumn>Team 2</TableColumn>
					<TableColumn>Action</TableColumn>
				</TableHeader>
				<TableBody items={parsedData.matches}>
					{(x) => (
						<TableRow key={x.match_number}>
							<TableCell>
								<Profile address={x.team_1} />
							</TableCell>
							<TableCell>
								<Profile address={x.team_2} />
							</TableCell>
							<TableCell>
								<Select
									label="Result"
									className="min-w-52"
									isRequired={!!x.result}
									value={changeMap.get(x.match_number)}
									defaultSelectedKeys={x.result ? [x.result] : undefined}
									onChange={(e) => handleSelectionChange(x.match_number, e)}
									variant="bordered"
								>
									{LeagueResultValues.map((x) => (
										<SelectItem key={x.value}>{x.display}</SelectItem>
									))}
								</Select>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<div className="flex">
				<Button
					type="submit"
					className="ml-auto"
					onPress={onSubmit}
					isDisabled={changeMap.size === 0 || isSubmitting}
				>
					Submit
				</Button>
			</div>
		</>
	);
};

export default RoundDisplay;
