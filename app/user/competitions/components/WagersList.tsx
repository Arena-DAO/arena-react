import CompetitionCard from "@/components/competition/CompetitionCard";
import { Button, Spinner } from "@nextui-org/react";
import { useInfiniteQuery } from "@tanstack/react-query";
// components/WagersList.tsx
import type React from "react";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { arenaWagerModuleQueryKeys } from "~/codegen/ArenaWagerModule.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface WagersListProps {
	hostAddress: string;
}

const WagersList: React.FC<WagersListProps> = ({ hostAddress }) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);

	const wagersQuery = useInfiniteQuery({
		queryKey: arenaWagerModuleQueryKeys.competitions(
			env.ARENA_WAGER_MODULE_ADDRESS,
			{
				filter: { host: hostAddress },
			},
		),
		queryFn: async ({ pageParam = undefined }) => {
			if (!cosmWasmClient) throw new Error("Could not get CosmWasm client");

			const client = new ArenaWagerModuleQueryClient(
				cosmWasmClient,
				env.ARENA_WAGER_MODULE_ADDRESS,
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

	if (!cosmWasmClient || wagersQuery.isLoading) {
		return <Spinner label="Loading wagers..." />;
	}

	return (
		<div className="gap-4">
			<div className="grid grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{wagersQuery.data?.pages.map((page) =>
					page.map((x) => (
						<CompetitionCard key={x.id} competition={x} hideHost />
					)),
				)}
			</div>
			{wagersQuery.hasNextPage && (
				<Button
					onPress={() => wagersQuery.fetchNextPage()}
					disabled={wagersQuery.isFetchingNextPage}
				>
					{wagersQuery.isFetchingNextPage ? "Loading more..." : "Load More"}
				</Button>
			)}
			{(wagersQuery.data?.pages[0]?.length ?? 0) === 0 && (
				<p>No wagers found.</p>
			)}
		</div>
	);
};

export default WagersList;
