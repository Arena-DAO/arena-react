import { useChain } from "@cosmos-kit/react";
import { Button, Tooltip } from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { toast } from "react-toastify";
import { ArenaCompetitionEnrollmentClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import {
	arenaCompetitionEnrollmentQueryKeys,
	useArenaCompetitionEnrollmentEnrollMutation,
} from "~/codegen/ArenaCompetitionEnrollment.react-query";
import type { Coin } from "~/codegen/ArenaCompetitionEnrollment.types";
import { useEnv } from "~/hooks/useEnv";

interface EnrollButtonProps {
	entryFee?: Coin | null;
	enrollmentId: string;
	isExpired: boolean;
	isFull: boolean;
}

const EnrollButton: React.FC<EnrollButtonProps> = ({
	enrollmentId,
	isExpired,
	isFull,
	entryFee,
}) => {
	const { data: env } = useEnv();
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const enrollMutation = useArenaCompetitionEnrollmentEnrollMutation();
	const queryClient = useQueryClient();

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
					args: {
						funds: entryFee ? [entryFee] : undefined,
					},
				},
				{
					onSuccess: () => {
						toast.success("Successfully enrolled in the competition!");

						queryClient.invalidateQueries(
							arenaCompetitionEnrollmentQueryKeys.enrollment(
								env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
								{ enrollmentId },
							),
						);
						queryClient.invalidateQueries(
							arenaCompetitionEnrollmentQueryKeys.enrollmentMembers(
								env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
								{ enrollmentId },
							),
						);
					},
				},
			);
		} catch (error) {
			console.error(error);
			toast.error((error as Error).toString());
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
