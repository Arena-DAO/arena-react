import { ProfileInput } from "@/components/ProfileInput";
import TokenAmount from "@/components/TokenAmount";
import TokenInfo from "@/components/TokenInfo";
import {
	Button,
	Card,
	CardBody,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	ScrollShadow,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tooltip,
} from "@heroui/react";
import { MoreVertical, Plus, Trash } from "lucide-react";
import {
	Controller,
	useFieldArray,
	useFormContext,
	useWatch,
} from "react-hook-form";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";

// Type for token balance item
interface TokenBalance {
	type: "native" | "cw20";
	denom: string;
	amount: string;
	index: number;
}

interface MemberDueProps {
	dueIndex: number;
	onEdit: () => void;
	onRemove: () => void;
}

const MemberDue = ({ dueIndex, onEdit, onRemove }: MemberDueProps) => {
	const { control } = useFormContext<CreateCompetitionFormValues>();

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

	// Combine balances for display
	const allBalances: TokenBalance[] = [
		...nativeBalances.map((item, idx) => ({
			type: "native" as const,
			denom: item.denom,
			amount: item.amount,
			index: idx,
		})),
		...cw20Balances.map((item, idx) => ({
			type: "cw20" as const,
			denom: item.address,
			amount: item.amount,
			index: idx,
		})),
	];

	const handleRemoveToken = (type: "native" | "cw20", index: number) => {
		if (type === "native") {
			removeNative(index);
		} else {
			removeCw20(index);
		}
	};

	// Empty state component for when no tokens are added
	const EmptyTokensState = () => (
		<div className="flex flex-col items-center justify-center py-6 text-center">
			<div className="mb-3 text-foreground/60">No tokens added yet</div>
			<Button
				variant="faded"
				startContent={<Plus size={16} />}
				onPress={onEdit}
				className="card-hover"
			>
				Add Token
			</Button>
		</div>
	);

	return (
		<Card className="mb-6 overflow-hidden border border-primary/10">
			<CardBody className="p-0">
				{/* Address header with actions */}
				<div className="border-primary/10 border-b p-4">
					<div className="flex items-center gap-3">
						<Controller
							name={`directParticipation.dues.${dueIndex}.addr`}
							control={control}
							render={({ field }) => (
								<ProfileInput field={field} menuTrigger="manual" />
							)}
						/>

						<Dropdown placement="bottom-end">
							<DropdownTrigger>
								<Button isIconOnly variant="flat" className="min-w-10">
									<MoreVertical size={18} />
								</Button>
							</DropdownTrigger>
							<DropdownMenu aria-label="Due actions">
								<DropdownItem
									key="add"
									startContent={<Plus size={16} />}
									onPress={onEdit}
								>
									Add Token
								</DropdownItem>
								<DropdownItem
									key="remove"
									startContent={<Trash size={16} />}
									onPress={onRemove}
									color="danger"
								>
									Remove Due
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				</div>

				{/* Token balances section */}
				<div className="p-0">
					{allBalances.length > 0 ? (
						<ScrollShadow className="max-h-64">
							<Table
								removeWrapper
								aria-label="Token Balances"
								isStriped
								className="min-w-full"
							>
								<TableHeader>
									<TableColumn className="w-1/2 pl-6">Token</TableColumn>
									<TableColumn className="text-right">Amount</TableColumn>
									<TableColumn className="w-24 pr-6 text-right">
										Actions
									</TableColumn>
								</TableHeader>
								<TableBody>
									{allBalances.map((token) => (
										<TableRow
											key={`${token.type}-${token.index}-${token.denom}`}
										>
											<TableCell className="pl-6">
												<div className="flex items-center gap-2">
													<TokenInfo
														denomOrAddress={token.denom}
														isNative={token.type === "native"}
													/>
													<Chip
														size="sm"
														variant="flat"
														className="h-6"
														color={
															token.type === "native" ? "primary" : "secondary"
														}
													>
														{token.type === "native" ? "Native" : "CW20"}
													</Chip>
												</div>
											</TableCell>
											<TableCell className="text-right font-medium">
												<TokenAmount
													amount={token.amount}
													denomOrAddress={token.denom}
													isNative={token.type === "native"}
												/>
											</TableCell>
											<TableCell className="pr-6 text-right">
												<Tooltip content="Remove token">
													<Button
														isIconOnly
														size="sm"
														variant="faded"
														onPress={() =>
															handleRemoveToken(token.type, token.index)
														}
													>
														<Trash size={16} />
													</Button>
												</Tooltip>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</ScrollShadow>
					) : (
						<EmptyTokensState />
					)}
				</div>
			</CardBody>
		</Card>
	);
};

export default MemberDue;
