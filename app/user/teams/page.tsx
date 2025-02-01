"use client";

import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	ButtonGroup,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	useDisclosure,
} from "@heroui/react";
import { ChevronDown, Trash } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DaoDaoCoreClient } from "~/codegen/DaoDaoCore.client";
import { getStringSet } from "~/helpers/ReactHookHelpers";
import { useEnv } from "~/hooks/useEnv";
import { useTeamStore } from "~/store/teamStore";
import AddExistingTeamModal from "./components/AddExistingModal";
import ShareLinkButton from "./components/ShareLinkButton";

const labelsMap = {
	create: "Create Team",
	add: "Add Existing Team",
};
const descriptionsMap = {
	create: "Create a new team with a prize reward payment flow",
	add: "Add an existing team to your teams list",
};

const TeamsPage = () => {
	const teamStore = useTeamStore();
	const router = useRouter();
	const env = useEnv();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const searchParams = useSearchParams();

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

	const [selectedOption, setSelectedOption] = useState(new Set(["create"]));
	const selectedOptionValue = Array.from(selectedOption)[0] ?? "create";

	useEffect(() => {
		const addTeamFromSearchParams = async () => {
			const teamAddress = searchParams.get("addTeam");

			if (!teamAddress) {
				return; // No addTeam parameter, skip processing.
			}

			if (!address) {
				console.log("Waiting for wallet connection...");
				return; // Wait until address is populated.
			}

			try {
				if (teamStore.teams.includes(teamAddress)) {
					toast.error("This team is already in your list.");
					return;
				}

				const signingCosmWasmClient = await getSigningCosmWasmClient();

				const client = new DaoDaoCoreClient(
					signingCosmWasmClient,
					address,
					teamAddress,
				);

				const votingPower = await client.votingPowerAtHeight({ address });

				if (Number(votingPower.power) === 0) {
					toast.error("You are not a member of this team.");
					return;
				}

				teamStore.addTeam(teamAddress);
				toast.success("Team has been added!");
			} catch (error) {
				console.error(error);
				toast.error(`Failed to add team: ${(error as Error).message}`);
			}
		};

		addTeamFromSearchParams();
	}, [searchParams, address, getSigningCosmWasmClient, teamStore]);

	return (
		<div className="container mx-auto space-y-6 p-4">
			<Card>
				<CardHeader>
					<h1 className="font-bold text-2xl">Teams</h1>
				</CardHeader>
				<CardBody>
					<Table aria-label="Teams table" hideHeader removeWrapper>
						<TableHeader>
							<TableColumn>TEAM NAME</TableColumn>
							<TableColumn>ACTIONS</TableColumn>
						</TableHeader>
						<TableBody emptyContent="No teams yet... create one!">
							{teamStore.teams.map((team, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: Best option
								<TableRow key={index}>
									<TableCell>
										<Profile address={team} isRatingDisabled />
									</TableCell>
									<TableCell className="flex">
										<ButtonGroup variant="light" className="ml-auto">
											<ShareLinkButton address={team} />
											<Button
												color="danger"
												isIconOnly
												aria-label="Remove team"
												onPress={() => teamStore.removeTeam(team)}
											>
												<Trash />
											</Button>
										</ButtonGroup>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardBody>
				<CardFooter>
					<ButtonGroup color="primary" className="ml-auto">
						<Button
							onPress={() => {
								if (selectedOption.has("create")) {
									router.push("/team/create");
								} else if (selectedOption.has("add")) {
									onOpen();
								}
							}}
						>
							{labelsMap[selectedOptionValue as keyof typeof labelsMap]}
						</Button>
						<Dropdown placement="bottom-end">
							<DropdownTrigger>
								<Button isIconOnly>
									<ChevronDown />
								</Button>
							</DropdownTrigger>
							<DropdownMenu
								disallowEmptySelection
								aria-label="Action buttons"
								selectedKeys={selectedOption}
								selectionMode="single"
								onSelectionChange={(keys) =>
									setSelectedOption(getStringSet(keys))
								}
							>
								<DropdownItem key="create" description={descriptionsMap.create}>
									{labelsMap.create}
								</DropdownItem>
								<DropdownItem key="add" description={descriptionsMap.add}>
									{labelsMap.add}
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</ButtonGroup>
				</CardFooter>
			</Card>
			<AddExistingTeamModal
				onClose={onClose}
				isOpen={isOpen}
				onOpenChange={onOpenChange}
			/>
		</div>
	);
};

export default TeamsPage;
