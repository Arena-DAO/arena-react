import { useChain } from "@cosmos-kit/react";
import { Button, Tooltip } from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { toast } from "react-toastify";
import {
	ArenaCompetitionEnrollmentClient,
	ArenaCompetitionEnrollmentQueryClient,
} from "~/codegen/ArenaCompetitionEnrollment.client";
import {
	arenaCompetitionEnrollmentQueryKeys,
	useArenaCompetitionEnrollmentEnrollMutation,
	useArenaCompetitionEnrollmentIsMemberQuery,
	useArenaCompetitionEnrollmentWithdrawMutation,
} from "~/codegen/ArenaCompetitionEnrollment.react-query";
import type { Coin } from "~/codegen/ArenaCompetitionEnrollment.types";
import { arenaGroupQueryKeys } from "~/codegen/ArenaGroup.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface EnrollButtonProps {
	entryFee?: Coin | null;
	enrollmentId: string;
	isFull: boolean;
	groupContract: string;
}

const EnrollButton: React.FC<EnrollButtonProps> = ({
	enrollmentId,
	isFull,
	entryFee,
	groupContract,
}) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const queryClient = useQueryClient();

	const { data: isMember, isLoading } =
		useArenaCompetitionEnrollmentIsMemberQuery({
			client:
				cosmWasmClient &&
				new ArenaCompetitionEnrollmentQueryClient(
					cosmWasmClient,
					env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
				),
			args: {
				addr: address || "",
				enrollmentId,
			},
			options: {
				enabled: !!cosmWasmClient && !!address,
			},
		});

	const enrollMutation = useArenaCompetitionEnrollmentEnrollMutation();
	const withdrawMutation = useArenaCompetitionEnrollmentWithdrawMutation();

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
					onSuccess: async () => {
						toast.success("Successfully enrolled in the competition!");
						await invalidateQueries();
						queryClient.setQueryData(
							arenaCompetitionEnrollmentQueryKeys.isMember(
								env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
								{
									addr: address,
									enrollmentId,
								},
							),
							() => true,
						);
					},
				},
			);
		} catch (error) {
			console.error(error);
			toast.error((error as Error).toString());
		}
	};

	const handleWithdraw = async () => {
		if (!address) {
			toast.error("Please connect your wallet to withdraw.");
			return;
		}

		try {
			const client = await getSigningCosmWasmClient();
			const enrollmentClient = new ArenaCompetitionEnrollmentClient(
				client,
				address,
				env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
			);

			await withdrawMutation.mutateAsync(
				{
					client: enrollmentClient,
					msg: { id: enrollmentId },
				},
				{
					onSuccess: async () => {
						toast.success("Successfully withdrawn from the competition!");
						await invalidateQueries();
						queryClient.setQueryData(
							arenaCompetitionEnrollmentQueryKeys.isMember(
								env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
								{
									addr: address,
									enrollmentId,
								},
							),
							() => false,
						);
					},
				},
			);
		} catch (error) {
			console.error(error);
			toast.error((error as Error).toString());
		}
	};

	const invalidateQueries = async () => {
		await queryClient.invalidateQueries(
			arenaCompetitionEnrollmentQueryKeys.enrollment(
				env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
				{ enrollmentId },
			),
		);
		await queryClient.invalidateQueries(
			arenaGroupQueryKeys.members(groupContract, {}),
		);
	};

	if (!address) {
		return <Button isDisabled>Connect Wallet</Button>;
	}

	if (isLoading) {
		return <Button isLoading>Loading...</Button>;
	}

	if (isMember) {
		return (
			<Tooltip content="Withdraw from the competition">
				<Button onPress={handleWithdraw} isLoading={withdrawMutation.isLoading}>
					Withdraw
				</Button>
			</Tooltip>
		);
	}

	const buttonText = isFull ? "Full" : "Enroll";

	return (
		<Tooltip
			content={
				isFull
					? "This competition enrollment is full"
					: "Enroll in this competition"
			}
		>
			<Button
				color="primary"
				onPress={handleEnroll}
				isDisabled={isFull}
				isLoading={enrollMutation.isLoading}
			>
				{buttonText}
			</Button>
		</Tooltip>
	);
};

export default EnrollButton;
