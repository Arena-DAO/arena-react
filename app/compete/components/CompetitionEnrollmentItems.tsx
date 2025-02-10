"use client";

import CompetitionCard from "@/components/competition/CompetitionCard";
import type Competition from "@/components/competition/CompetitionCard";
import { Button, Spinner } from "@heroui/react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArenaCompetitionEnrollmentQueryClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import { arenaCompetitionEnrollmentQueryKeys } from "~/codegen/ArenaCompetitionEnrollment.react-query";
import type { EnrollmentEntryResponse } from "~/codegen/ArenaCompetitionEnrollment.types";
import { ArenaCoreQueryClient } from "~/codegen/ArenaCore.client";
import { useArenaCoreQueryExtensionQuery } from "~/codegen/ArenaCore.react-query";
import { ArenaLeagueModuleQueryClient } from "~/codegen/ArenaLeagueModule.client";
import { arenaLeagueModuleQueryKeys } from "~/codegen/ArenaLeagueModule.react-query";
import type { CompetitionResponseForLeagueExt } from "~/codegen/ArenaLeagueModule.types";
import { ArenaTournamentModuleQueryClient } from "~/codegen/ArenaTournamentModule.client";
import { arenaTournamentModuleQueryKeys } from "~/codegen/ArenaTournamentModule.react-query";
import type { CompetitionResponseForTournamentExt } from "~/codegen/ArenaTournamentModule.types";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { arenaWagerModuleQueryKeys } from "~/codegen/ArenaWagerModule.react-query";
import type { CompetitionResponseForWagerExt } from "~/codegen/ArenaWagerModule.types";
import type { CategoryLeaf } from "~/hooks/useCategoryMap";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface CompetitionSectionProps<T> {
	title: string;
	competitions: T[];
	hasNextPage?: boolean;
	fetchNextPage?: () => void;
	isLoading?: boolean;
}

function CompetitionSection<T extends Competition>({
	title,
	competitions,
	hasNextPage,
	fetchNextPage,
	isLoading,
}: CompetitionSectionProps<T>) {
	if (competitions.length === 0) return null;

	return (
		<section className="mb-12">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="font-bold text-2xl">{title}</h2>
				{hasNextPage && (
					<Button variant="ghost" onPress={fetchNextPage} isLoading={isLoading}>
						Load More
					</Button>
				)}
			</div>
			<div className="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{competitions.map((competition) => (
					<CompetitionCard
						key={competition.id.toString()}
						competition={competition}
					/>
				))}
			</div>
		</section>
	);
}

