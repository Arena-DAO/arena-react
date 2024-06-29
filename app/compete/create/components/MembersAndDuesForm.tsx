import Profile from "@/components/Profile";
import { Button, Input, Modal, Switch, useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { FiMinus, FiPlus } from "react-icons/fi";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import AddDueForm from "./AddDueForm";
import MemberDue from "./MemberDue";

const MembersAndDuesForm = () => {
	const { control, watch } = useFormContext<CreateCompetitionFormValues>();
	const membersFromDues = watch("membersFromDues");
	const {
		fields: duesFields,
		append: appendDue,
		remove: removeDue,
	} = useFieldArray({
		control,
		name: "dues",
	});
	const {
		fields: membersFields,
		append: appendMember,
		remove: removeMember,
	} = useFieldArray({
		control,
		name: "members",
	});

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const [editingDueIndex, setEditingDueIndex] = useState<number | null>(null);

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

	return (
		<div className="space-y-6">
			<h3 className="mb-4 font-semibold text-lg">Dues</h3>
			{duesFields.map((field, index) => (
				<MemberDue
					key={field.id}
					dueIndex={index}
					onEdit={() => handleEditDue(index)}
					onRemove={() => removeDue(index)}
				/>
			))}
			<div className="flex">
				<Button onClick={handleAddDue} startContent={<FiPlus />}>
					Add Due
				</Button>
			</div>

			<Controller
				name="membersFromDues"
				control={control}
				render={({ field }) => (
					<Switch
						{...field}
						value={field?.value?.toString()}
						isSelected={field.value}
						onValueChange={field.onChange}
						size="md"
					>
						Use Dues Addresses as Members
					</Switch>
				)}
			/>

			{!membersFromDues && (
				<div>
					<h3 className="mb-4 font-semibold text-lg">Members</h3>
					{membersFields.map((field, index) => (
						<div key={field.id} className="mb-4 flex items-center space-x-2">
							{
								// TODO: not updating
							}
							<Profile address={field.address} justAvatar className="mr-2" />
							<div className="flex-grow">
								<Controller
									name={`members.${index}.address`}
									control={control}
									render={({ field, fieldState: { error } }) => (
										<Input
											{...field}
											label={`Member ${index + 1}`}
											placeholder="Enter member address"
											isInvalid={!!error}
											errorMessage={error?.message}
											endContent={
												<Button
													variant="faded"
													isIconOnly
													aria-label="Remove member"
													className="my-auto"
													onClick={() => removeMember(index)}
												>
													<FiMinus />
												</Button>
											}
										/>
									)}
								/>
							</div>
						</div>
					))}
					<div className="flex">
						<Button
							onClick={() => appendMember({ address: "" })}
							startContent={<FiPlus />}
						>
							Add Member
						</Button>
					</div>
				</div>
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
