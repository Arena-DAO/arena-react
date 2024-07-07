"use client";

import CompetitionCard from "@/components/competition/CompetitionCard";
import { Button, Spinner } from "@nextui-org/react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArenaCompetitionEnrollmentQueryClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import { arenaCompetitionEnrollmentQueryKeys } from "~/codegen/ArenaCompetitionEnrollment.react-query";
import type { EnrollmentEntryResponse } from "~/codegen/ArenaCompetitionEnrollment.types";
import type { CategoryLeaf } from "~/hooks/useCategories";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface CompetitionModuleSectionProps {
	category: CategoryLeaf;
}

const CompetitionEnrollmentItems = ({
	category,
}: CompetitionModuleSectionProps) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const queryClient = useQueryClient();

	const fetchEnrollments = async ({ pageParam = undefined }) => {
		if (!cosmWasmClient) {
			throw Error("Could not get CosmWasm client");
		}

		const client = new ArenaCompetitionEnrollmentQueryClient(
			cosmWasmClient,
			env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
		);

		const data = await client.enrollments({
			startAfter: pageParam,
			filter: { category: { category_id: category.category_id?.toString() } },
		});

		for (const enrollment of data) {
			queryClient.setQueryData<EnrollmentEntryResponse | undefined>(
				arenaCompetitionEnrollmentQueryKeys.enrollment(
					env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
					{ enrollmentId: enrollment.id },
				),
				() => enrollment,
			);
		}

		return {
			items: data,
			nextCursor:
				data.length === env.PAGINATION_LIMIT
					? data[data.length - 1]?.id
					: undefined,
		};
	};

	const query = useInfiniteQuery({
		queryKey: arenaCompetitionEnrollmentQueryKeys.enrollments(
			env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
			{
				filter: {
					category: { category_id: category.category_id?.toString() },
				},
				limit: env.PAGINATION_LIMIT,
			},
		),
		queryFn: fetchEnrollments,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: !!cosmWasmClient,
	});

	const enrollments = useMemo(
		() => query.data?.pages.flatMap((page) => page.items) ?? [],
		[query.data],
	);

	if (!cosmWasmClient || query.isInitialLoading) {
		return (
			<div className="flex justify-center">
				<Spinner />
			</div>
		);
	}

	if (enrollments.length === 0) {
		return <h3>No competitions yet...</h3>;
	}

	return (
		<div>
			<div className="grid grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{enrollments.map((enrollment) => (
					<CompetitionCard
						key={enrollment.id.toString()}
						competition={enrollment}
					/>
				))}
			</div>
			{query.hasNextPage && (
				<div className="mt-4 flex justify-center">
					<Button
						onClick={() => query.fetchNextPage()}
						isLoading={query.isFetchingNextPage}
					>
						Load More
					</Button>
				</div>
			)}
		</div>
	);
};

export default CompetitionEnrollmentItems;
