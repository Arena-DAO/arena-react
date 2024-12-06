import Profile from "@/components/Profile";
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	useDisclosure,
	useDraggable,
} from "@nextui-org/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { useCallback, useMemo } from "react";
import { ArenaGroupQueryClient } from "~/codegen/ArenaGroup.client";
import { arenaGroupQueryKeys } from "~/codegen/ArenaGroup.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface GroupMemberProps {
	groupContract: string;
}

const GroupMembers: React.FC<GroupMemberProps> = ({ groupContract }) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const fetchMembers = async ({ pageParam = undefined }) => {
		if (!cosmWasmClient) throw new Error("Could not get CosmWasm client");

		const client = new ArenaGroupQueryClient(cosmWasmClient, groupContract);

		const result = await client.members({
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
		isInitialLoading,
	} = useInfiniteQuery({
		queryKey: arenaGroupQueryKeys.members(groupContract, {}),
		queryFn: fetchMembers,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: !!cosmWasmClient && isOpen,
	});

	const loadMore = useCallback(() => {
		if (hasNextPage) {
			fetchNextPage();
		}
	}, [fetchNextPage, hasNextPage]);

	const members = useMemo(
		() => data?.pages.flatMap((page) => page.members) || [],
		[data],
	);
	const targetRef = React.useRef(null);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

	return (
		<>
			<Button onPress={onOpen}>Members</Button>
			<Modal
				ref={targetRef}
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="lg"
			>
				<ModalContent>
					<ModalHeader {...moveProps}>
						<h2>Members</h2>
					</ModalHeader>
					<ModalBody>
						<Table aria-label="Enrolled Members" removeWrapper>
							<TableHeader>
								<TableColumn>Member</TableColumn>
							</TableHeader>
							<TableBody
								emptyContent="No members yet..."
								isLoading={isInitialLoading}
								loadingContent={<Spinner content="Loading members..." />}
							>
								{members.map((member) => (
									<TableRow key={member.addr}>
										<TableCell>
											<Profile address={member.addr} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</ModalBody>
					{hasNextPage && (
						<ModalFooter>
							<Button
								onClick={loadMore}
								isLoading={isFetchingNextPage}
								disabled={!hasNextPage || isFetchingNextPage}
							>
								{isFetchingNextPage ? "Loading more..." : "Load More"}
							</Button>
						</ModalFooter>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};

export default GroupMembers;
