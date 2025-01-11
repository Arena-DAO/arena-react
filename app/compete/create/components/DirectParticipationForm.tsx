"use client";

import {
	Button,
	Divider,
	Switch,
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

	// Handlers
	const handleAddDue = () => {
		appendDue({ addr: "", balance: { native: [], cw20: [] } });
		setEditingDueIndex(duesFields.length);
		onOpen();
	};

	return (
		<div className="space-y-6">
			<h3 className="font-semibold text-lg">Dues</h3>
			{duesFields.map((field, index) => (
				<MemberDue
					key={field.id}
					dueIndex={index}
					onEdit={() => {
						setEditingDueIndex(index);
						onOpen();
					}}
					onRemove={() => removeDue(index)}
				/>
			))}
			<div className="flex">
				<Button onPress={handleAddDue} startContent={<FiPlus />}>
					Add Due
				</Button>
			</div>

			<Controller
				name="directParticipation.membersFromDues"
				control={control}
				render={({ field }) => (
					<Switch
						{...field}
						value={field.value?.toString()}
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
					<div className="flex">
						<Button
							onPress={() => appendMember({ address: "" })}
							startContent={<FiPlus />}
						>
							Add Member
						</Button>
					</div>
				</>
			)}

			<AddDueForm
				isOpen={isOpen}
				index={editingDueIndex ?? duesFields.length - 1}
				onClose={() => {
					setEditingDueIndex(null);
					onClose();
				}}
				onOpenChange={onOpenChange}
			/>
		</div>
	);
};

export default MembersAndDuesForm;
