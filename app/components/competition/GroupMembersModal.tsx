import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Checkbox,
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
} from "@heroui/react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { ArenaCompetitionEnrollmentClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import { arenaCompetitionEnrollmentQueryKeys } from "~/codegen/ArenaCompetitionEnrollment.react-query";
import { ArenaGroupQueryClient } from "~/codegen/ArenaGroup.client";
import { arenaGroupQueryKeys } from "~/codegen/ArenaGroup.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface GroupMemberProps {
	groupContract: string;
	// Pass in the enrollmentId if the user can force withdraw member
	forceWithdrawEnrollmentId?: string;
}

const GroupMembers: React.FC<GroupMemberProps> = ({
	groupContract,
	forceWithdrawEnrollmentId,
}) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
		new Set(),
	);
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const queryClient = useQueryClient();

	const handleCheckboxChange = (address: string, isSelected: boolean) => {
		setSelectedMembers((prev) => {
			const newSelection = new Set(prev);
			if (isSelected) {
				newSelection.add(address);
			} else {
				newSelection.delete(address);
			}
			return newSelection;
		});
	};

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

	const handleForceWithdraw = async () => {
		if (selectedMembers.size === 0 || !forceWithdrawEnrollmentId) return;
		try {
			const client = await getSigningCosmWasmClient();
			if (!address) throw new Error("Could not get user address");

			const enrollmentClient = new ArenaCompetitionEnrollmentClient(
				client,
				address,
				env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
			);

			await enrollmentClient.forceWithdraw({
				id: forceWithdrawEnrollmentId,
				members: Array.from(selectedMembers),
			});

			await queryClient.invalidateQueries(
				arenaCompetitionEnrollmentQueryKeys.enrollment(
					env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
					{ enrollmentId: forceWithdrawEnrollmentId },
				),
			);
			onClose();
			setSelectedMembers(new Set());
			toast.success("Users have been successfully withdrawn");
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	return (
		<>
			<Button onPress={onOpen}>Members</Button>
			<Modal
				ref={targetRef}
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="xl"
			>
				<ModalContent>
					<ModalHeader {...moveProps}>
						<h2>Members</h2>
					</ModalHeader>
					<ModalBody>
						<Table aria-label="Enrolled Members" removeWrapper>
							<TableHeader>
								<TableColumn>Member</TableColumn>
								{forceWithdrawEnrollmentId ? (
									<TableColumn>Selections</TableColumn>
								) : (
									<TableColumn> </TableColumn>
								)}
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
										{forceWithdrawEnrollmentId ? (
											<TableCell>
												<Checkbox
													isSelected={selectedMembers.has(member.addr)}
													onValueChange={(isSelected) =>
														handleCheckboxChange(member.addr, isSelected)
													}
												/>
											</TableCell>
										) : (
											<></>
										)}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</ModalBody>
					{(hasNextPage || forceWithdrawEnrollmentId) && (
						<ModalFooter>
							{hasNextPage && (
								<Button
									onPress={loadMore}
									isLoading={isFetchingNextPage}
									disabled={!hasNextPage || isFetchingNextPage}
								>
									{isFetchingNextPage ? "Loading more..." : "Load More"}
								</Button>
							)}
							{forceWithdrawEnrollmentId && (
								<Button
									onPress={handleForceWithdraw}
									isDisabled={selectedMembers.size === 0}
									color="danger"
								>
									Force Withdraw
								</Button>
							)}
						</ModalFooter>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};

export default GroupMembers;
