import Profile from "@/components/Profile";
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Divider,
	Select,
	SelectItem,
	type SelectedItems,
} from "@nextui-org/react";
import clsx from "clsx";
import { memo } from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import type { Match, MatchResult } from "~/codegen/ArenaTournamentModule.types";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useMatchResultsStore } from "./Bracket";

interface MatchNodeProps extends NodeProps {
	data: Match;
}

type SelectItemType = {
	team: string;
};

const MatchNode = memo(
	({ data, targetPosition, sourcePosition }: MatchNodeProps) => {
		const { data: cosmWasmClient } = useCosmWasmClient();
		const currentMatchResult = useMatchResultsStore((state) =>
			state.get(data.match_number),
		);
		const removeMatchResult = useMatchResultsStore((state) => state.remove);
		const setMatchResult = useMatchResultsStore((state) => state.add);

		if (!cosmWasmClient) return null;
		return (
			<>
				<Handle type="target" position={targetPosition ?? Position.Left} />
				<Card
					className={clsx(
						"min-w-80",
						data.team_1 &&
							data.team_2 &&
							!data.result &&
							"border-4 border-success",
					)}
				>
					<CardHeader className="font-bold text-4xl">
						Match {data.match_number}
					</CardHeader>
					<CardBody className="gap-4 text-center align-middle text-3xl">
						{data.team_1 ? (
							<Profile
								address={data.team_1}
								cosmWasmClient={cosmWasmClient}
								classNames={{ name: "text-3xl" }}
							/>
						) : (
							<p>TBD</p>
						)}
						<Divider />
						{data.team_2 ? (
							<Profile
								address={data.team_2}
								cosmWasmClient={cosmWasmClient}
								classNames={{ name: "text-3xl" }}
							/>
						) : (
							<p>TBD</p>
						)}
					</CardBody>
					<CardFooter className="mt-1">
						<Select
							items={[{ team: "team1" }, { team: "team2" }]}
							label="Match Result"
							placeholder="Select a winner"
							labelPlacement="outside"
							size="lg"
							isDisabled={!data.team_1 || !data.team_2}
							selectedKeys={currentMatchResult ? [currentMatchResult] : []}
							onChange={(e) => {
								if (!e.target.value) {
									removeMatchResult(data.match_number);
								} else {
									setMatchResult({
										match_number: data.match_number,
										match_result: e.target.value as MatchResult,
									});
								}
							}}
							renderValue={(items: SelectedItems<SelectItemType>) => {
								return items.map((item) => (
									<div key={item.key}>
										{item.textValue === "team1" && data.team_1 && (
											<Profile
												address={data.team_1}
												cosmWasmClient={cosmWasmClient}
												isTooltipDisabled
												classNames={{ name: "text-2xl" }}
											/>
										)}
										{item.textValue === "team2" && data.team_2 && (
											<Profile
												address={data.team_2}
												cosmWasmClient={cosmWasmClient}
												isTooltipDisabled
												classNames={{ name: "text-2xl" }}
											/>
										)}
									</div>
								));
							}}
						>
							{(user) => (
								<SelectItem key={user.team} textValue={user.team}>
									{user.team === "team1" && data.team_1 && (
										<Profile
											address={data.team_1}
											cosmWasmClient={cosmWasmClient}
											isTooltipDisabled
										/>
									)}
									{user.team === "team2" && data.team_2 && (
										<Profile
											address={data.team_2}
											cosmWasmClient={cosmWasmClient}
											isTooltipDisabled
										/>
									)}
								</SelectItem>
							)}
						</Select>
					</CardFooter>
				</Card>
				<Handle
					type="source"
					id="winner"
					position={sourcePosition ?? Position.Right}
				/>
				<Handle
					type="source"
					id="loser"
					position={sourcePosition ?? Position.Right}
					style={
						sourcePosition === Position.Right
							? { bottom: 30, top: "auto" }
							: { right: 30, left: "auto" }
					}
				/>
			</>
		);
	},
);

export default MatchNode;
