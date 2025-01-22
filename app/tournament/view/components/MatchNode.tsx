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
} from "@heroui/react";
import clsx from "clsx";
import { memo } from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import type { Match, MatchResult } from "~/codegen/ArenaTournamentModule.types";
import { useMatchResultsStore } from "./Bracket";

interface MatchNodeProps extends NodeProps {
	data: Match;
}

type SelectItemType = {
	team: string;
};

const HANDLE_STYLES = {
	winner: {
		background: "#4CAF50",
		width: 8,
		height: 8,
	},
	loser: {
		background: "#FF5722",
		width: 8,
		height: 8,
	},
};

const MatchNode = memo(({ data }: MatchNodeProps) => {
	const removeMatchResult = useMatchResultsStore((state) => state.remove);
	const setMatchResult = useMatchResultsStore((state) => state.add);

	return (
		<>
			<Handle type="target" position={Position.Left} />
			<Card
				className={clsx(
					"min-w-80",
					data.team_1 &&
						data.team_2 &&
						!data.result &&
						"border-4 border-primary",
				)}
			>
				<CardHeader className="font-bold text-4xl">
					Match {data.match_number}
				</CardHeader>
				<CardBody className="gap-4 text-center align-middle text-4xl">
					{data.team_1 ? (
						<Profile address={data.team_1} classNames={{ name: "text-4xl" }} />
					) : (
						<p>TBD</p>
					)}
					<Divider />
					{data.team_2 ? (
						<Profile address={data.team_2} classNames={{ name: "text-4xl" }} />
					) : (
						<p>TBD</p>
					)}
				</CardBody>
				<CardFooter className="mt-1">
					<Select
						items={[{ team: "team1" }, { team: "team2" }]}
						label="Winner"
						placeholder="Select a winner"
						labelPlacement="outside"
						size="lg"
						isDisabled={!data.team_1 || !data.team_2}
						defaultSelectedKeys={data.result ? [data.result] : []}
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
											isPopoverDisabled
											classNames={{ name: "text-3xl" }}
										/>
									)}
									{item.textValue === "team2" && data.team_2 && (
										<Profile
											address={data.team_2}
											isPopoverDisabled
											classNames={{ name: "text-3xl" }}
										/>
									)}
								</div>
							));
						}}
					>
						{(user) => (
							<SelectItem key={user.team} textValue={user.team}>
								{user.team === "team1" && data.team_1 && (
									<Profile address={data.team_1} isPopoverDisabled />
								)}
								{user.team === "team2" && data.team_2 && (
									<Profile address={data.team_2} isPopoverDisabled />
								)}
							</SelectItem>
						)}
					</Select>
				</CardFooter>
			</Card>
			<Handle
				type="source"
				id="winner"
				position={Position.Right}
				style={{
					...HANDLE_STYLES.winner,
					...{ top: "35%", bottom: "auto" },
				}}
			/>
			<Handle
				type="source"
				id="loser"
				position={Position.Right}
				style={{
					...HANDLE_STYLES.loser,
					...{ top: "65%", bottom: "auto" },
				}}
			/>
		</>
	);
});

export default MatchNode;
