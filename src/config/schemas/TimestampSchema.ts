import {
	type ZonedDateTime,
	fromDate,
	getLocalTimeZone,
	now,
	parseZonedDateTime,
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
	// Convert nanoseconds to milliseconds (BigInt to number)
	const millis = Number(nanos / BigInt(1_000_000));

	// Create a Date object from milliseconds
	const date = new Date(millis);

	// Ensure the date is valid
	if (Number.isNaN(date.getTime())) {
		throw new Error(
			"Invalid timestamp: cannot convert nanoseconds to a valid date.",
		);
	}

	// Convert to ZonedDateTime using the local time zone
	return fromDate(date, getLocalTimeZone());
};

// For working with ZonedDateTime
export const zonedDateTimeToNanos = (date: ZonedDateTime): bigint => {
	return BigInt(date.toDate().getTime()) * BigInt(1_000_000);
};

export const getCurrentTimeNanos = (): bigint => {
	return zonedDateTimeToNanos(now(getLocalTimeZone()));
};

export function convertToNanoseconds(isoString: string): string {
	const date = new Date(isoString);
	const milliseconds = BigInt(date.getTime());
	const nanoseconds = milliseconds * BigInt(1000000);
	return nanoseconds.toString();
}
