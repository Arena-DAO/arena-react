import Profile from "@/components/Profile";
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { memo } from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import type { Match } from "~/codegen/ArenaTournamentModule.types";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";

interface MatchNodeProps extends NodeProps {
	data: Match;
}

const MatchNode = memo(
	({ data, targetPosition, sourcePosition }: MatchNodeProps) => {
		const { data: cosmWasmClient } = useCosmWasmClient();

		if (!cosmWasmClient) return null;

		return (
			<>
				<Handle type="target" position={targetPosition ?? Position.Left} />
				<Card className="min-w-72">
					<CardHeader>Match {data.match_number}</CardHeader>
					<CardBody className="gap-4 text-center align-middle">
						{data.team_1 ? (
							<Profile address={data.team_1} cosmWasmClient={cosmWasmClient} />
						) : (
							<p className="text-small">TBD</p>
						)}
						<Divider />
						{data.team_2 ? (
							<Profile address={data.team_2} cosmWasmClient={cosmWasmClient} />
						) : (
							<p className="text-small">TBD</p>
						)}
					</CardBody>
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
