import {
	Button,
	Divider,
	Modal,
	Switch,
	Textarea,
	Tooltip,
	useDisclosure,
} from "@nextui-org/react";
import { useState } from "react";
import {
	Controller,
	useFieldArray,
	useFormContext,
	useWatch,
} from "react-hook-form";
import { FiInfo, FiPlus } from "react-icons/fi";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import AddDueForm from "./AddDueForm";
import Member from "./Member";
import MemberDue from "./MemberDue";

const MembersAndDuesForm = () => {
	const { control } = useFormContext<CreateCompetitionFormValues>();
	const membersFromDues = useWatch({
		control,
		name: "directParticipation.membersFromDues",
	});
	const {
		fields: duesFields,
		append: appendDue,
		remove: removeDue,
	} = useFieldArray({
		control,
		name: "directParticipation.dues",
	});
	const {
		fields: membersFields,
		append: appendMember,
		remove: removeMember,
	} = useFieldArray({
		control,
		name: "directParticipation.members",
	});

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const [editingDueIndex, setEditingDueIndex] = useState<number | null>(null);
	const [bulkDueAddresses, setBulkDueAddresses] = useState<string>("");
	const [bulkMemberAddresses, setBulkMemberAddresses] = useState<string>("");

	const handleAddDue = () => {
		appendDue({ addr: "", balance: { native: [], cw20: [] } });
		setEditingDueIndex(duesFields.length);
		onOpen();
	};

	const handleEditDue = (index: number) => {
		setEditingDueIndex(index);
		onOpen();
	};

	const handleCloseDueForm = () => {
		setEditingDueIndex(null);
		onClose();
	};

	const handleBulkAdd = (type: "member" | "due") => {
		let addresses = [];
		if (type === "member") {
			addresses = bulkMemberAddresses.split(",").map((addr) => addr.trim());
			for (const address of addresses) {
				appendMember({ address });
			}
			setBulkMemberAddresses(""); // Clear the text area after processing
		} else if (type === "due") {
			addresses = bulkDueAddresses.split(",").map((addr) => addr.trim());
			for (const address of addresses) {
				appendDue({ addr: address, balance: { native: [], cw20: [] } });
			}
			setBulkDueAddresses(""); // Clear the text area after processing
		}
	};

	return (
		<div className="space-y-6">
			<h3 className="font-semibold text-lg">Dues</h3>
			{duesFields.map((field, index) => (
				<MemberDue
					key={field.id}
					dueIndex={index}
					onEdit={() => handleEditDue(index)}
					onRemove={() => removeDue(index)}
				/>
			))}
			<div className="flex flex-col space-y-4">
				<div className="flex">
					<Button onClick={handleAddDue} startContent={<FiPlus />}>
						Add Due
					</Button>
				</div>
				<div className="flex space-x-4">
					<Textarea
						placeholder="Enter due addresses separated by commas"
						value={bulkDueAddresses}
						onChange={(e) => setBulkDueAddresses(e.target.value)}
					/>
					<Button onClick={() => handleBulkAdd("due")}>Add Bulk Dues</Button>
				</div>
			</div>

			<Controller
				name="directParticipation.membersFromDues"
				control={control}
				render={({ field }) => (
					<Switch
						{...field}
						value={field?.value?.toString()}
						isSelected={field.value}
						onValueChange={field.onChange}
					>
						<div className="flex items-center">
							Use Dues as Members
							<Tooltip content="Dues' addresses will be set as the competition's members">
								<span className="ml-2 cursor-help">
									<FiInfo />
								</span>
							</Tooltip>
						</div>
					</Switch>
				)}
			/>

			{!membersFromDues && (
				<>
					<Divider />
					<h3 className="mb-4 font-semibold text-lg">Members</h3>
					{membersFields.map((field, index) => (
						<Member
							key={field.id}
							memberIndex={index}
							onRemove={() => removeMember(index)}
						/>
					))}
					<div className="flex flex-col space-y-4">
						<div className="flex">
							<Button
								onClick={() => appendMember({ address: "" })}
								startContent={<FiPlus />}
							>
								Add Member
							</Button>
						</div>
						<div className="flex space-x-4">
							<Textarea
								placeholder="Enter member addresses separated by commas"
								value={bulkMemberAddresses}
								onChange={(e) => setBulkMemberAddresses(e.target.value)}
							/>
							<Button onClick={() => handleBulkAdd("member")}>
								Add Bulk Members
							</Button>
						</div>
					</div>
				</>
			)}

			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				onClose={handleCloseDueForm}
			>
				<AddDueForm
					isOpen={isOpen}
					onOpenChange={onOpenChange}
					index={
						editingDueIndex !== null ? editingDueIndex : duesFields.length - 1
					}
					onClose={handleCloseDueForm}
				/>
			</Modal>
		</div>
	);
};

export default MembersAndDuesForm;
