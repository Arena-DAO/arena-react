import { useEffect, useMemo, useState } from "react";
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
import {
	ArenaTournamentModuleClient,
	ArenaTournamentModuleQueryClient,
} from "~/codegen/ArenaTournamentModule.client";
import type {
	Match,
	MatchResult,
	MatchResultMsg,
} from "~/codegen/ArenaTournamentModule.types";
import { useEnv } from "~/hooks/useEnv";
import "reactflow/dist/style.css";
import { useChain } from "@cosmos-kit/react";
import dagre from "@dagrejs/dagre";
import { Button, ButtonGroup } from "@heroui/react";
import {
	type QueryClient,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	BsFullscreen,
	BsFullscreenExit,
	BsShare,
	BsUpload,
} from "react-icons/bs";
import { toast } from "react-toastify";
import useClipboard from "react-use-clipboard";
import { create } from "zustand";
import { arenaCoreQueryKeys } from "~/codegen/ArenaCore.react-query";
import { arenaEscrowQueryKeys } from "~/codegen/ArenaEscrow.react-query";
import {
	arenaTournamentModuleQueryKeys,
	useArenaTournamentModuleExtensionMutation,
} from "~/codegen/ArenaTournamentModule.react-query";
import { useCategoryContext } from "~/contexts/CategoryContext";
import { getCompetitionQueryKey } from "~/helpers/CompetitionHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import type { Profile } from "~/hooks/useProfile";
import type { CompetitionResponse } from "~/types/CompetitionResponse";
import MatchNode from "./MatchNode";

interface BracketProps {
	tournamentId: string;
	escrow?: string | null;
	isHost?: boolean;
	showBracket?: boolean;
}

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeTypes = {
	matchNode: MatchNode,
};

const EDGE_STYLES = {
	winner: {
		stroke: "#4CAF50",
		strokeWidth: 3,
	},
	loser: {
		stroke: "#FF5722",
		strokeWidth: 3,
		strokeDasharray: "5,5",
	},
	redemption: {
		stroke: "#FFFF00",
		strokeWidth: 3,
		strokeDasharray: "5,5",
	},
};

interface MatchResultsState {
	matchResults: Map<string, MatchResult>;
	add: (matchResult: MatchResultMsg) => void;
	remove: (matchNumber: string) => void;
	get: (matchNumber: string) => MatchResult | undefined;
}

export const useMatchResultsStore = create<MatchResultsState>()((set, get) => ({
	matchResults: new Map(),
	add: (matchResult) =>
		set((state) => {
			return {
				matchResults: new Map(state.matchResults).set(
					matchResult.match_number,
					matchResult.match_result,
				),
			};
		}),
	remove: (matchNumber) =>
		set((state) => {
			const newResults = new Map(state.matchResults);
			newResults.delete(matchNumber);
			return {
				matchResults: newResults,
			};
		}),
	get: (matchNumber) => get().matchResults.get(matchNumber),
}));

const getLayoutedElements = (
	queryClient: QueryClient,
	nodes: Node[],
	edges: Edge[],
) => {
	dagreGraph.setGraph({
		rankdir: "LR",
		ranker: "tight-tree",
	});

	for (const node of nodes) {
		const profile1 = queryClient.getQueryData<Profile>([
			"profile",
			node.data.team_1,
		]);
		const profile2 = queryClient.getQueryData<Profile>([
			"profile",
			node.data.team_2,
		]);
		dagreGraph.setNode(node.id, {
			width: Math.max(
				Math.max(profile1?.name?.length ?? 46, profile2?.name?.length ?? 46) *
					22,
				325,
			),
			height: 315,
		});
	}
	for (const edge of edges) {
		dagreGraph.setEdge(edge.source, edge.target, {
			weight: edge.id.startsWith("win") ? 10 : 1,
		});
	}

	dagre.layout(dagreGraph);

	return {
		nodes: nodes.map((node) => {
			const position = dagreGraph.node(node.id);
			// We are shifting the dagre node position (anchor=center center) to the top left
			// so it matches the React Flow node anchor point (top left).
			const x = position.x - (node.width ?? 0) / 2;
			const y = position.y - (node.height ?? 0) / 2;

			node.targetPosition = Position.Left;
			node.sourcePosition = Position.Right;

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
		style: { transition: "all 50ms ease" },
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
				style: match.is_losers_bracket
					? EDGE_STYLES.redemption
					: EDGE_STYLES.winner,
			});
		}
		if (match.next_match_loser) {
			edges.push({
				id: `lose-${match.match_number}-${match.next_match_loser}`,
				source: match.match_number.toString(),
				target: match.next_match_loser.toString(),
				type: "smoothstep",
				sourceHandle: "loser",
				style: EDGE_STYLES.loser,
			});
		}
		return edges;
	});

	return { nodes, edges };
}

