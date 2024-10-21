"use client";

import TokenInfo from "@/components/TokenInfo";
import type { Asset } from "@chain-registry/types";
import { Card, CardBody } from "@nextui-org/react";
import { useMemo } from "react";
import { BsTrophyFill } from "react-icons/bs";
import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceDot,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { getDisplayToken } from "~/helpers/TokenHelpers";

interface CurveDataPoint {
	reserve: number;
	supply: number;
}

interface BondingCurveChartProps {
	currentSupply: string;
	currentReserve: string;
	supplyToken: Asset;
	reserveToken: Asset;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{
		payload: CurveDataPoint;
	}>;
}

const CustomDot = ({ cx, cy }: { cx: number; cy: number }) => (
	<g>
		<defs>
			<filter id="glow">
				<feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
				<feMerge>
					<feMergeNode in="coloredBlur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>
		<BsTrophyFill
			x={cx - 6}
			y={cy - 6}
			size={12}
			color="gold"
			filter="url(#glow)"
			style={{
				animation: "fadeIn 2s ease-in-out",
			}}
		/>
	</g>
);

const MAX_SUPPLY = 1_000_000;
const MAX_RESERVE = 200;
const SLOPE = 3;
const SCALE = 7;

const BondingCurveChart = ({
	currentSupply,
	currentReserve,
	supplyToken,
	reserveToken,
}: BondingCurveChartProps) => {
	const formatValue = (value: number) => {
		if (value >= 1_000_000) return `${value / 1_000_000}M`;
		if (value >= 1_000) return `${value / 1_000}K`;
		return value.toLocaleString();
	};

	const curveData = useMemo(() => {
		const calculateSupply = (reserve: number): number => {
			// Implementing the formula: ((3 * reserve) / (2 * SLOPE * 10^(-SCALE)))^(2/3)
			return ((3 * reserve) / (2 * SLOPE * 10 ** -SCALE)) ** (2 / 3);
		};

		const data = [];
		for (let i = 0; i <= 200; i++) {
			const reserve = (i / 200) * MAX_RESERVE;
			const supply = calculateSupply(reserve);
			data.push({
				reserve: Math.min(reserve, MAX_RESERVE),
				supply: Math.min(supply, MAX_SUPPLY),
			});
		}

		return data;
	}, []);

	const displaySupply = useMemo(
		() =>
			getDisplayToken(
				{ amount: currentSupply, denom: supplyToken.base },
				supplyToken,
			).amount,
		[currentSupply, supplyToken, supplyToken.base],
	);
	const displayReserve = useMemo(
		() =>
			getDisplayToken(
				{ amount: currentReserve, denom: reserveToken.base },
				reserveToken,
			).amount,
		[currentReserve, reserveToken, reserveToken.base],
	);

	const yAxisDomain = useMemo(() => [0, MAX_SUPPLY], []);
	const xAxisDomain = useMemo(() => [0, MAX_RESERVE], []);

	const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
		if (active && payload && payload[0]) {
			return (
				<Card>
					<CardBody>
						<div>
							Reserve:{" "}
							<TokenInfo
								denomOrAddress={reserveToken.display}
								isNative
								amount={payload[0].payload.reserve.toString()}
							/>
						</div>
						<div>
							Supply:{" "}
							<TokenInfo
								denomOrAddress={supplyToken.display}
								isNative
								amount={payload[0].payload.supply.toString()}
							/>
						</div>
					</CardBody>
				</Card>
			);
		}
		return null;
	};

	return (
		<Card className="mt-8">
			<CardBody className="h-[400px] w-full p-4">
				<ResponsiveContainer>
					<LineChart
						data={curveData}
						margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
						aria-label="Line chart"
					>
						<defs>
							<filter id="glow">
								<feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
								<feMerge>
									<feMergeNode in="coloredBlur" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
							<filter id="dotGlow">
								<feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
								<feMerge>
									<feMergeNode in="coloredBlur" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
							<linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
								<stop offset="95%" stopColor="#82ca9d" stopOpacity={0.8} />
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							opacity={0.2}
							aria-label="ABC Chart"
						/>
						<XAxis
							dataKey="reserve"
							type="number"
							scale="linear"
							domain={xAxisDomain}
							tickFormatter={formatValue}
							label={{
								value: `Reserve (${reserveToken?.symbol})`,
								position: "insideBottom",
								offset: -10,
								fill: "#a0aec0",
							}}
							aria-label="Reserve"
						/>
						<YAxis
							dataKey="supply"
							type="number"
							scale="linear"
							domain={yAxisDomain}
							tickFormatter={formatValue}
							label={{
								value: `Supply (${supplyToken?.symbol})`,
								angle: -90,
								position: "left",
								fill: "#a0aec0",
							}}
							aria-label="Supply"
						/>
						<Tooltip content={<CustomTooltip />} />
						<Line
							type="monotone"
							dataKey="supply"
							strokeWidth={3}
							stroke="url(#lineColor)"
							dot={false}
							name="Bonding Curve"
							animationDuration={2000}
							filter="url(#glow)"
							aria-label="Bonding curve"
						/>
						<ReferenceDot
							x={displayReserve}
							y={displaySupply}
							shape={CustomDot}
							isFront
							aria-label="Current Values"
						/>
					</LineChart>
				</ResponsiveContainer>
			</CardBody>
		</Card>
	);
};

export default BondingCurveChart;
