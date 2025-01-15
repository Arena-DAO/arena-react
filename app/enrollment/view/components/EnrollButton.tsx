import { useChain } from "@cosmos-kit/react";
import {
	Button,
	ButtonGroup,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Tooltip,
	useDisclosure,
} from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useState } from "react";
import { BsChevronDown } from "react-icons/bs";
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
import { getStringSet } from "~/helpers/ReactHookHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import TeamActionModal from "./TeamActionModal";

interface EnrollButtonProps {
	entryFee?: Coin | null;
	enrollmentId: string;
	isFull: boolean;
	groupContract: string;
}

const enrollLabelsMap = {
	enroll: "Enroll",
	enrollTeam: "Enroll Team",
};
const enrollDescriptionsMap = {
	enroll: "Enroll yourself into the competition",
	enrollTeam: "Enroll your team into the competition",
};

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

	const [enrollSelectedOption, setEnrollSelectedOption] = useState(
		new Set(["enroll"]),
	);
	const selectedEnrollOptionValue =
		Array.from(enrollSelectedOption)[0] ?? "enroll";

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

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

	const handleEnroll = async (team?: string) => {
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
					msg: { id: enrollmentId, team },
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

	const handleWithdraw = async (team?: string) => {
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
					msg: { id: enrollmentId, team },
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
			arenaGroupQueryKeys.members(groupContract),
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
				<Button
					onPress={() => handleWithdraw()}
					isLoading={withdrawMutation.isLoading}
				>
					Withdraw
				</Button>
			</Tooltip>
		);
	}

	return (
		<>
			<Tooltip
				content={
					isFull
						? "This competition enrollment is full"
						: "Register for this competition"
				}
			>
				<ButtonGroup color="primary" className="ml-auto">
					<Button
						color="primary"
						onPress={() => {
							if (enrollSelectedOption.has("enroll")) {
								handleEnroll();
							} else if (enrollSelectedOption.has("enrollTeam")) {
								onOpen();
							}
						}}
						isDisabled={isFull}
						isLoading={enrollMutation.isLoading}
					>
						{
							enrollLabelsMap[
								selectedEnrollOptionValue as keyof typeof enrollLabelsMap
							]
						}
					</Button>
					<Dropdown placement="bottom-end">
						<DropdownTrigger>
							<Button isIconOnly>
								<BsChevronDown />
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							disallowEmptySelection
							aria-label="Enroll buttons"
							selectedKeys={enrollSelectedOption}
							selectionMode="single"
							onSelectionChange={(keys) =>
								setEnrollSelectedOption(getStringSet(keys))
							}
						>
							<DropdownItem
								key="enroll"
								description={enrollDescriptionsMap.enroll}
							>
								{enrollLabelsMap.enroll}
							</DropdownItem>
							<DropdownItem
								key="enrollTeam"
								description={enrollDescriptionsMap.enrollTeam}
							>
								{enrollLabelsMap.enrollTeam}
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</ButtonGroup>
			</Tooltip>
			<TeamActionModal
				isOpen={isOpen}
				onClose={onClose}
				onOpenChange={onOpenChange}
				action={handleEnroll}
			/>
		</>
	);
};

export default EnrollButton;
