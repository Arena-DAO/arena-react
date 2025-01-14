"use client";

import Profile from "@/components/Profile";
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
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BsChevronDown, BsTrash } from "react-icons/bs";
import { getStringSet } from "~/helpers/ReactHookHelpers";
import { useTeamStore } from "~/store/teamStore";
import AddExistingTeamModal from "./components/AddExistingModal";

const TeamsPage = () => {
	const teamStore = useTeamStore();
	const router = useRouter();
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

	const [selectedOption, setSelectedOption] = useState(new Set(["create"]));
	const labelsMap = {
		create: "Create Team",
		add: "Add Existing Team",
	};
	const descriptionsMap = {
		create: "Create a new team with a prize reward payment flow",
		add: "Add an existing team to your teams list",
	};
	const selectedOptionValue = Array.from(selectedOption)[0] ?? "create";

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
										<ButtonGroup variant="flat" className="ml-auto">
											<Button
												color="danger"
												isIconOnly
												aria-label="Remove team"
												onPress={() => teamStore.removeTeam(team)}
											>
												<BsTrash />
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
									<BsChevronDown />
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
