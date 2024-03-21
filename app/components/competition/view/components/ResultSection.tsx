import Profile from "@/components/Profile";
import {
	Card,
	CardBody,
	CardHeader,
	Input,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@nextui-org/react";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { useArenaWagerModuleResultQuery } from "~/codegen/ArenaWagerModule.react-query";
import type { WithClient } from "~/types/util";

interface ResultSectionProps {
	competitionId: string;
	moduleAddr: string;
}

const ResultSection = ({
	cosmWasmClient,
	competitionId,
	moduleAddr,
}: WithClient<ResultSectionProps>) => {
	const { data, isLoading, isError } = useArenaWagerModuleResultQuery({
		client: new ArenaWagerModuleQueryClient(cosmWasmClient, moduleAddr),
		args: { competitionId },
	});

	if (isError)
		return (
			<Card>
				<CardBody>Legacy escrow version - could not retrieve result</CardBody>
			</Card>
		);

	return (
		<Skeleton isLoaded={!isLoading}>
			<Card>
				<CardHeader>Result</CardHeader>
				<CardBody className="space-y-4">
					<Input
						label="Remainder Address"
						value={data?.remainder_addr}
						readOnly
					/>
					{data && (
						<Table aria-label="Distribution" removeWrapper>
							<TableHeader>
								<TableColumn>Member</TableColumn>
								<TableColumn>Percentage</TableColumn>
							</TableHeader>
							<TableBody>
								{data.member_percentages.map((item) => (
									<TableRow key={item.addr}>
										<TableCell>
											<Profile
												cosmWasmClient={cosmWasmClient}
												address={item.addr}
											/>
										</TableCell>
										<TableCell>
											<Input
												label="Percentage"
												value={item.percentage}
												readOnly
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardBody>
			</Card>
		</Skeleton>
	);
};

export default ResultSection;
