import { useAsyncList } from "@react-stately/data";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
	Background,
	Controls,
	MiniMap,
	useNodesState,
	useEdgesState,
	useReactFlow,
	type Edge,
	Panel,
	type Node,
} from "reactflow";
import { ArenaTournamentModuleQueryClient } from "~/codegen/ArenaTournamentModule.client";
import type { Match } from "~/codegen/ArenaTournamentModule.types";
import { useEnv } from "~/hooks/useEnv";
import type { WithClient } from "~/types/util";
import "reactflow/dist/style.css";
import Dagre from "@dagrejs/dagre";
import { Button } from "@nextui-org/react";

interface BracketProps {
	tournament_id: string;
}

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (
	nodes: Node[],
	edges: Edge[],
	options: { direction: string },
) => {
	g.setGraph({ rankdir: options.direction });

	for (const edge of edges) {
		g.setEdge(edge.source, edge.target);
	}
	for (const node of nodes) {
		g.setNode(node.id, node as string | Dagre.Label);
	}

	Dagre.layout(g);

	return {
		nodes: nodes.map((node) => {
			const position = g.node(node.id);
			// We are shifting the dagre node position (anchor=center center) to the top left
			// so it matches the React Flow node anchor point (top left).
			const x = position.x - (node.width ?? 0) / 2;
			const y = position.y - (node.height ?? 0) / 2;

			return { ...node, position: { x, y } };
		}),
		edges,
	};
};

function convertMatchesToNodesEdges(matches: Match[]) {
	const nodes = matches.map((match) => ({
		id: match.match_number.toString(),
		data: {
			label: `Match #${match.match_number}: ${match.team_1?.toString()} vs ${match.team_2?.toString()}`,
		},
		position: { x: 0, y: 0 },
	}));

	const edges = matches.flatMap((match) => {
		const edges = [];
		if (match.next_match_winner) {
			edges.push({
				id: `win-${match.match_number}-${match.next_match_winner}`,
				source: match.match_number.toString(),
				target: match.next_match_winner.toString(),
				animated: true,
			});
		}
		if (match.next_match_loser) {
			edges.push({
				id: `lose-${match.match_number}-${match.next_match_loser}`,
				source: match.match_number.toString(),
				target: match.next_match_loser.toString(),
				animated: true,
				style: { stroke: "#ff6666" }, // Styling for losing paths
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
	const { fitView } = useReactFlow();

	const { items, loadMore, loadingState } = useAsyncList<
		Match,
		string | undefined
	>({
		async load({ cursor }) {
			const data = (await client.queryExtension({
				msg: { bracket: { tournament_id, start_after: cursor } },
			})) as unknown as Match[];
			setHasMore(data.length === env.PAGINATION_LIMIT);
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

	useEffect(() => {
		const { nodes: newNodes, edges: newEdges } =
			convertMatchesToNodesEdges(items);
		const layouted = getLayoutedElements(newNodes, newEdges, {
			direction: "TB",
		});
		setNodes(layouted.nodes);
		setEdges(layouted.edges);
	}, [items, setEdges, setNodes]);

	const onLayout = useCallback(
		(direction: string) => {
			const layouted = getLayoutedElements(nodes, edges, { direction });

			setNodes([...layouted.nodes]);
			setEdges([...layouted.edges]);

			window.requestAnimationFrame(() => {
				fitView();
			});
		},
		[nodes, edges, fitView, setNodes, setEdges],
	);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			fitView
		>
			<Background />
			<MiniMap />
			<Controls />
			<Panel position="top-right">
				<Button onClick={() => onLayout("TB")}>Vertical layout</Button>
				<Button onClick={() => onLayout("LR")}>Horizontal layout</Button>
			</Panel>
		</ReactFlow>
	);
}

export default Bracket;
