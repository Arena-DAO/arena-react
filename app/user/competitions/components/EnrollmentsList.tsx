import type React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button, Spinner } from "@nextui-org/react";
import { ArenaCompetitionEnrollmentQueryClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import EnrollmentCard from "@/compete/components/EnrollmentCard";

interface EnrollmentsListProps {
	hostAddress: string;
}

const EnrollmentsList: React.FC<EnrollmentsListProps> = ({ hostAddress }) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);

	const enrollmentQuery = useInfiniteQuery({
		queryKey: ["enrollments", hostAddress],
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

	if (enrollmentQuery.isLoading) {
		return <Spinner label="Loading enrollments..." />;
	}

	return (
		<div className="gap-4">
			<div className="grid grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{enrollmentQuery.data?.pages.map((page) =>
					page.map((x) => <EnrollmentCard key={x.id} enrollment={x} />),
				)}
			</div>
			{enrollmentQuery.hasNextPage && (
				<Button
					onClick={() => enrollmentQuery.fetchNextPage()}
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
