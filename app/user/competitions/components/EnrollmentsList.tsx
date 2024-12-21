import CompetitionCard from "@/components/competition/CompetitionCard";
import { Button, Spinner } from "@nextui-org/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type React from "react";
import { ArenaCompetitionEnrollmentQueryClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import { arenaCompetitionEnrollmentQueryKeys } from "~/codegen/ArenaCompetitionEnrollment.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface EnrollmentsListProps {
	hostAddress: string;
}

const EnrollmentsList: React.FC<EnrollmentsListProps> = ({ hostAddress }) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();

	const enrollmentQuery = useInfiniteQuery({
		queryKey: arenaCompetitionEnrollmentQueryKeys.enrollments(
			env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
			{ filter: { host: hostAddress } },
		),
		queryFn: async ({ pageParam = undefined }) => {
			if (!cosmWasmClient) throw new Error("Could not get CosmWasm client");

			const client = new ArenaCompetitionEnrollmentQueryClient(
				cosmWasmClient,
				env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
			);

			return client.enrollments({
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

	if (!cosmWasmClient || enrollmentQuery.isLoading) {
		return <Spinner label="Loading enrollments..." />;
	}

	return (
		<div className="gap-4">
			<div className="grid grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{enrollmentQuery.data?.pages.map((page) =>
					page.map((x) => (
						<CompetitionCard key={x.id} competition={x} hideHost />
					)),
				)}
			</div>
			{enrollmentQuery.hasNextPage && (
				<Button
					onPress={() => enrollmentQuery.fetchNextPage()}
					disabled={enrollmentQuery.isFetchingNextPage}
				>
					{enrollmentQuery.isFetchingNextPage ? "Loading more..." : "Load More"}
				</Button>
			)}
			{(enrollmentQuery.data?.pages[0]?.length ?? 0) === 0 && (
				<p>No enrollments found.</p>
			)}
		</div>
	);
};

export default EnrollmentsList;
