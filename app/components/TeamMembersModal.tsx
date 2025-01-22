import Profile from "@/components/Profile";
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
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
import { useRef } from "react";
import { Cw4GroupQueryClient } from "~/codegen/Cw4Group.client";
import { useCw4GroupListMembersQuery } from "~/codegen/Cw4Group.react-query";
import { DaoDaoCoreQueryClient } from "~/codegen/DaoDaoCore.client";
import { useDaoDaoCoreVotingModuleQuery } from "~/codegen/DaoDaoCore.react-query";
import { DaoVotingCw4QueryClient } from "~/codegen/DaoVotingCw4.client";
import { useDaoVotingCw4GroupContractQuery } from "~/codegen/DaoVotingCw4.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";

interface TeamMembersModalProps {
	daoAddress: string;
}

const TeamMembersModal = ({ daoAddress }: TeamMembersModalProps) => {
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { isOpen, onOpen, onOpenChange } = useDisclosure({
		id: `teams_${daoAddress}`,
	});
	const targetRef = useRef(null);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

	// Query chain: DAO Core -> Voting Module -> Group Contract -> Members
	const daoClient = cosmWasmClient
		? new DaoDaoCoreQueryClient(cosmWasmClient, daoAddress)
		: undefined;
	const { data: votingModuleAddr } = useDaoDaoCoreVotingModuleQuery({
		client: daoClient,
		options: {
			enabled: !!cosmWasmClient && !!daoAddress,
		},
	});

	const votingClient =
		cosmWasmClient && votingModuleAddr
			? new DaoVotingCw4QueryClient(cosmWasmClient, votingModuleAddr)
			: undefined;
	const { data: groupContractAddr } = useDaoVotingCw4GroupContractQuery({
		client: votingClient,
		options: {
			enabled: !!cosmWasmClient && !!votingModuleAddr,
		},
	});

	const groupClient =
		cosmWasmClient && groupContractAddr
			? new Cw4GroupQueryClient(cosmWasmClient, groupContractAddr)
			: undefined;
	const { data: members, isLoading } = useCw4GroupListMembersQuery({
		client: groupClient,
		args: {},
		options: {
			enabled: !!cosmWasmClient && !!groupContractAddr && isOpen,
		},
	});

	return (
		<>
			<Button onPress={onOpen}>Team Members</Button>
			<Modal
				ref={targetRef}
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="xl"
			>
				<ModalContent>
					<ModalHeader {...moveProps}>
						<h2>Team Members</h2>
					</ModalHeader>
					<ModalBody>
						<Table aria-label="Team Members" removeWrapper>
							<TableHeader>
								<TableColumn>Member</TableColumn>
							</TableHeader>
							<TableBody
								emptyContent="No members found"
								isLoading={isLoading}
								loadingContent={<Spinner content="Loading members..." />}
								items={members?.members ?? []}
							>
								{(member) => (
									<TableRow key={member.addr}>
										<TableCell>
											<Profile address={member.addr} />
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default TeamMembersModal;
