"use client";

import Profile from "@/components/Profile";
import {
	Card,
	CardBody,
	CardHeader,
	Progress,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { Award } from "lucide-react";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { useArenaWagerModuleResultQuery } from "~/codegen/ArenaWagerModule.react-query";
import { getNumberWithOrdinal } from "~/helpers/UIHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";

interface ResultSectionProps {
	competitionId: string;
	moduleAddr: string;
}

const ResultSection = ({ competitionId, moduleAddr }: ResultSectionProps) => {
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { data, isLoading, isError } = useArenaWagerModuleResultQuery({
		client:
			cosmWasmClient &&
			new ArenaWagerModuleQueryClient(cosmWasmClient, moduleAddr),
		args: { competitionId },
		options: { enabled: !!cosmWasmClient },
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
				<CardHeader>
					<div className="flex items-center gap-2">
						<Award className="text-primary-500" />
						<h2 className="font-semibold text-xl">Result</h2>
					</div>
				</CardHeader>
				<CardBody className="space-y-4">
					{!data && <p className="font-bold text-lg">Draw</p>}
					{data && (
						<>
							{data?.remainder_addr && (
								<div className="flex items-center space-x-2">
									<div className="text-sm">Remainder:</div>
									<Profile address={data.remainder_addr} />
								</div>
							)}

							<Table aria-label="Distribution" removeWrapper>
								<TableHeader>
									<TableColumn>Member</TableColumn>
									<TableColumn>Percentage</TableColumn>
								</TableHeader>
								<TableBody>
									{data.member_percentages.map((item, i) => (
										<TableRow key={item.addr}>
											<TableCell>
												<Profile address={item.addr} />
											</TableCell>
											<TableCell>
												<Progress
													aria-label={`${getNumberWithOrdinal(i + 1)} place`}
													value={Number.parseFloat(item.percentage) * 100}
													color="primary"
													className="flex-grow"
													label={`${getNumberWithOrdinal(i + 1)} place:`}
													showValueLabel
												/>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</>
					)}
				</CardBody>
			</Card>
		</Skeleton>
	);
};

export default ResultSection;
