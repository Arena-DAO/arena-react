"use client";

import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Checkbox,
	Input,
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
	addToast,
	useDisclosure,
	useDraggable,
} from "@heroui/react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useMemo, useCallback } from "react";

import { ArenaCompetitionEnrollmentClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import { ArenaGroupQueryClient } from "~/codegen/ArenaGroup.client";
import { arenaGroupQueryKeys } from "~/codegen/ArenaGroup.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface GroupMemberProps {
	groupContract: string;
	enrollmentId?: string; // Optional enrollmentId for authorization
}

const GroupMembers: React.FC<GroupMemberProps> = ({
	groupContract,
	enrollmentId,
}) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
		new Set(),
	);
	const [modifiedSeeds, setModifiedSeeds] = useState<Record<string, string>>(
		{},
	);
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const queryClient = useQueryClient();

	const handleCheckboxChange = (addr: string, isSelected: boolean) => {
		setSelectedMembers((prev) => {
			const updatedSelection = new Set(prev);
			isSelected ? updatedSelection.add(addr) : updatedSelection.delete(addr);
			return updatedSelection;
		});
	};

	const handleSeedChange = (
		addr: string,
		value: string,
		originalSeed: string,
	) => {
		setModifiedSeeds((prev) => {
			if (value !== originalSeed) {
				return { ...prev, [addr]: value };
			}
			const { [addr]: _, ...rest } = prev; // Remove from modifiedSeeds if unchanged
			return rest;
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

	// biome-ignore lint/style/noNonNullAssertion: correct
	const targetRef = React.useRef(null!);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

	const handleForceWithdraw = async () => {
		if (!enrollmentId || selectedMembers.size === 0) return;

		try {
			const client = await getSigningCosmWasmClient();
			if (!address) throw new Error("Could not get user address");

			const enrollmentClient = new ArenaCompetitionEnrollmentClient(
				client,
				address,
				env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
			);

			await enrollmentClient.forceWithdraw({
				id: enrollmentId,
				members: Array.from(selectedMembers),
			});

			await queryClient.invalidateQueries(
				arenaGroupQueryKeys.members(groupContract, {}),
			);

			addToast({
				color: "success",
				description: "Users have been successfully withdrawn",
			});
			setSelectedMembers(new Set());
		} catch (e) {
			console.error(e);
			addToast({ color: "danger", description: (e as Error).toString() });
		}
	};

	const handleSetSeeds = async () => {
		if (!enrollmentId || Object.keys(modifiedSeeds).length === 0) return;

		try {
			const client = await getSigningCosmWasmClient();
			if (!address) throw new Error("Could not get user address");

			const enrollmentClient = new ArenaCompetitionEnrollmentClient(
				client,
				address,
				env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
			);

			await enrollmentClient.setRankings({
				id: enrollmentId,
				rankings: Object.entries(modifiedSeeds).map(([addr, seed]) => ({
					addr,
					seed: seed.toString(),
				})),
			});

			await queryClient.invalidateQueries(
				arenaGroupQueryKeys.members(groupContract, {}),
			);

			addToast({ color: "success", description: "Seeds updated successfully" });
			setModifiedSeeds({});
		} catch (e) {
			console.error(e);
			addToast({ color: "danger", description: (e as Error).toString() });
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
								<TableColumn>Seed</TableColumn>
								<TableColumn> </TableColumn>
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
										<TableCell>
											<Input
												type="number"
												step="1"
												variant="flat"
												readOnly={!enrollmentId}
												value={
													modifiedSeeds[member.addr]?.toString() ?? member.seed
												}
												onChange={(e) =>
													handleSeedChange(
														member.addr,
														e.target.value,
														member.seed,
													)
												}
												placeholder="Enter seed"
											/>
										</TableCell>
										{enrollmentId ? (
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
					<ModalFooter>
						{hasNextPage && (
							<Button
								onPress={loadMore}
								isLoading={isFetchingNextPage}
								disabled={isFetchingNextPage}
							>
								Load More
							</Button>
						)}
						{enrollmentId && (
							<>
								<Button
									onPress={handleSetSeeds}
									color="primary"
									isDisabled={Object.keys(modifiedSeeds).length === 0}
								>
									Set Seeds
								</Button>
								<Button
									onPress={handleForceWithdraw}
									isDisabled={selectedMembers.size === 0}
									color="danger"
								>
									Force Withdraw
								</Button>
							</>
						)}
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default GroupMembers;
