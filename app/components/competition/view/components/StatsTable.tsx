import Profile from "@/components/Profile";
import {
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	getKeyValue,
} from "@nextui-org/react";
import type React from "react";
import { useMemo } from "react";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { useArenaWagerModuleStatsTableQuery } from "~/codegen/ArenaWagerModule.react-query";
import type {
	StatMsg,
	StatTableEntry,
	StatValue,
} from "~/codegen/ArenaWagerModule.types";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";

interface StatsTableProps {
	moduleAddr: string;
	competitionId: string;
}

const StatsTable: React.FC<StatsTableProps> = ({
	moduleAddr,
	competitionId,
}) => {
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { data, isLoading } = useArenaWagerModuleStatsTableQuery({
		client:
			cosmWasmClient &&
			new ArenaWagerModuleQueryClient(cosmWasmClient, moduleAddr),
		args: { competitionId },
		options: {
			enabled: !!cosmWasmClient,
			retry: false,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			refetchOnMount: false,
		},
	});

	const { rows, columns } = useMemo(() => {
		if (!data || data.length === 0 || !data[0])
			return { rows: [], columns: [{ key: "addr", label: "MEMBER" }] };

		const renderStatValue = (value: StatValue) => {
			if ("bool" in value) return value.bool.toString();
			if ("decimal" in value) return `${Number(value.decimal) * 100}%`;
			if ("uint" in value) return value.uint;
			return "N/A";
		};

		const columns = [
			{ key: "addr", label: "MEMBER" },
			...data[0].stats.map((stat: StatMsg) => ({
				key: stat.name,
				label: stat.name.toUpperCase(),
			})),
		];

		const rows = data.map((entry: StatTableEntry, index: number) => {
			const row: Record<string, string> = {
				key: index.toString(),
				addr: entry.addr,
			};
			for (const stat of entry.stats) {
				row[stat.name] = renderStatValue(stat.value);
			}
			return row;
		});

		return { rows, columns };
	}, [data]);

	return (
		<Table aria-label="Competition Stats Table" removeWrapper>
			<TableHeader columns={columns}>
				{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
			</TableHeader>
			<TableBody
				items={rows}
				emptyContent="No stats recorded for the competition yet"
				isLoading={isLoading}
				loadingContent={<Spinner content="Loading stats..." />}
			>
				{(item) => (
					<TableRow key={item.key}>
						{(columnKey) => (
							<TableCell>
								{columnKey === "addr" ? (
									<Profile address={getKeyValue(item, columnKey)} />
								) : (
									getKeyValue(item, columnKey)
								)}
							</TableCell>
						)}
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
};

export default StatsTable;
