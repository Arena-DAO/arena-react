"use client";

import {
	Button,
	Card,
	Divider,
	Switch,
	Tooltip,
	useDisclosure,
} from "@heroui/react";
import { Info, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Controller,
	useFieldArray,
	useFormContext,
	useWatch,
} from "react-hook-form";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import AddDueForm from "./AddDueForm";
import Member from "./Member";
import MemberDue from "./MemberDue";

const DirectParticipationForm = () => {
	const { control, setValue } = useFormContext<CreateCompetitionFormValues>();
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

	useEffect(() => {
		setValue("directParticipation.membersFromDues", true);
	}, [setValue]);

	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const [editingDueIndex, setEditingDueIndex] = useState<number | null>(null);

	// Handler to add a new due
	const handleAddDue = () => {
		appendDue({ addr: "", balance: { native: [], cw20: [] } });
		setEditingDueIndex(duesFields.length);
		onOpen();
	};

	return (
		<div className="space-y-8">
			{/* Dues Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-xl">Dues</h3>
					<Button
						color="primary"
						variant="ghost"
						startContent={<Plus size={18} />}
						onPress={handleAddDue}
						className="card-hover"
					>
						Add Due
					</Button>
				</div>

				<div className="space-y-4">
					{duesFields.length === 0 ? (
						<Card className="border border-primary/10 border-dashed">
							<div className="flex flex-col items-center justify-center px-6 py-12 text-center">
								<div className="mb-3 rounded-full bg-primary/10 p-3">
									<Users size={24} className="text-primary" />
								</div>
								<h4 className="mb-2 font-semibold">No dues added yet</h4>
								<p className="mb-4 max-w-md text-foreground/70">
									Add dues to collect tokens from participants. Each due can
									contain multiple tokens.
								</p>
								<Button
									color="primary"
									startContent={<Plus size={18} />}
									onPress={handleAddDue}
									className="card-hover"
								>
									Add Your First Due
								</Button>
							</div>
						</Card>
					) : (
						duesFields.map((field, index) => (
							<MemberDue
								key={field.id}
								dueIndex={index}
								onEdit={() => {
									setEditingDueIndex(index);
									onOpen();
								}}
								onRemove={() => removeDue(index)}
							/>
						))
					)}
				</div>
			</div>

			{/* Members from Dues Toggle */}
			<div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
				<Controller
					name="directParticipation.membersFromDues"
					control={control}
					render={({ field }) => (
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Switch
									{...field}
									size="lg"
									value={field.value?.toString()}
									isSelected={field.value}
									onValueChange={field.onChange}
									color="primary"
								/>
								<div>
									<div className="font-medium">Use Dues as Members</div>
									<div className="text-foreground/70 text-sm">
										Dues' addresses will be automatically set as the
										competition's members
									</div>
								</div>
							</div>
							<Tooltip
								content="When enabled, the addresses added as dues will automatically be added as members"
								placement="left"
							>
								<Button isIconOnly variant="light" className="cursor-help">
									<Info size={18} />
								</Button>
							</Tooltip>
						</div>
					)}
				/>
			</div>

			{/* Manual Members Section (when not using dues as members) */}
			{!membersFromDues && (
				<>
					<Divider className="my-6" />
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-xl">Members</h3>
							<Button
								color="primary"
								variant="ghost"
								startContent={<Plus size={18} />}
								onPress={() => appendMember({ address: "" })}
								className="card-hover"
							>
								Add Member
							</Button>
						</div>

						<div className="space-y-3">
							{membersFields.length === 0 ? (
								<Card className="border border-primary/10 border-dashed">
									<div className="flex flex-col items-center justify-center px-6 py-12 text-center">
										<div className="mb-3 rounded-full bg-primary/10 p-3">
											<Users size={24} className="text-primary" />
										</div>
										<h4 className="mb-2 font-semibold">No members added yet</h4>
										<p className="mb-4 max-w-md text-foreground/70">
											Add members who will participate in this competition.
										</p>
										<Button
											color="primary"
											startContent={<Plus size={18} />}
											onPress={() => appendMember({ address: "" })}
											className="card-hover"
										>
											Add Your First Member
										</Button>
									</div>
								</Card>
							) : (
								membersFields.map((field, index) => (
									<Member
										key={field.id}
										memberIndex={index}
										onRemove={() => removeMember(index)}
									/>
								))
							)}
						</div>
					</div>
				</>
			)}

			{/* Due Form Dialog */}
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

export default DirectParticipationForm;
