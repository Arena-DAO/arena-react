import Profile from "@/components/Profile";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@nextui-org/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type React from "react";
import { useCallback, useMemo } from "react";
import { ArenaCompetitionEnrollmentQueryClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import { arenaCompetitionEnrollmentQueryKeys } from "~/codegen/ArenaCompetitionEnrollment.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface EnrollmentMembersProps {
	enrollmentId: string;
	categoryId?: string | null;
}

const EnrollmentMembers: React.FC<EnrollmentMembersProps> = ({
	enrollmentId,
	categoryId,
}) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);

	const fetchMembers = async ({ pageParam = undefined }) => {
		if (!cosmWasmClient) throw new Error("Could not get CosmWasm client");

		const client = new ArenaCompetitionEnrollmentQueryClient(
			cosmWasmClient,
			env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
		);

		const result = await client.enrollmentMembers({
			enrollmentId,
			startAfter: pageParam,
			limit: env.PAGINATION_LIMIT,
		});

		return {
			members: result,
			nextCursor:
				result.length === env.PAGINATION_LIMIT
					? result[result.length - 1]
					: undefined,
		};
	};

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useInfiniteQuery({
		queryKey: arenaCompetitionEnrollmentQueryKeys.enrollmentMembers(
			env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
			{ enrollmentId },
		),
		queryFn: fetchMembers,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: !!cosmWasmClient,
	});

	const loadMore = useCallback(() => {
		if (hasNextPage) {
			fetchNextPage();
		}
	}, [fetchNextPage, hasNextPage]);

	const members = useMemo(
		() => data?.pages.flatMap((page) => page.members) || [],
		[data?.pages.flatMap],
	);

	if (isLoading) return <Spinner />;
	if (isError) return <div>Error loading members</div>;

	return (
		<Card>
			<CardBody>
				<Table aria-label="Enrolled Members" removeWrapper>
					<TableHeader>
						<TableColumn>Member</TableColumn>
					</TableHeader>
					<TableBody emptyContent="No members yet...">
						{members.map((member) => (
							<TableRow key={member}>
								<TableCell>
									<Profile address={member} categoryId={categoryId} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardBody>
			{hasNextPage && (
				<CardFooter>
					<Button
						onClick={loadMore}
						isLoading={isFetchingNextPage}
						disabled={!hasNextPage || isFetchingNextPage}
					>
						{isFetchingNextPage ? "Loading more..." : "Load More"}
					</Button>
				</CardFooter>
			)}
		</Card>
	);
};

export default EnrollmentMembers;
