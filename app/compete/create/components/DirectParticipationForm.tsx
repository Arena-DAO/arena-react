"use client";

import { ProfileInput } from "@/components/ProfileInput";
import { Button, Card, Divider, Switch, Tooltip, useDisclosure } from "@heroui/react";
import { Info, Plus, Trash, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import AddDueForm from "./AddDueForm";
import MemberDue from "./MemberDue";

const DirectParticipationForm = () => {
	const {
		control,
		setValue,
		formState: { errors },
	} = useFormContext<CreateCompetitionFormValues>();

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

	// Handler to add a new due with error handling
	const handleAddDue = () => {
		try {
			appendDue({ addr: "", balance: { native: [], cw20: [], cw721: [] } });
			setEditingDueIndex(duesFields.length);
			onOpen();
		} catch (error) {
			console.error("Error adding due:", error);
		}
	};

	// Handler to remove due with error handling
	const handleRemoveDue = (index: number) => {
		try {
			removeDue(index);
		} catch (error) {
			console.error("Error removing due:", error);
		}
	};

	// Handler to add member with error handling
	const handleAddMember = () => {
		try {
			appendMember({ address: "" });
		} catch (error) {
			console.error("Error adding member:", error);
		}
	};

	// Handler to remove member with error handling
	const handleRemoveMember = (index: number) => {
		try {
			removeMember(index);
		} catch (error) {
			console.error("Error removing member:", error);
		}
	};

	// Get field-level errors
	const duesErrors = errors?.directParticipation?.dues;
	const membersErrors = errors?.directParticipation?.members;

	return (
		<div className="space-y-6">
			{/* Info Banner */}
			<div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
				<div className="flex items-start gap-3">
					<div className="text-xl">💰</div>
					<div>
						<h4 className="font-semibold text-primary">Direct Participation Setup</h4>
						<p className="mt-1 text-primary/80 text-sm">
							Add specific participants and collect their entry funds upfront. Perfect for private
							competitions with known participants.
						</p>
					</div>
				</div>
			</div>

			{/* Dues Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="font-semibold text-xl">Competition Dues</h3>
						<p className="mt-1 text-foreground/70 text-sm">
							Collect dues from each participant. These funds go into the competition prize pool.
						</p>
						{duesErrors && (
							<p className="mt-1 text-danger text-sm">
								Please check the participant entries for errors
							</p>
						)}
					</div>
					<Button
						color="primary"
						variant="flat"
						startContent={<Plus size={18} />}
						onPress={handleAddDue}
					>
						Add Participant
					</Button>
				</div>

				<div className="space-y-4">
					{duesFields.length === 0 ? (
						<Card className="border border-primary/10 border-dashed">
							<div className="flex flex-col items-center justify-center px-6 py-12 text-center">
								<div className="mb-3 rounded-full bg-primary/10 p-3">
									<Users size={24} className="text-primary" />
								</div>
								<h4 className="mb-2 font-semibold">No participants added yet</h4>
								<p className="mb-4 max-w-md text-foreground/70">
									Add participants and specify their dues for the competition. Funds are collected
									upfront and held in escrow.
								</p>
								<Button color="primary" startContent={<Plus size={18} />} onPress={handleAddDue}>
									Add First Participant
								</Button>
							</div>
						</Card>
					) : (
						duesFields.map((field, index) => (
							<div key={field.id} className="relative">
								<MemberDue
									dueIndex={index}
									onEdit={() => {
										setEditingDueIndex(index);
										onOpen();
									}}
									onRemove={() => handleRemoveDue(index)}
								/>
								{duesErrors?.[index] && (
									<div className="mt-2 rounded-md border border-danger-200 bg-danger-50 p-2">
										<p className="text-danger text-sm">
											Please check this participant's information for errors
										</p>
									</div>
								)}
							</div>
						))
					)}
				</div>
			</div>

			{/* Members Configuration */}
			{duesFields.length > 0 && (
				<div className="rounded-xl border border-success/20 bg-success/5 p-4">
					<Controller
						name="directParticipation.membersFromDues"
						control={control}
						render={({ field }) => (
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Switch
										{...field}
										size="lg"
										value={field.value?.toString()}
										isSelected={field.value}
										onValueChange={field.onChange}
										color="success"
									/>
									<div>
										<div className="font-medium text-success-700">Auto-assign as competitors</div>
										<div className="text-sm text-success-600">
											Participants who pay dues automatically become eligible competitors
										</div>
									</div>
								</div>
								<Tooltip
									content="Recommended: People who pay dues will automatically be eligible to compete and receive prizes"
									placement="left"
								>
									<Button isIconOnly variant="light" className="cursor-help">
										<Info size={18} className="text-success-600" />
									</Button>
								</Tooltip>
							</div>
						)}
					/>
				</div>
			)}

			{/* Manual Members Section (when not using dues as members) */}
			{!membersFromDues && duesFields.length > 0 && (
				<>
					<Divider className="my-6" />
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="font-semibold text-xl">Eligible Competitors</h3>
								<p className="mt-1 text-foreground/70 text-sm">
									Add who can actually compete (different from who pays dues)
								</p>
								{membersErrors && (
									<p className="mt-1 text-danger text-sm">
										Please check the competitor addresses for errors
									</p>
								)}
							</div>
							<Button
								color="primary"
								variant="flat"
								startContent={<Plus size={18} />}
								onPress={handleAddMember}
							>
								Add Competitor
							</Button>
						</div>

						<div className="space-y-3">
							{membersFields.length === 0 ? (
								<Card className="border border-warning/20 border-dashed bg-warning/5">
									<div className="flex flex-col items-center justify-center px-6 py-8 text-center">
										<div className="mb-3 rounded-full bg-warning/20 p-3">
											<Users size={20} className="text-warning-600" />
										</div>
										<h4 className="mb-2 font-semibold text-warning-700">
											No competitors specified
										</h4>
										<p className="mb-4 max-w-md text-sm text-warning-600">
											Since auto-assign is disabled, you need to manually add who can compete.
											Consider enabling auto-assign above for simpler setup.
										</p>
										<Button
											color="warning"
											variant="flat"
											startContent={<Plus size={16} />}
											onPress={handleAddMember}
										>
											Add Competitor
										</Button>
									</div>
								</Card>
							) : (
								membersFields.map((field, index) => (
									<div key={field.id} className="space-y-2">
										<div className="flex items-center gap-2">
											<Controller
												control={control}
												name={`directParticipation.members.${index}.address`}
												render={({ field: inputField, fieldState }) => (
													<ProfileInput
														field={inputField}
														error={fieldState.error}
														labelPlacement="outside"
														className="flex-grow"
														excludeSelf={false}
														label={`Competitor ${index + 1}`}
														isInvalid={!!fieldState.error}
														errorMessage={fieldState.error?.message}
														menuTrigger="manual"
													/>
												)}
											/>
											<Button
												isIconOnly
												color="danger"
												variant="light"
												onPress={() => handleRemoveMember(index)}
												className="mt-7"
												aria-label={`Remove competitor ${index + 1}`}
											>
												<Trash />
											</Button>
										</div>
									</div>
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
