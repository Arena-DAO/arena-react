"use client";

import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Select,
	SelectItem,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@nextui-org/react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
	ArenaLeagueModuleClient,
	ArenaLeagueModuleQueryClient,
} from "~/codegen/ArenaLeagueModule.client";
import { useArenaLeagueModuleQueryExtensionQuery } from "~/codegen/ArenaLeagueModule.react-query";
import type {
	CompetitionStatus,
	Result,
	RoundResponse,
} from "~/codegen/ArenaLeagueModule.types";
import { LeagueResultValues } from "~/helpers/ArenaHelpers";
import { useEnv } from "~/hooks/useEnv";
import type { WithClient } from "~/types/util";

interface RoundDisplayProps {
	league_id: string;
	moduleAddr: string;
	round_number: string;
	version: number;
	setVersion: Dispatch<SetStateAction<number>>;
	setStatus: Dispatch<SetStateAction<CompetitionStatus>>;
}

const RoundDisplay = ({
	cosmWasmClient,
	moduleAddr,
	league_id,
	round_number,
	version,
	setVersion,
	setStatus,
}: WithClient<RoundDisplayProps>) => {
	const { data: env } = useEnv();
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const { data, refetch } = useArenaLeagueModuleQueryExtensionQuery({
		client: new ArenaLeagueModuleQueryClient(cosmWasmClient, moduleAddr),
		args: { msg: { round: { league_id, round_number } } },
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [changeMap, setChangeMap] = useState(new Map<string, Result>());
	// biome-ignore lint/correctness/useExhaustiveDependencies: We want to clear the change map if the round number changes
	useEffect(() => {
		setChangeMap(new Map());
	}, [round_number]);
	useEffect(() => {
		if (version > 0) refetch();
	}, [version, refetch]);

	if (!data) return null;

	const parsedData = data as unknown as RoundResponse;
	const handleSelectionChange = (
		match_number: string,
		e: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const { value } = e.target;

		if (!value) {
			const updatedMap = new Map(changeMap);

			updatedMap.delete(match_number);

			setChangeMap(updatedMap);
		} else {
			setChangeMap((x) => new Map(x.set(match_number, value as Result)));
		}
	};

	const onSubmit = async () => {
		try {
			setIsSubmitting(true);
			const cosmWasmClient = await getSigningCosmWasmClient();
			if (!address) throw "Could not get user address";
			if (changeMap.size === 0) throw "No round updates given";

			const leagueModuleClient = new ArenaLeagueModuleClient(
				cosmWasmClient,
				address,
				env.ARENA_LEAGUE_MODULE_ADDRESS,
			);

			const response = await leagueModuleClient.extension({
				msg: {
					process_match: {
						league_id,
						round_number,
						match_results: Array.from(changeMap.entries()).map((x) => ({
							match_number: x[0],
							result: x[1],
						})),
					},
				},
			});

			toast.success("The results were submitted");
			setVersion((x) => x + 1);

			if (
				response.events.find((event) =>
					event.attributes.find(
						(attr) =>
							attr.key === "action" && attr.value === "process_competition",
					),
				)
			) {
				setStatus("inactive");
			}
			// biome-ignore lint/suspicious/noExplicitAny: Try-catch
		} catch (e: any) {
			console.error(e);
			toast.error(e.toString());
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<Table aria-label="Leaderboard" removeWrapper>
				<TableHeader>
					<TableColumn>Team 1</TableColumn>
					<TableColumn>Team 2</TableColumn>
					<TableColumn>Action</TableColumn>
				</TableHeader>
				<TableBody items={parsedData.matches}>
					{(x) => (
						<TableRow key={x.match_number}>
							<TableCell>
								<Profile address={x.team_1} cosmWasmClient={cosmWasmClient} />
							</TableCell>
							<TableCell>
								<Profile address={x.team_2} cosmWasmClient={cosmWasmClient} />
							</TableCell>
							<TableCell>
								<Select
									label="Result"
									className="min-w-52"
									value={changeMap.get(x.match_number)}
									isDisabled={!!x.result && env.ARENA_CORE_ADDRESS !== address}
									defaultSelectedKeys={x.result ? [x.result] : undefined}
									onChange={(e) => handleSelectionChange(x.match_number, e)}
								>
									{LeagueResultValues.map((x) => (
										<SelectItem key={x.value} value={x.value}>
											{x.display}
										</SelectItem>
									))}
								</Select>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<div className="flex">
				<Button
					type="submit"
					className="ml-auto"
					onClick={onSubmit}
					isDisabled={changeMap.size === 0 || !address || isSubmitting}
				>
					Submit
				</Button>
			</div>
		</>
	);
};

export default RoundDisplay;
