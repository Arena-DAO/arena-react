import { useChain } from "@cosmos-kit/react";
import { Button, Tooltip } from "@nextui-org/react";
import type React from "react";
import { toast } from "react-toastify";
import { ArenaCompetitionEnrollmentClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import { useArenaCompetitionEnrollmentEnrollMutation } from "~/codegen/ArenaCompetitionEnrollment.react-query";
import { useEnv } from "~/hooks/useEnv";

interface EnrollButtonProps {
	enrollmentId: string;
	isExpired: boolean;
	isFull: boolean;
}

const EnrollButton: React.FC<EnrollButtonProps> = ({
	enrollmentId,
	isExpired,
	isFull,
}) => {
	const { data: env } = useEnv();
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const enrollMutation = useArenaCompetitionEnrollmentEnrollMutation();

	const handleEnroll = async () => {
		if (!address) {
			toast.error("Please connect your wallet to enroll.");
			return;
		}

		try {
			const client = await getSigningCosmWasmClient();
			const enrollmentClient = new ArenaCompetitionEnrollmentClient(
				client,
				address,
				env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
			);

			await enrollMutation.mutateAsync(
				{
					client: enrollmentClient,
					msg: { id: enrollmentId },
				},
				{
					onSuccess: () => {
						toast.success("Successfully enrolled in the competition!");
					},
				},
			);
		} catch (error) {
			console.error("Enrollment error:", error);
			toast.error("An error occurred while enrolling. Please try again.");
		}
	};

	const isDisabled = isExpired || isFull;
	const buttonText = isExpired ? "Expired" : isFull ? "Full" : "Enroll";

	return (
		<Tooltip
			content={
				isExpired
					? "This enrollment has expired"
					: isFull
						? "This enrollment is full"
						: "Click to enroll in this competition"
			}
		>
			<Button
				color={isDisabled ? "default" : "primary"}
				onClick={handleEnroll}
				disabled={isDisabled}
			>
				{buttonText}
			</Button>
		</Tooltip>
	);
};

export default EnrollButton;
