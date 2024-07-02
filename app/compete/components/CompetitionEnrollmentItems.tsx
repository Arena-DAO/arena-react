"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArenaCompetitionEnrollmentQueryClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import { arenaCompetitionEnrollmentQueryKeys } from "~/codegen/ArenaCompetitionEnrollment.react-query";
import type { CategoryLeaf } from "~/hooks/useCategories";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import EnrollmentCard from "./EnrollmentCard";

interface CompetitionModuleSectionProps {
	category: CategoryLeaf;
}

const CompetitionEnrollmentItems = ({
	category,
}: CompetitionModuleSectionProps) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);

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

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