function Bracket({
	tournamentId,
	escrow,
	isHost,
	showBracket = false,
}: BracketProps) {
	const queryClient = useQueryClient();
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const category = useCategoryContext();
	const [isFullscreen, setIsFullscreen] = useState(showBracket);
	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};

	const processMatchesMutation = useArenaTournamentModuleExtensionMutation();

	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const updates = useMatchResultsStore((state) => state.matchResults);
	const shareBracketLink = useMemo(() => {
		const currentUrl = new URL(window.location.href);

		// Check if `showBracket` is already present
		if (!currentUrl.searchParams.has("showBracket")) {
			currentUrl.searchParams.append("showBracket", "true");
		}

		return currentUrl.toString();
	}, []);
	const [isCopied, setCopied] = useClipboard(shareBracketLink, {
		successDuration: 500,
	});

	const fetchMatches = async ({ pageParam = undefined }) => {
		if (!cosmWasmClient) {
			throw new Error("CosmWasm client not available");
		}

		const client = new ArenaTournamentModuleQueryClient(
			cosmWasmClient,
			env.ARENA_TOURNAMENT_MODULE_ADDRESS,
		);

		const data = (await client.queryExtension({
			msg: { bracket: { tournament_id: tournamentId, start_after: pageParam } },
		})) as unknown as Match[];

		return {
			items: data,
			nextCursor:
				data.length === env.PAGINATION_LIMIT
					? data[data.length - 1]?.match_number
					: undefined,
		};
	};

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: arenaTournamentModuleQueryKeys.queryExtension(
				env.ARENA_TOURNAMENT_MODULE_ADDRESS,
				{
					msg: { bracket: { tournament_id: tournamentId } },
				},
			),
			queryFn: fetchMatches,
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			enabled: !!cosmWasmClient,
		});

	useEffect(() => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	useEffect(() => {
		if (data) {
			const allMatches = data.pages.flatMap((page) => page.items);
			const { nodes: newNodes, edges: newEdges } =
				convertMatchesToNodesEdges(allMatches);
			const { nodes: layoutedNodes, edges: layoutedEdges } =
				getLayoutedElements(queryClient, newNodes, newEdges);

			setNodes(layoutedNodes);
			setEdges(layoutedEdges);
		}
	}, [queryClient, data, setNodes, setEdges]);

	const onSubmit = async () => {
		try {
			if (!address) throw "Could not get user address";
			if (updates.size === 0) throw "Updates are empty";

			const client = await getSigningCosmWasmClient();

			const tournamentModuleClient = new ArenaTournamentModuleClient(
				client,
				address,
				env.ARENA_TOURNAMENT_MODULE_ADDRESS,
			);

			await processMatchesMutation.mutateAsync(
				{
					client: tournamentModuleClient,
					msg: {
						msg: {
							process_match: {
								match_results: Array.from(updates).map((x) => {
									return { match_number: x[0], match_result: x[1] };
								}),
								tournament_id: tournamentId,
							},
						},
					},
				},
				{
					onSuccess: async (response) => {
						toast.success("Matches were processed successfully");

						// Update the query data
						await queryClient.invalidateQueries(
							arenaTournamentModuleQueryKeys.queryExtension(
								env.ARENA_TOURNAMENT_MODULE_ADDRESS,
								{
									msg: { bracket: { tournament_id: tournamentId } },
								},
							),
						);

						useMatchResultsStore.setState(() => ({ matchResults: new Map() }));

						if (category?.category_id) {
							const ratingAdjustmentsEvent = response.events.find((event) =>
								event.attributes.find(
									(attr) =>
										attr.key === "action" && attr.value === "adjust_ratings",
								),
							);
							if (ratingAdjustmentsEvent) {
								for (const attr of ratingAdjustmentsEvent.attributes) {
									if (attr.key === "action") continue;

									queryClient.setQueryData<string | undefined>(
										arenaCoreQueryKeys.queryExtension(env.ARENA_CORE_ADDRESS, {
											msg: {
												rating: {
													addr: attr.key,
													category_id: category.category_id.toString(),
												},
											},
										}),
										() => attr.value,
									);
								}
							}
						}

						if (
							response.events.find((event) =>
								event.attributes.find(
									(attr) =>
										attr.key === "action" &&
										attr.value === "process_competition",
								),
							)
						) {
							queryClient.setQueryData<CompetitionResponse | undefined>(
								getCompetitionQueryKey(env, "tournament", tournamentId),
								(old) => {
									if (old) {
										return { ...old, status: "inactive" };
									}
									return old;
								},
							);

							if (escrow) {
								await queryClient.invalidateQueries(
									arenaEscrowQueryKeys.dumpState(escrow, { addr: address }),
								);
								await queryClient.invalidateQueries(
									arenaEscrowQueryKeys.balances(escrow),
								);
							}

							toast.success("The tournament is now fully processed");
						}
					},
				},
			);
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	return (
		<div
			className={
				isFullscreen ? "fixed inset-0 z-50 bg-background" : "h-full w-full"
			}
		>
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
						<Button
							aria-label="Share Bracket"
							startContent={<BsShare />}
							isDisabled={isCopied}
							onPress={() => {
								setCopied();
								toast.success("Link copied 👍");
							}}
						>
							Share
						</Button>
						<Button
							startContent={
								isFullscreen ? <BsFullscreenExit /> : <BsFullscreen />
							}
							aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
							onPress={toggleFullscreen}
						>
							{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
						</Button>
						{isHost && (
							<Button
								startContent={<BsUpload />}
								aria-label="Submit Results"
								isDisabled={updates.size === 0}
								onPress={onSubmit}
								isLoading={processMatchesMutation.isLoading}
							>
								Submit Results
							</Button>
						)}
					</ButtonGroup>
				</Panel>
				<Panel
					position="top-left"
					style={{ padding: "10px", borderRadius: "5px" }}
				>
					<h3>Legend</h3>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							marginBottom: "5px",
						}}
					>
						<div
							style={{
								width: "20px",
								height: "2px",
								backgroundColor: "#4CAF50",
								marginRight: "10px",
							}}
						/>
						<span>Winners Bracket</span>
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							marginBottom: "5px",
						}}
					>
						<div
							style={{
								width: "20px",
								height: "2px",
								backgroundImage:
									"linear-gradient(to right, #FF5722 50%, transparent 50%)",
								backgroundSize: "4px 100%",
								backgroundRepeat: "repeat-x",
								marginRight: "10px",
							}}
						/>
						<span>Losers Bracket</span>
					</div>
					<div style={{ display: "flex", alignItems: "center" }}>
						<div
							className="bg-primary"
							style={{
								width: "20px",
								height: "2px",
								marginRight: "10px",
							}}
						/>
						<span>Active Match</span>
					</div>
				</Panel>
			</ReactFlow>
		</div>
	);
}

export default Bracket;
