import {
	type ZonedDateTime,
	getLocalTimeZone,
	now,
	parseAbsolute,
	parseZonedDateTime,
	toZoned,
} from "@internationalized/date";
import { z } from "zod";

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

export const nanosToZonedDateTime = (nanos: bigint): ZonedDateTime => {
	// Convert nanoseconds to milliseconds and create an Absolute time
	const absolute = parseAbsolute((nanos / BigInt(1_000_000)).toString(), "UTC");

	// Get the user's local timezone
	const localTimeZone = getLocalTimeZone();

	// Convert to a ZonedDateTime in the user's local timezone
	return toZoned(absolute, localTimeZone);
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
