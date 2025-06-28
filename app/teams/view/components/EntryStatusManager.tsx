"use client";

import { useChain } from "@cosmos-kit/react";
import {
	addToast,
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useDisclosure,
} from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronDown, Settings } from "lucide-react";
import { useState } from "react";
import { ArenaTeamEnrollmentsClient } from "~/codegen/ArenaTeamEnrollments.client";
import {
	arenaTeamEnrollmentsQueryKeys,
	useArenaTeamEnrollmentsUpdateEntryStatusMutation,
} from "~/codegen/ArenaTeamEnrollments.react-query";
import type { EntryStatus } from "~/codegen/ArenaTeamEnrollments.types";
import { useEnv } from "~/hooks/useEnv";

interface EntryStatusManagerProps {
	entryId: number;
	currentStatus: EntryStatus;
	isCreator: boolean;
}

// Status configurations
const STATUS_CONFIG = {
	open: {
		color: "success" as const,
		label: "Open",
		description: "Accepting new applications",
	},
	created: {
		color: "primary" as const,
		label: "Created",
		description: "Team formed, no longer accepting applications",
	},
	closed: {
		color: "warning" as const,
		label: "Closed",
		description: "Temporarily closed, can be reopened",
	},
	aborted: {
		color: "danger" as const,
		label: "Aborted",
		description: "Permanently cancelled",
	},
};

export const EntryStatusManager = ({
	entryId,
	currentStatus,
	isCreator,
}: EntryStatusManagerProps) => {
	const env = useEnv();
	const queryClient = useQueryClient();
	const { address: walletAddress, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const [selectedStatus, setSelectedStatus] = useState<EntryStatus | null>(null);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const { mutateAsync: updateStatusMutation, isLoading: isUpdating } =
		useArenaTeamEnrollmentsUpdateEntryStatusMutation();

	// Get allowed transitions based on current status
	const getAllowedTransitions = (status: EntryStatus): EntryStatus[] => {
		switch (status) {
			case "open":
				return ["created", "closed", "aborted"];
			case "closed":
				return ["open", "created", "aborted"];
			case "created":
			case "aborted":
				return []; // Final states (except closed can go back to open)
			default:
				return [];
		}
	};

	const allowedTransitions = getAllowedTransitions(currentStatus);

	const handleStatusChange = async () => {
		if (!walletAddress || !selectedStatus) return;

		try {
			addToast({
				color: "primary",
				description: `Updating status to ${STATUS_CONFIG[selectedStatus].label}...`,
			});

			const signingClient = await getSigningCosmWasmClient();
			const enrollmentClient = new ArenaTeamEnrollmentsClient(
				signingClient,
				walletAddress,
				env.ARENA_TEAM_ENROLLMENTS_ADDRESS
			);

			await updateStatusMutation({
				client: enrollmentClient,
				msg: {
					entryId,
					status: selectedStatus,
				},
			});

			// Invalidate entry query to refresh status across all components
			await queryClient.invalidateQueries({
				queryKey: arenaTeamEnrollmentsQueryKeys.getEntry(env.ARENA_TEAM_ENROLLMENTS_ADDRESS, {
					entryId,
				}),
			});

			addToast({
				color: "success",
				description: `Status updated to ${STATUS_CONFIG[selectedStatus].label}!`,
			});
			onClose();
			setSelectedStatus(null);
		} catch (error) {
			console.error("Status update error:", error);
			addToast({
				color: "danger",
				description: (error as Error).message || "Failed to update status",
			});
		}
	};

	const openConfirmModal = (status: EntryStatus) => {
		setSelectedStatus(status);
		onOpen();
	};

	// Don't show if not creator or no transitions available
	if (!isCreator || allowedTransitions.length === 0) {
		return null;
	}

	const currentConfig = STATUS_CONFIG[currentStatus];

	return (
		<>
			<Card>
				<CardHeader className="px-6 py-4">
					<div className="flex w-full items-center justify-between">
						<div className="flex items-center gap-2">
							<Settings size={20} className="text-primary" />
							<h2 className="font-bold text-xl">Entry Status</h2>
						</div>
						<Chip color={currentConfig.color} variant="flat" size="md">
							{currentConfig.label}
						</Chip>
					</div>
				</CardHeader>
				<CardBody className="px-6 py-4">
					<p className="mb-4 text-default-600 text-sm">{currentConfig.description}</p>

					<Dropdown>
						<DropdownTrigger>
							<Button
								variant="flat"
								color="primary"
								endContent={<ChevronDown size={16} />}
								isDisabled={isUpdating}
								size="sm"
								className="min-w-fit"
							>
								Change Status
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							aria-label="Entry status options"
							onAction={(key) => openConfirmModal(key as EntryStatus)}
						>
							{allowedTransitions.map((status) => {
								const config = STATUS_CONFIG[status];
								return (
									<DropdownItem key={status} color={config.color} description={config.description}>
										{config.label}
									</DropdownItem>
								);
							})}
						</DropdownMenu>
					</Dropdown>
				</CardBody>
			</Card>

			{/* Confirmation Modal */}
			<Modal isOpen={isOpen} onClose={onClose} size="md">
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								<div className="flex items-center gap-2">
									<AlertTriangle size={20} className="text-warning" />
									<h3>Confirm Status Change</h3>
								</div>
							</ModalHeader>
							<ModalBody>
								{selectedStatus && (
									<div className="space-y-4">
										<p>
											Are you sure you want to change the entry status from{" "}
											<Chip color={currentConfig.color} variant="flat" size="sm">
												{currentConfig.label}
											</Chip>{" "}
											to{" "}
											<Chip color={STATUS_CONFIG[selectedStatus].color} variant="flat" size="sm">
												{STATUS_CONFIG[selectedStatus].label}
											</Chip>
											?
										</p>
										<div className="rounded-lg bg-default-100 p-3">
											<p className="font-medium text-sm">New Status:</p>
											<p className="text-default-600 text-sm">
												{STATUS_CONFIG[selectedStatus].description}
											</p>
										</div>
										{(selectedStatus === "created" || selectedStatus === "aborted") && (
											<div className="rounded-lg border border-warning-200 bg-warning-50 p-3">
												<p className="font-medium text-sm text-warning-700">Warning:</p>
												<p className="text-sm text-warning-600">
													This is a final state. You won't be able to change it back.
												</p>
											</div>
										)}
									</div>
								)}
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onClose}>
									Cancel
								</Button>
								<Button
									color={selectedStatus ? STATUS_CONFIG[selectedStatus].color : "primary"}
									onPress={handleStatusChange}
									isLoading={isUpdating}
								>
									Confirm Change
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};
