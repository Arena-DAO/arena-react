"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArenaCompetitionEnrollmentQueryClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import { arenaCompetitionEnrollmentQueryKeys } from "~/codegen/ArenaCompetitionEnrollment.react-query";
import type { CategoryLeaf } from "~/hooks/useCategories";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import EnrollmentCard from "./EnrollmentCard";
import { Spinner } from "@nextui-org/react";
import type { EnrollmentEntryResponse } from "~/codegen/ArenaCompetitionEnrollment.types";

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
			return { items: [] };
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
					{ id: enrollment.id },
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

	const queryKey = useMemo(
		() =>
			arenaCompetitionEnrollmentQueryKeys.enrollments(
				env?.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
				{
					filter: {
						category: { category_id: category.category_id?.toString() },
					},
				},
			),
		[env.ARENA_COMPETITION_ENROLLMENT_ADDRESS, category.category_id],
	);

	const query = useInfiniteQuery({
		queryKey,
		queryFn: fetchEnrollments,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
	});

	const enrollments = useMemo(
		() => query.data?.pages.flatMap((page) => page.items) ?? [],
		[query.data],
	);

	if (query.isInitialLoading) {
		return (
			<div className="flex justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{enrollments.map((enrollment) => (
				<EnrollmentCard
					key={enrollment.id.toString()}
					enrollment={enrollment}
				/>
			))}
		</div>
	);
};

export default CompetitionEnrollmentItems;
