import TokenAmount from "@/components/TokenAmount";
import TokenInfo from "@/components/TokenInfo";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Switch,
	useDisclosure,
} from "@nextui-org/react";
import type React from "react";
import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { FiPlus, FiTrash } from "react-icons/fi";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import AddDueForm from "./AddDueForm";

const MembersAndDuesForm: React.FC = () => {
	const { control, watch, getValues, setValue } =
		useFormContext<CreateCompetitionFormValues>();
	const membersFromDues = watch("membersFromDues");
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
	const [currentDueIndex, setCurrentDueIndex] = useState<number | null>(null);

	const {
		fields: dueFields,
		append: appendDue,
		remove: removeDue,
	} = useFieldArray({
		control,
		name: "dues",
	});

	const {
		fields: memberFields,
		append: appendMember,
		remove: removeMember,
	} = useFieldArray({
		control,
		name: "members",
	});

	const handleAddDue = () => {
		const newIndex = dueFields.length;
		appendDue({ addr: "", balance: { native: [], cw20: [], cw721: [] } });
		setCurrentDueIndex(newIndex);
		onOpen();
	};

	const handleEditDue = (index: number) => {
		setCurrentDueIndex(index);
		onOpen();
	};

	return (
		<div className="space-y-6">
			<Controller
				name="membersFromDues"
				control={control}
				render={({ field }) => (
					<Switch isSelected={field.value} onValueChange={field.onChange}>
						Members from Dues
					</Switch>
				)}
			/>

			{membersFromDues ? (
				<Card>
					<CardHeader>
						<h3 className="font-semibold text-lg">Dues</h3>
					</CardHeader>
					<CardBody>
						{dueFields.map((field, index) => (
							<div key={field.id} className="mb-4 space-y-2">
								<Controller
									name={`dues.${index}.addr`}
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											label={`Member ${index + 1} Address`}
											placeholder="Enter member address"
										/>
									)}
								/>
								<div className="flex flex-wrap gap-2">
									{field.balance.native.map((native, nativeIndex) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: easiest choice
										<div key={nativeIndex} className="flex items-center gap-2">
											<TokenInfo denomOrAddress={native.denom} isNative />
											<TokenAmount
												amount={native.amount}
												denomOrAddress={native.denom}
												isNative
											/>
											<Button
												isIconOnly
												color="danger"
												size="sm"
												onClick={() => {
													const newNative = [...field.balance.native];
													newNative.splice(nativeIndex, 1);
													setValue(`dues.${index}.balance.native`, newNative);
												}}
											>
												<FiTrash />
											</Button>
										</div>
									))}
									{field.balance.cw20.map((cw20, cw20Index) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: easiest choice
										<div key={cw20Index} className="flex items-center gap-2">
											<TokenInfo denomOrAddress={cw20.address} />
											<TokenAmount
												amount={cw20.amount}
												denomOrAddress={cw20.address}
											/>
											<Button
												isIconOnly
												color="danger"
												size="sm"
												onClick={() => {
													const newCw20 = [...field.balance.cw20];
													newCw20.splice(cw20Index, 1);
													setValue(`dues.${index}.balance.cw20`, newCw20);
												}}
											>
												<FiTrash />
											</Button>
										</div>
									))}
								</div>
								<div className="flex gap-2">
									<Button color="primary" onClick={() => handleEditDue(index)}>
										Add Token
									</Button>
									<Button
										color="danger"
										startContent={<FiTrash />}
										onClick={() => removeDue(index)}
									>
										Remove Due
									</Button>
								</div>
							</div>
						))}
						<Button
							color="primary"
							startContent={<FiPlus />}
							onClick={handleAddDue}
						>
							Add Due
						</Button>
					</CardBody>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<h3 className="font-semibold text-lg">Members</h3>
					</CardHeader>
					<CardBody>
						{memberFields.map((field, index) => (
							<div key={field.id} className="mb-2 flex items-center space-x-2">
								<Controller
									name={`members.${index}.address`}
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											label={`Member ${index + 1}`}
											placeholder="Enter member address"
											className="flex-grow"
										/>
									)}
								/>
								<Button
									isIconOnly
									color="danger"
									aria-label="Delete member"
									onClick={() => removeMember(index)}
								>
									<FiTrash />
								</Button>
							</div>
						))}
						<Button
							color="primary"
							startContent={<FiPlus />}
							onClick={() => appendMember({ address: "" })}
						>
							Add Member
						</Button>
					</CardBody>
				</Card>
			)}

			{currentDueIndex !== null && (
				<AddDueForm
					isOpen={isOpen}
					onOpenChange={onOpenChange}
					onClose={onClose}
					index={currentDueIndex}
				/>
			)}
		</div>
	);
};

export default MembersAndDuesForm;
