import CompetitionCard from "@/components/competition/CompetitionCard";
import { Button, Spinner } from "@heroui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
// components/TournamentsList.tsx
import type React from "react";
import { ArenaTournamentModuleQueryClient } from "~/codegen/ArenaTournamentModule.client";
import { arenaTournamentModuleQueryKeys } from "~/codegen/ArenaTournamentModule.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface TournamentsListProps {
	hostAddress: string;
}

const TournamentsList: React.FC<TournamentsListProps> = ({ hostAddress }) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();

	const tournamentsQuery = useInfiniteQuery({
		queryKey: arenaTournamentModuleQueryKeys.competitions(
			env.ARENA_TOURNAMENT_MODULE_ADDRESS,
			{
				filter: { host: hostAddress },
			},
		),
		queryFn: async ({ pageParam = undefined }) => {
			if (!cosmWasmClient) throw new Error("Could not get CosmWasm client");

			const client = new ArenaTournamentModuleQueryClient(
				cosmWasmClient,
				env.ARENA_TOURNAMENT_MODULE_ADDRESS,
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

	if (!cosmWasmClient || tournamentsQuery.isLoading) {
		return <Spinner label="Loading tournaments..." />;
	}

	return (
		<div className="gap-4">
			<div className="grid grid-cols-1 justify-items-center gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{tournamentsQuery.data?.pages.map((page) =>
					page.map((x) => (
						<CompetitionCard key={x.id} competition={x} hideHost />
					)),
				)}
			</div>
			{tournamentsQuery.hasNextPage && (
				<Button
					onPress={() => tournamentsQuery.fetchNextPage()}
					disabled={tournamentsQuery.isFetchingNextPage}
				>
					{tournamentsQuery.isFetchingNextPage
						? "Loading more..."
						: "Load More"}
				</Button>
			)}
			{(tournamentsQuery.data?.pages[0]?.length ?? 0) === 0 && (
				<p>No tournaments found.</p>
			)}
		</div>
	);
};

export default TournamentsList;
