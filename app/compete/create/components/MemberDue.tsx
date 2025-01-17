import Profile from "@/components/Profile";
import TokenAmount from "@/components/TokenAmount";
import TokenInfo from "@/components/TokenInfo";
import {
	Button,
	ButtonGroup,
	Input,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tooltip,
} from "@heroui/react";
import type React from "react";
import {
	Controller,
	useFieldArray,
	useFormContext,
	useWatch,
} from "react-hook-form";
import { FiMinus, FiPlus, FiTrash } from "react-icons/fi";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";

interface MemberDueProps {
	dueIndex: number;
	onEdit: () => void;
	onRemove: () => void;
}

const MemberDue: React.FC<MemberDueProps> = ({
	dueIndex,
	onEdit,
	onRemove,
}) => {
	const { control } = useFormContext<CreateCompetitionFormValues>();
	const dueAddress = useWatch({
		control,
		name: `directParticipation.dues.${dueIndex}.addr`,
	});
	const nativeBalances =
		useWatch({
			control,
			name: `directParticipation.dues.${dueIndex}.balance.native`,
		}) || [];
	const cw20Balances =
		useWatch({
			control,
			name: `directParticipation.dues.${dueIndex}.balance.cw20`,
		}) || [];

	const { remove: removeNative } = useFieldArray({
		control,
		name: `directParticipation.dues.${dueIndex}.balance.native`,
	});

	const { remove: removeCw20 } = useFieldArray({
		control,
		name: `directParticipation.dues.${dueIndex}.balance.cw20`,
	});

	return (
		<div className="mb-4">
			<div className="mb-2 flex items-center space-x-2">
				<Profile address={dueAddress} justAvatar />
				<Controller
					name={`directParticipation.dues.${dueIndex}.addr`}
					control={control}
					render={({ field, fieldState: { error } }) => (
						<Input
							isRequired
							isInvalid={!!error}
							errorMessage={error?.message}
							{...field}
							label={`Due Address ${dueIndex + 1}`}
							placeholder="Enter due address"
							endContent={
								<ButtonGroup variant="faded" className="my-auto">
									<Tooltip content="Remove dues">
										<Button isIconOnly onPress={onRemove}>
											<FiMinus />
										</Button>
									</Tooltip>
									<Tooltip content="Add more due">
										<Button isIconOnly onPress={onEdit}>
											<FiPlus />
										</Button>
									</Tooltip>
								</ButtonGroup>
							}
						/>
					)}
				/>
			</div>
			<div className="space-y-2">
				{nativeBalances.length > 0 && (
					<Table removeWrapper aria-label="Native Dues">
						<TableHeader>
							<TableColumn className="w-1/2">Native Token</TableColumn>
							<TableColumn className="text-right">Amount</TableColumn>
							<TableColumn className="text-right">Actions</TableColumn>
						</TableHeader>
						<TableBody>
							{nativeBalances.map((field, index) => (
								<TableRow key={field.denom}>
									<TableCell className="w-1/2">
										<TokenInfo denomOrAddress={field.denom} isNative />
									</TableCell>
									<TableCell className="text-right">
										<TokenAmount
											amount={field.amount}
											denomOrAddress={field.denom}
											isNative
										/>
									</TableCell>
									<TableCell className="text-right">
										<Tooltip content="Remove due">
											<Button
												variant="faded"
												isIconOnly
												aria-label="Remove due"
												onPress={() => removeNative(index)}
											>
												<FiMinus />
											</Button>
										</Tooltip>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}

				{cw20Balances.length > 0 && (
					<Table removeWrapper aria-label="Cw20 Dues">
						<TableHeader>
							<TableColumn className="w-1/2">Cw20 Token</TableColumn>
							<TableColumn className="text-right">Amount</TableColumn>
							<TableColumn className="text-right">Actions</TableColumn>
						</TableHeader>
						<TableBody>
							{cw20Balances.map((field, index) => (
								<TableRow key={field.address}>
									<TableCell className="w-1/2">
										<TokenInfo denomOrAddress={field.address} />
									</TableCell>
									<TableCell className="text-right">
										<TokenAmount
											amount={field.amount}
											denomOrAddress={field.address}
										/>
									</TableCell>
									<TableCell className="text-right">
										<Tooltip content="Remove due">
											<Button
												variant="faded"
												isIconOnly
												aria-label="Remove due"
												onPress={() => removeCw20(index)}
											>
												<FiTrash />
											</Button>
										</Tooltip>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>
		</div>
	);
};

export default MemberDue;
