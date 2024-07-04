import CompetitionCard from "@/components/competition/CompetitionCard";
import { Button, Spinner } from "@nextui-org/react";
import { useInfiniteQuery } from "@tanstack/react-query";
// components/LeaguesList.tsx
import type React from "react";
import { ArenaLeagueModuleQueryClient } from "~/codegen/ArenaLeagueModule.client";
import { arenaLeagueModuleQueryKeys } from "~/codegen/ArenaLeagueModule.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface LeaguesListProps {
	hostAddress: string;
}

const LeaguesList: React.FC<LeaguesListProps> = ({ hostAddress }) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);

	const leaguesQuery = useInfiniteQuery({
		queryKey: arenaLeagueModuleQueryKeys.competitions(
			env.ARENA_LEAGUE_MODULE_ADDRESS,
			{
				filter: { host: hostAddress },
			},
		),
		queryFn: async ({ pageParam = undefined }) => {
			if (!cosmWasmClient) throw new Error("Could not get CosmWasm client");

			const client = new ArenaLeagueModuleQueryClient(
				cosmWasmClient,
				env.ARENA_LEAGUE_MODULE_ADDRESS,
			);

			return client.competitions({
				filter: { host: hostAddress },
				startAfter: pageParam,
				limit: env.PAGINATION_LIMIT,
			});
		},
		getNextPageParam: (lastPage) =>
			lastPage.length === env.PAGINATION_LIMIT
				? lastPage[lastPage.length - 1]?.id
				: undefined,
		enabled: !!cosmWasmClient,
	});

	if (leaguesQuery.isLoading) {
		return <Spinner label="Loading leagues..." />;
	}

	return (
		<div className="gap-4">
			<div className="grid grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{leaguesQuery.data?.pages.map((page) =>
					page.map((x) => (
						<CompetitionCard key={x.id} competition={x} hideHost />
					)),
				)}
			</div>
			{leaguesQuery.hasNextPage && (
				<Button
					onClick={() => leaguesQuery.fetchNextPage()}
					disabled={leaguesQuery.isFetchingNextPage}
				>
					{leaguesQuery.isFetchingNextPage ? "Loading more..." : "Load More"}
				</Button>
			)}
			{(leaguesQuery.data?.pages[0]?.length ?? 0) === 0 && (
				<p>No leagues found.</p>
			)}
		</div>
	);
};

export default LeaguesList;
