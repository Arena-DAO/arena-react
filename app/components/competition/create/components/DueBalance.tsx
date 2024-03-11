import TokenAmount from "@/components/TokenAmount";
import TokenInfo from "@/components/TokenInfo";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tooltip,
	useDisclosure,
} from "@nextui-org/react";
import { type UseFormGetValues, useFieldArray } from "react-hook-form";
import { FiPlus, FiTrash } from "react-icons/fi";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import type {
	CreateCompetitionFormValues,
	FormComponentProps,
} from "../CreateCompetitionForm";
import AddDueForm from "./AddDueForm";

const DueBalance = ({
	index,
	control,
	getValues,
}: FormComponentProps & {
	index: number;
	getValues: UseFormGetValues<CreateCompetitionFormValues>;
}) => {
	const { data: cosmWasmClient } = useCosmWasmClient();
	const native = useFieldArray({
		control,
		name: `dues.${index}.balance.native`,
	});
	const cw20 = useFieldArray({ control, name: `dues.${index}.balance.cw20` });
	const cw721 = useFieldArray({ control, name: `dues.${index}.balance.cw721` });
	const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

	return (
		<>
			<Card>
				<CardHeader>
					<Button startContent={<FiPlus />} onPress={onOpen}>
						Add Due
					</Button>
				</CardHeader>
				<CardBody className="space-y-2">
					{native.fields.length === 0 && cw20.fields.length === 0 && (
						<p>None due yet... add some!</p>
					)}
					{native.fields.length > 0 && (
						<Table removeWrapper aria-label="Native Dues">
							<TableHeader>
								<TableColumn className="w-1/2">Native Token</TableColumn>
								<TableColumn className="text-right">Amount</TableColumn>
								<TableColumn className="text-right">Actions</TableColumn>
							</TableHeader>
							<TableBody>
								{native.fields.map((x, i) => (
									<TableRow key={x.id}>
										<TableCell className="w-1/2">
											{cosmWasmClient && (
												<TokenInfo
													cosmWasmClient={cosmWasmClient}
													denomOrAddress={x.denom}
													isNative
												/>
											)}
										</TableCell>
										<TableCell className="text-right">
											{cosmWasmClient && (
												<TokenAmount
													cosmWasmClient={cosmWasmClient}
													amount={x.amount}
													denomOrAddress={x.denom}
													isNative
												/>
											)}
										</TableCell>
										<TableCell className="text-right">
											<Tooltip content="Delete due">
												<Button
													isIconOnly
													aria-label="Delete Native Due"
													onClick={() => native.remove(i)}
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
					{cw20.fields.length > 0 && (
						<Table removeWrapper aria-label="Cw20 Dues">
							<TableHeader>
								<TableColumn className="w-1/2">Cw20 Token</TableColumn>
								<TableColumn className="w-1/4 text-right">Amount</TableColumn>
								<TableColumn className="w-1/4 text-right">Actions</TableColumn>
							</TableHeader>
							<TableBody>
								{cw20.fields.map((x, i) => (
									<TableRow key={x.id}>
										<TableCell className="w-1/2">
											{cosmWasmClient && (
												<TokenInfo
													cosmWasmClient={cosmWasmClient}
													denomOrAddress={x.address}
												/>
											)}
										</TableCell>
										<TableCell className="w-1/4 text-right">
											{cosmWasmClient && (
												<TokenAmount
													cosmWasmClient={cosmWasmClient}
													amount={x.amount}
													denomOrAddress={x.address}
												/>
											)}
										</TableCell>
										<TableCell className="w-1/4 text-right">
											<Tooltip content="Delete due">
												<Button
													isIconOnly
													aria-label="Delete CW20 Due"
													onClick={() => cw20.remove(i)}
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
				</CardBody>
			</Card>
			<AddDueForm
				isOpen={isOpen}
				getValues={getValues}
				onClose={onClose}
				onOpenChange={onOpenChange}
				cw20Append={cw20.append}
				cw721Append={cw721.append}
				nativeAppend={native.append}
				index={index}
			/>
		</>
	);
};

export default DueBalance;
