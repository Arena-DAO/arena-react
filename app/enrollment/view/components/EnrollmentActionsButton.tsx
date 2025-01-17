"use client";

import { useChain } from "@cosmos-kit/react";
import {
	Button,
	ButtonGroup,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	useDisclosure,
} from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useState } from "react";
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
import { arenaGroupQueryKeys } from "~/codegen/ArenaGroup.react-query";
import type { Coin } from "~/codegen/ArenaWagerModule.types";
import { getStringSet } from "~/helpers/ReactHookHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import TeamActionModal from "./TeamActionModal";

interface EnrollmentActionsButtonProps {
	entryFee?: Coin | null;
	enrollmentId: string;
	isFull: boolean;
	groupContract: string;
}

const actionLabelsMap = {
	enroll: "Enroll",
	enrollTeam: "Enroll Team",
	withdraw: "Withdraw",
	withdrawTeam: "Withdraw Team",
};

const actionDescriptionsMap = {
	enroll: "Enroll yourself into the competition",
	enrollTeam: "Enroll your team into the competition",
	withdraw: "Withdraw from the competition",
	withdrawTeam: "Withdraw your team from the competition",
};

const EnrollmentActionsButton: React.FC<EnrollmentActionsButtonProps> = ({
	enrollmentId,
	isFull,
	entryFee,
	groupContract,
}) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const queryClient = useQueryClient();

	const [selectedOption, setSelectedOption] = useState(new Set(["enroll"]));
	const selectedValue = Array.from(selectedOption)[0] ?? "enroll";

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

	const { data: isMember } = useArenaCompetitionEnrollmentIsMemberQuery({
		client:
			cosmWasmClient &&
			new ArenaCompetitionEnrollmentQueryClient(
				cosmWasmClient,
				env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
			),
		args: { addr: address || "", enrollmentId },
		options: { enabled: !!cosmWasmClient && !!address },
	});

	useEffect(() => {
		if (isMember) {
			setSelectedOption(new Set(["withdraw"]));
		}
	}, [isMember]);

	const enrollMutation = useArenaCompetitionEnrollmentEnrollMutation();
	const withdrawMutation = useArenaCompetitionEnrollmentWithdrawMutation();

	const handleAction = async (type: "enroll" | "withdraw", team?: string) => {
		if (!address) {
			toast.error(`Please connect your wallet to ${type}.`);
			return;
		}

		try {
			const client = await getSigningCosmWasmClient();
			const enrollmentClient = new ArenaCompetitionEnrollmentClient(
				client,
				address,
				env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
			);

			const mutation = type === "enroll" ? enrollMutation : withdrawMutation;

			await mutation.mutateAsync(
				{
					client: enrollmentClient,
					msg: { id: enrollmentId, team },
					args:
						type === "enroll" && entryFee ? { funds: [entryFee] } : undefined,
				},
				{
					onSuccess: async () => {
						toast.success(
							`Successfully ${type === "enroll" ? "enrolled" : "withdrawn"}!`,
						);
						await invalidateQueries();
						queryClient.setQueryData(
							arenaCompetitionEnrollmentQueryKeys.isMember(
								env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
								{ addr: team ?? address, enrollmentId },
							),
							() => type === "enroll",
						);
						setSelectedOption(
							new Set([type === "enroll" ? "withdraw" : "enroll"]),
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

	return (
		<>
			<ButtonGroup color="primary" className="ml-auto">
				<Button
					color={selectedValue.includes("enroll") ? "success" : "danger"}
					onPress={() => {
						if (selectedOption.has("enroll")) {
							handleAction("enroll");
						} else if (selectedOption.has("enrollTeam")) {
							onOpen();
						} else if (selectedOption.has("withdraw")) {
							handleAction("withdraw");
						} else if (selectedOption.has("withdrawTeam")) {
							onOpen();
						}
					}}
					isLoading={
						(selectedOption.has("enroll") && enrollMutation.isLoading) ||
						(selectedOption.has("withdraw") && withdrawMutation.isLoading)
					}
				>
					{actionLabelsMap[selectedValue as keyof typeof actionLabelsMap]}
				</Button>
				<Dropdown placement="bottom-end">
					<DropdownTrigger>
						<Button
							isIconOnly
							color={selectedValue.includes("enroll") ? "success" : "danger"}
						>
							<BsChevronDown />
						</Button>
					</DropdownTrigger>
					<DropdownMenu
						disallowEmptySelection
						aria-label="Action buttons"
						selectedKeys={selectedOption}
						selectionMode="single"
						disabledKeys={isFull ? ["enroll", "enrollTeam"] : []}
						onSelectionChange={(keys) => setSelectedOption(getStringSet(keys))}
					>
						<DropdownItem
							key="enroll"
							description={actionDescriptionsMap.enroll}
						>
							{actionLabelsMap.enroll}
						</DropdownItem>
						<DropdownItem
							key="enrollTeam"
							description={actionDescriptionsMap.enrollTeam}
						>
							{actionLabelsMap.enrollTeam}
						</DropdownItem>
						<DropdownItem
							key="withdraw"
							description={actionDescriptionsMap.withdraw}
						>
							{actionLabelsMap.withdraw}
						</DropdownItem>
						<DropdownItem
							key="withdrawTeam"
							description={actionDescriptionsMap.withdrawTeam}
						>
							{actionLabelsMap.withdrawTeam}
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</ButtonGroup>
			<TeamActionModal
				isOpen={isOpen}
				onClose={onClose}
				onOpenChange={onOpenChange}
				action={(team) =>
					handleAction(
						selectedValue.includes("enroll") ? "enroll" : "withdraw",
						team,
					)
				}
			/>
		</>
	);
};

export default EnrollmentActionsButton;
