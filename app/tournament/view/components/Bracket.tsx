import { useAsyncList } from "@react-stately/data";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
	Background,
	Controls,
	useNodesState,
	useEdgesState,
	type Edge,
	Panel,
	type Node,
	Position,
} from "reactflow";
import { ArenaTournamentModuleQueryClient } from "~/codegen/ArenaTournamentModule.client";
import type { Match } from "~/codegen/ArenaTournamentModule.types";
import { useEnv } from "~/hooks/useEnv";
import type { WithClient } from "~/types/util";
import "reactflow/dist/style.css";
import dagre from "@dagrejs/dagre";
import { Button, ButtonGroup } from "@nextui-org/react";
import MatchNode from "./MatchNode";

interface BracketProps {
	tournament_id: string;
}

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeTypes = {
	matchNode: MatchNode,
};

const getLayoutedElements = (
	nodes: Node[],
	edges: Edge[],
	options: { direction: string },
) => {
	const isHorizontal = options.direction === "LR";
	dagreGraph.setGraph({ rankdir: options.direction });

	for (const node of nodes) {
		dagreGraph.setNode(node.id, {
			width: 350,
			height: 200,
		});
	}
	for (const edge of edges) {
		dagreGraph.setEdge(edge.source, edge.target, {
			weight: edge.id.startsWith("win") ? 10 : 1,
		});
	}

	dagre.layout(dagreGraph, { ranker: "longest-path" });

	return {
		nodes: nodes.map((node) => {
			const position = dagreGraph.node(node.id);
			// We are shifting the dagre node position (anchor=center center) to the top left
			// so it matches the React Flow node anchor point (top left).
			const x = position.x - (node.width ?? 0) / 2;
			const y = position.y - (node.height ?? 0) / 2;

			node.targetPosition = isHorizontal ? Position.Left : Position.Top;
			node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

			return { ...node, position: { x, y } };
		}),
		edges,
	};
};

function convertMatchesToNodesEdges(matches: Match[]) {
	const nodes: Node[] = matches.map((match) => ({
		id: match.match_number.toString(),
		data: match,
		type: "matchNode",
		position: { x: 0, y: 0 },
	}));

	const edges: Edge[] = matches.flatMap((match) => {
		const edges = [];
		if (match.next_match_winner) {
			edges.push({
				id: `win-${match.match_number}-${match.next_match_winner}`,
				source: match.match_number.toString(),
				target: match.next_match_winner.toString(),
				type: "smoothstep",
				sourceHandle: "winner",
				style: { stroke: match.is_losers_bracket ? "#FF0000" : undefined },
			});
		}
		if (match.next_match_loser) {
			edges.push({
				id: `lose-${match.match_number}-${match.next_match_loser}`,
				source: match.match_number.toString(),
				target: match.next_match_loser.toString(),
				type: "smoothstep",
				sourceHandle: "loser",
				style: { stroke: "#FF8000" }, // Styling for losing paths
			});
		}
		return edges;
	});

	return { nodes, edges };
}

function Bracket({ tournament_id, cosmWasmClient }: WithClient<BracketProps>) {
	const { data: env } = useEnv();
	const client = new ArenaTournamentModuleQueryClient(
		cosmWasmClient,
		env.ARENA_TOURNAMENT_MODULE_ADDRESS,
	);
	const [hasMore, setHasMore] = useState(false);
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);

	const { loadMore, loadingState } = useAsyncList<Match, string | undefined>({
		async load({ cursor }) {
			const data = (await client.queryExtension({
				msg: { bracket: { tournament_id, start_after: cursor } },
			})) as unknown as Match[];
			setHasMore(data.length === env.PAGINATION_LIMIT);

			// connect nodes
			const { nodes: newNodes, edges: newEdges } =
				convertMatchesToNodesEdges(data);
			const { nodes: layoutedNodes, edges: layoutedEdges } =
				getLayoutedElements([...nodes, ...newNodes], [...edges, ...newEdges], {
					direction: "LR",
				});
			setNodes([...layoutedNodes]);
			setEdges([...layoutedEdges]);

			return {
				items: data,
				cursor: data[data.length - 1]?.match_number,
			};
		},
	});

	useEffect(() => {
		if (hasMore && loadingState === "idle") {
			loadMore();
		}
	}, [hasMore, loadingState, loadMore]);

	const onLayout = useCallback(
		(direction: string) => {
			const { nodes: layoutedNodes, edges: layoutedEdges } =
				getLayoutedElements(nodes, edges, { direction });

			setNodes([...layoutedNodes]);
			setEdges([...layoutedEdges]);
		},
		[nodes, edges, setEdges, setNodes],
	);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			nodeTypes={nodeTypes}
			fitView
			minZoom={0.1}
		>
			<Background size={2} />
			<Controls />
			<Panel position="top-right">
				<ButtonGroup>
					<Button onClick={() => onLayout("TB")}>Vertical Layout</Button>
					<Button onClick={() => onLayout("LR")}>Horizontal Layout</Button>
					<Button>Submit</Button>
				</ButtonGroup>
			</Panel>
		</ReactFlow>
	);
}

export default Bracket;
