import { z } from "zod";
import {
	type ZonedDateTime,
	now,
	getLocalTimeZone,
	parseZonedDateTime,
} from "@internationalized/date";

export const TimestampSchema = z.coerce
	.string()
	.refine((dateStr) => {
		try {
			parseZonedDateTime(dateStr); // Validate it's a valid ISO date string
			return true;
		} catch {
			return false;
		}
	}, "Invalid ZonedDateTime format")
	.transform((x) => parseZonedDateTime(x).toAbsoluteString());

// Helper functions for working with nano timestamps
export const dateToNanos = (date: Date): bigint => {
	return BigInt(date.getTime()) * BigInt(1_000_000);
};

export const nanosToDate = (nanos: bigint): Date => {
	return new Date(Number(nanos / BigInt(1_000_000)));
};

// For working with ZonedDateTime
export const zonedDateTimeToNanos = (date: ZonedDateTime): bigint => {
	return BigInt(date.toDate().getTime()) * BigInt(1_000_000);
};

export const getCurrentTimeNanos = (): bigint => {
	return zonedDateTimeToNanos(now(getLocalTimeZone()));
};

export const parseToNanos = (isoString: string): string => {
	const date = new Date(isoString);

	if (Number.isNaN(date.getTime())) {
		throw new Error("Invalid ISO date string");
	}

	return (date.getTime() * 1_000_000).toString();
};
