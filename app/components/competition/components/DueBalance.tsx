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
} from "@nextui-org/react";
import { useFieldArray } from "react-hook-form";
import { WithClient } from "~/types/util";
import { FormComponentProps } from "../CreateCompetitionForm";

const DueBalance = ({
	cosmWasmClient,
	index,
	control,
}: WithClient<FormComponentProps> & { index: number }) => {
	const native = useFieldArray({
		control,
		name: `dues.${index}.balance.native`,
	});
	const cw20 = useFieldArray({ control, name: `dues.${index}.balance.cw20` });
	const cw721 = useFieldArray({ control, name: `dues.${index}.balance.cw721` });

	return (
		<Card>
			<CardHeader>
				<Button>Add Due</Button>
			</CardHeader>
			<CardBody>
				<Table removeWrapper>
					<TableHeader>
						<TableColumn>Token</TableColumn>
						<TableColumn>Amount</TableColumn>
					</TableHeader>
					<TableBody emptyContent="None due">
						{native.fields.map((x) => (
							<TableRow key={x.id}>
								<TableCell>
									<TokenInfo
										cosmWasmClient={cosmWasmClient}
										denomOrAddress={x.denom}
										isNative
									/>
								</TableCell>
								<TableCell>{x.amount}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardBody>
		</Card>
	);
};

export default DueBalance;
