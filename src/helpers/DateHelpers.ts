import { parseAbsoluteToLocal } from "@internationalized/date";

export const formatExpirationTime = (time: string) =>
	parseAbsoluteToLocal(
		new Date(Number(BigInt(time) / BigInt(1e6))).toISOString(),
	);

export const formatTimestampToDisplay = (time: string) =>
	new Date(Number(BigInt(time) / BigInt(1e6))).toLocaleTimeString();
