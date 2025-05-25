// app/teams/entry/[entryId]/components/ApplicantsList.tsx
"use client";

import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Card,
	CardBody,
	Chip,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Textarea,
	addToast,
	useDisclosure,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Clock, MessageSquare, UserCheck, UserMinus, UserX } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { ArenaTeamEnrollmentsClient } from "~/codegen/ArenaTeamEnrollments.client";
import { useArenaTeamEnrollmentsUpdateApplicantStatusMutation } from "~/codegen/ArenaTeamEnrollments.react-query";
import type { ApplicantResponse, ApplicantStatus } from "~/codegen/ArenaTeamEnrollments.types";
import { useEnv } from "~/hooks/useEnv";

// Schema for rejection reason
const rejectionSchema = z.object({
	reason: z.string().min(5, "Reason must be at least 5 characters").max(500, "Reason too long"),
});

type RejectionForm = z.infer<typeof rejectionSchema>;

// Applicant status configurations
const APPLICANT_STATUS_CONFIG = {
	default: {
		color: "default" as const,
		label: "Pending",
		icon: Clock,
		description: "Application under review",
	},
	approved: {
		color: "success" as const,
		label: "Approved",
		icon: UserCheck,
		description: "Application approved - can join team",
	},
	rejected: {
		color: "danger" as const,
		label: "Rejected",
		icon: UserX,
		description: "Application declined",
	},
};

interface ApplicantsListProps {
	applicants: ApplicantResponse[];
	isCreator: boolean;
	entryId: number;
}