export default function CompetitionsView({
	category,
}: { category: CategoryLeaf }) {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const queryClient = useQueryClient();

	// Always fetch core data first
	const coreQuery = useArenaCoreQueryExtensionQuery({
		client:
			cosmWasmClient &&
			new ArenaCoreQueryClient(cosmWasmClient, env.ARENA_CORE_ADDRESS),
		args: {
			msg: {
				competitions: {
					enrollment_module: env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
					filter: { category: { id: category.category_id?.toString() } },
				},
			},
		},
	});

	// Process initial data from core query
	const initialData = useMemo(() => {
		if (!coreQuery.data) return null;

		// Parse the binary data - implement actual parsing logic
		const parsedData = {
			leagues: [] as CompetitionResponseForLeagueExt[],
			tournaments: [] as CompetitionResponseForTournamentExt[],
			wagers: [] as CompetitionResponseForWagerExt[],
			enrollments: [] as EnrollmentEntryResponse[],
		};

		// Process leagues
		for (const league of parsedData.leagues) {
			queryClient.setQueryData(
				arenaLeagueModuleQueryKeys.competition(
					env.ARENA_LEAGUE_MODULE_ADDRESS,
					{ competitionId: league.id },
				),
				league,
			);
		}

		// Process tournaments
		for (const tournament of parsedData.tournaments) {
			queryClient.setQueryData(
				arenaTournamentModuleQueryKeys.competition(
					env.ARENA_TOURNAMENT_MODULE_ADDRESS,
					{ competitionId: tournament.id },
				),
				tournament,
			);
		}

		// Process wagers
		for (const wager of parsedData.wagers) {
			queryClient.setQueryData(
				arenaWagerModuleQueryKeys.competition(env.ARENA_WAGER_MODULE_ADDRESS, {
					competitionId: wager.id,
				}),
				wager,
			);
		}

		// Process enrollments
		for (const enrollment of parsedData.enrollments) {
			queryClient.setQueryData(
				arenaCompetitionEnrollmentQueryKeys.enrollment(
					env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
					{ enrollmentId: enrollment.id },
				),
				enrollment,
			);
		}

		return parsedData;
	}, [coreQuery.data, queryClient, env]);

	// All infinite queries are always initialized, but only enabled when conditions are met
	const leaguesQuery = useInfiniteQuery({
		queryKey: arenaLeagueModuleQueryKeys.competitions(
			env.ARENA_LEAGUE_MODULE_ADDRESS,
		),
		queryFn: async ({ pageParam }) => {
			if (!cosmWasmClient) return { items: [], nextCursor: undefined };

			const client = new ArenaLeagueModuleQueryClient(
				cosmWasmClient,
				env.ARENA_LEAGUE_MODULE_ADDRESS,
			);
			const data = await client.competitions({
				startAfter: pageParam,
				filter: { category: { id: category.category_id?.toString() } },
			});

			for (const league of data) {
				queryClient.setQueryData(
					arenaLeagueModuleQueryKeys.competition(
						env.ARENA_LEAGUE_MODULE_ADDRESS,
						{ competitionId: league.id },
					),
					league,
				);
			}

			return {
				items: data,
				nextCursor:
					data.length === env.PAGINATION_LIMIT
						? data[data.length - 1]?.id
						: undefined,
			};
		},
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: Boolean(cosmWasmClient && initialData),
		initialData: initialData
			? {
					pages: [
						{
							items: initialData.leagues,
							nextCursor:
								initialData.leagues[initialData.leagues.length - 1]?.id,
						},
					],
					pageParams: [undefined],
				}
			: undefined,
	});

	const tournamentsQuery = useInfiniteQuery({
		queryKey: arenaTournamentModuleQueryKeys.competitions(
			env.ARENA_TOURNAMENT_MODULE_ADDRESS,
		),
		queryFn: async ({ pageParam }) => {
			if (!cosmWasmClient) return { items: [], nextCursor: undefined };

			const client = new ArenaTournamentModuleQueryClient(
				cosmWasmClient,
				env.ARENA_TOURNAMENT_MODULE_ADDRESS,
			);
			const data = await client.competitions({
				startAfter: pageParam,
				filter: { category: { id: category.category_id?.toString() } },
			});

			for (const tournament of data) {
				queryClient.setQueryData(
					arenaTournamentModuleQueryKeys.competition(
						env.ARENA_TOURNAMENT_MODULE_ADDRESS,
						{ competitionId: tournament.id },
					),
					tournament,
				);
			}

			return {
				items: data,
				nextCursor:
					data.length === env.PAGINATION_LIMIT
						? data[data.length - 1]?.id
						: undefined,
			};
		},
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: Boolean(cosmWasmClient && initialData),
		initialData: initialData
			? {
					pages: [
						{
							items: initialData.tournaments,
							nextCursor:
								initialData.tournaments[initialData.tournaments.length - 1]?.id,
						},
					],
					pageParams: [undefined],
				}
			: undefined,
	});

	const wagersQuery = useInfiniteQuery({
		queryKey: arenaWagerModuleQueryKeys.competitions(
			env.ARENA_WAGER_MODULE_ADDRESS,
		),
		queryFn: async ({ pageParam }) => {
			if (!cosmWasmClient) return { items: [], nextCursor: undefined };

			const client = new ArenaWagerModuleQueryClient(
				cosmWasmClient,
				env.ARENA_WAGER_MODULE_ADDRESS,
			);
			const data = await client.competitions({
				startAfter: pageParam,
				filter: { category: { id: category.category_id?.toString() } },
			});

			for (const wager of data) {
				queryClient.setQueryData(
					arenaWagerModuleQueryKeys.competition(
						env.ARENA_WAGER_MODULE_ADDRESS,
						{ competitionId: wager.id },
					),
					wager,
				);
			}

			return {
				items: data,
				nextCursor:
					data.length === env.PAGINATION_LIMIT
						? data[data.length - 1]?.id
						: undefined,
			};
		},
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: Boolean(cosmWasmClient && initialData),
		initialData: initialData
			? {
					pages: [
						{
							items: initialData.wagers,
							nextCursor: initialData.wagers[initialData.wagers.length - 1]?.id,
						},
					],
					pageParams: [undefined],
				}
			: undefined,
	});

	const enrollmentsQuery = useInfiniteQuery({
		queryKey: arenaCompetitionEnrollmentQueryKeys.enrollments(
			env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
		),
		queryFn: async ({ pageParam }) => {
			if (!cosmWasmClient) return { items: [], nextCursor: undefined };

			const client = new ArenaCompetitionEnrollmentQueryClient(
				cosmWasmClient,
				env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
			);

			const data = await client.enrollments({
				startAfter: pageParam,
				filter: { category: { category_id: category.category_id?.toString() } },
			});

			for (const enrollment of data) {
				queryClient.setQueryData(
					arenaCompetitionEnrollmentQueryKeys.enrollment(
						env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
						{ enrollmentId: enrollment.id },
					),
					enrollment,
				);
			}

			return {
				items: data,
				nextCursor:
					data.length === env.PAGINATION_LIMIT
						? data[data.length - 1]?.id
						: undefined,
			};
		},
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: Boolean(cosmWasmClient && initialData),
		initialData: initialData
			? {
					pages: [
						{
							items: initialData.enrollments,
							nextCursor:
								initialData.enrollments[initialData.enrollments.length - 1]?.id,
						},
					],
					pageParams: [undefined],
				}
			: undefined,
	});

	// Memoize all combined data
	const allData = useMemo(
		() => ({
			leagues: leaguesQuery.data?.pages.flatMap((page) => page.items) ?? [],
			tournaments:
				tournamentsQuery.data?.pages.flatMap((page) => page.items) ?? [],
			wagers: wagersQuery.data?.pages.flatMap((page) => page.items) ?? [],
			enrollments:
				enrollmentsQuery.data?.pages.flatMap((page) => page.items) ?? [],
		}),
		[
			leaguesQuery.data,
			tournamentsQuery.data,
			wagersQuery.data,
			enrollmentsQuery.data,
		],
	);

	// Loading state
	if (!cosmWasmClient || coreQuery.isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	// Empty state
	if (
		allData.leagues.length === 0 &&
		allData.tournaments.length === 0 &&
		allData.wagers.length === 0 &&
		allData.enrollments.length === 0
	) {
		return (
			<div className="flex h-64 items-center justify-center text-gray-500">
				<p className="text-lg">No competitions found in this category</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<CompetitionSection
				title="Enrollments"
				competitions={allData.enrollments}
				hasNextPage={enrollmentsQuery.hasNextPage}
				fetchNextPage={enrollmentsQuery.fetchNextPage}
				isLoading={enrollmentsQuery.isFetchingNextPage}
			/>
			<CompetitionSection
				title="Leagues"
				competitions={allData.leagues}
				hasNextPage={leaguesQuery.hasNextPage}
				fetchNextPage={leaguesQuery.fetchNextPage}
				isLoading={leaguesQuery.isFetchingNextPage}
			/>
			<CompetitionSection
				title="Tournaments"
				competitions={allData.tournaments}
				hasNextPage={tournamentsQuery.hasNextPage}
				fetchNextPage={tournamentsQuery.fetchNextPage}
				isLoading={tournamentsQuery.isFetchingNextPage}
			/>
			<CompetitionSection
				title="Wagers"
				competitions={allData.wagers}
				hasNextPage={wagersQuery.hasNextPage}
				fetchNextPage={wagersQuery.fetchNextPage}
				isLoading={wagersQuery.isFetchingNextPage}
			/>
		</div>
	);
}
