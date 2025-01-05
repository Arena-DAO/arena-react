import { useChain } from "@cosmos-kit/react";
// TriggerButton.tsx
import { Button } from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ArenaCompetitionEnrollmentClient } from "~/codegen/ArenaCompetitionEnrollment.client";
import {
	arenaCompetitionEnrollmentQueryKeys,
	useArenaCompetitionEnrollmentFinalizeMutation,
} from "~/codegen/ArenaCompetitionEnrollment.react-query";
import type { EnrollmentEntryResponse } from "~/codegen/ArenaCompetitionEnrollment.types";
import { useEnv } from "~/hooks/useEnv";

interface TriggerButtonProps {
	enrollmentId: string;
	isExpired: boolean;
	isFull: boolean;
}

const FinalizeButton: React.FC<TriggerButtonProps> = ({
	enrollmentId,
	isExpired,
	isFull,
}) => {
	const env = useEnv();
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const finalizeEnrollmentMutation =
		useArenaCompetitionEnrollmentFinalizeMutation();
	const queryClient = useQueryClient();

	const handleTriggerExpiration = async () => {
		if (!address) {
			toast.error("Wallet not connected");
			return;
		}

		try {
			const signingCosmWasmClient = await getSigningCosmWasmClient();

			await finalizeEnrollmentMutation.mutateAsync(
				{
					client: new ArenaCompetitionEnrollmentClient(
						signingCosmWasmClient,
						address,
						env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
					),
					msg: {
						id: enrollmentId,
					},
				},
				{
					onSuccess: async (response) => {
						const competitionId = response.events
							.find((event) =>
								event.attributes.find(
									(attr) =>
										attr.key === "action" &&
										attr.value === "create_competition",
								),
							)
							?.attributes.find((attr) => attr.key === "competition_id")?.value;

						if (competitionId) {
							queryClient.setQueryData<EnrollmentEntryResponse | undefined>(
								arenaCompetitionEnrollmentQueryKeys.enrollment(
									env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
									{ enrollmentId },
								),
								(old) => {
									if (!old) return old;

									return {
										...old,
										has_finalized: true,
										competition_info: {
											...old.competition_info,
											competition_id: competitionId,
										},
									};
								},
							);
						} else {
							queryClient.setQueryData<EnrollmentEntryResponse | undefined>(
								arenaCompetitionEnrollmentQueryKeys.enrollment(
									env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
									{ enrollmentId },
								),
								(old) => {
									if (!old) return old;

									return {
										...old,
										has_finalized: true,
									};
								},
							);
						}
					},
				},
			);
			toast.success("Expiration triggered successfully");
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	if (!isExpired && !isFull) {
		return null;
	}

	return (
		<Button
			color="success"
			variant="bordered"
			onPress={handleTriggerExpiration}
			isLoading={finalizeEnrollmentMutation.isLoading}
		>
			Finalize
		</Button>
	);
};

export default FinalizeButton;