export const ApplicantsList = ({ applicants, isCreator, entryId }: ApplicantsListProps) => {
	const env = useEnv();
	const { address: walletAddress, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const [selectedApplicant, setSelectedApplicant] = useState<ApplicantResponse | null>(null);
	const {
		isOpen: isRejectModalOpen,
		onOpen: onRejectModalOpen,
		onClose: onRejectModalClose,
	} = useDisclosure();

	// Mutation
	const { mutateAsync: updateStatusMutation, isLoading: isUpdatingStatus } =
		useArenaTeamEnrollmentsUpdateApplicantStatusMutation();

	// Form for rejection reason
	const {
		control: rejectControl,
		handleSubmit: handleRejectSubmit,
		reset: resetRejectForm,
		formState: { errors: rejectErrors, isValid: isRejectValid },
	} = useForm<RejectionForm>({
		resolver: zodResolver(rejectionSchema),
		defaultValues: { reason: "" },
	});

	// Helper functions
	const getApplicantStatusConfig = (status: ApplicantStatus) => {
		if (typeof status === "object" && "rejected" in status) {
			return APPLICANT_STATUS_CONFIG.rejected;
		}
		return (
			APPLICANT_STATUS_CONFIG[status as keyof typeof APPLICANT_STATUS_CONFIG] ||
			APPLICANT_STATUS_CONFIG.default
		);
	};

	const getRejectionReason = (status: ApplicantStatus): string | null => {
		if (typeof status === "object" && "rejected" in status) {
			return status.rejected.reason;
		}
		return null;
	};

	// Actions
	const handleApprove = async (applicant: string) => {
		if (!walletAddress) return;
		try {
			addToast({ color: "primary", description: "Approving applicant..." });
			const signingClient = await getSigningCosmWasmClient();
			const enrollmentClient = new ArenaTeamEnrollmentsClient(
				signingClient,
				walletAddress,
				env.ARENA_TEAM_ENROLLMENTS_ADDRESS
			);

			await updateStatusMutation({
				client: enrollmentClient,
				msg: { entryId, applicant, status: "approved" },
			});

			addToast({ color: "success", description: "Applicant approved!" });
		} catch (error) {
			console.error("Approve error:", error);
			addToast({
				color: "danger",
				description: (error as Error).message || "Failed to approve applicant",
			});
		}
	};

	const handleReject = async (data: RejectionForm) => {
		if (!walletAddress || !selectedApplicant) return;
		try {
			addToast({ color: "primary", description: "Rejecting applicant..." });
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
					applicant: selectedApplicant.applicant,
					status: { rejected: { reason: data.reason } },
				},
			});

			addToast({ color: "success", description: "Applicant rejected" });
			onRejectModalClose();
			resetRejectForm();
			setSelectedApplicant(null);
		} catch (error) {
			console.error("Reject error:", error);
			addToast({
				color: "danger",
				description: (error as Error).message || "Failed to reject applicant",
			});
		}
	};

	const openRejectModal = (applicant: ApplicantResponse) => {
		setSelectedApplicant(applicant);
		onRejectModalOpen();
	};

	if (applicants.length === 0) {
		return (
			<div className="py-12 text-center">
				<UserMinus size={48} className="mx-auto mb-4 opacity-30" />
				<h3 className="mb-2 font-medium text-lg">No applicants in this category</h3>
				<p className="text-default-500">Check other tabs to see all applicants</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-4 p-6">
				{applicants.map((applicant) => {
					const statusConfig = getApplicantStatusConfig(applicant.status);
					const rejectionReason = getRejectionReason(applicant.status);
					const StatusIcon = statusConfig.icon;

					return (
						<motion.div
							key={applicant.applicant}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<Card className="border border-default-200 transition-shadow hover:shadow-md">
								<CardBody className="p-4">
									<div className="flex items-center justify-between">
										<div className="flex flex-1 items-center gap-3">
											<Profile address={applicant.applicant} />
											<div className="flex-1">
												<div className="mb-1 flex items-center gap-2">
													<Chip
														color={statusConfig.color}
														variant="flat"
														size="sm"
														startContent={<StatusIcon size={12} />}
													>
														{statusConfig.label}
													</Chip>
												</div>
												<p className="text-default-500 text-xs">{statusConfig.description}</p>
												{rejectionReason && (
													<div className="mt-2 rounded-md border border-danger-200 bg-danger-50 p-2">
														<div className="flex items-start gap-2">
															<MessageSquare size={12} className="mt-0.5 text-danger" />
															<div>
																<p className="mb-1 font-medium text-danger text-xs">
																	Rejection Reason:
																</p>
																<p className="text-danger-700 text-xs">{rejectionReason}</p>
															</div>
														</div>
													</div>
												)}
											</div>
										</div>

										{isCreator && applicant.status === "default" && (
											<div className="flex items-center gap-2">
												<Button
													size="sm"
													color="success"
													variant="flat"
													onPress={() => handleApprove(applicant.applicant)}
													isDisabled={isUpdatingStatus}
													startContent={<UserCheck size={14} />}
												>
													Approve
												</Button>
												<Button
													size="sm"
													color="danger"
													variant="flat"
													onPress={() => openRejectModal(applicant)}
													isDisabled={isUpdatingStatus}
													startContent={<UserX size={14} />}
												>
													Reject
												</Button>
											</div>
										)}
									</div>
								</CardBody>
							</Card>
						</motion.div>
					);
				})}
			</div>

			{/* Rejection Modal */}
			<Modal isOpen={isRejectModalOpen} onClose={onRejectModalClose} size="lg">
				<ModalContent>
					{(onClose) => (
						<form onSubmit={handleRejectSubmit(handleReject)}>
							<ModalHeader className="flex flex-col gap-1">
								<h3>Reject Application</h3>
								<p className="font-normal text-default-500 text-sm">
									Provide a reason for rejecting this application
								</p>
							</ModalHeader>
							<ModalBody>
								{selectedApplicant && (
									<div className="mb-4 rounded-lg bg-default-100 p-3">
										<Profile address={selectedApplicant.applicant} />
									</div>
								)}
								<Controller
									name="reason"
									control={rejectControl}
									render={({ field }) => (
										<Textarea
											{...field}
											label="Rejection Reason"
											placeholder="Please explain why this application is being rejected..."
											minRows={3}
											maxRows={6}
											errorMessage={rejectErrors.reason?.message}
											isInvalid={!!rejectErrors.reason}
											isRequired
										/>
									)}
								/>
							</ModalBody>
							<ModalFooter>
								<Button variant="light" onPress={onClose}>
									Cancel
								</Button>
								<Button
									type="submit"
									color="danger"
									isDisabled={!isRejectValid}
									isLoading={isUpdatingStatus}
									startContent={<UserX size={16} />}
								>
									Reject Application
								</Button>
							</ModalFooter>
						</form>
					)}
				</ModalContent>
			</Modal>
		</>
	);
};
