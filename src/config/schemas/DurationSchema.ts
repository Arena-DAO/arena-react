import {
	type ZonedDateTime,
	getLocalTimeZone,
	now,
} from "@internationalized/date";
import { z } from "zod";

export const DurationUnits = [
	"seconds",
	"minutes",
	"hours",
	"days",
	"weeks",
	"months",
	"years",
] as const;

export type DurationUnit = (typeof DurationUnits)[number];

// Conversion factors to seconds (for contract interaction)
const SECONDS_PER_UNIT: Record<DurationUnit, number> = {
	seconds: 1,
	minutes: 60,
	hours: 60 * 60,
	days: 24 * 60 * 60,
	weeks: 7 * 24 * 60 * 60,
	months: 30 * 24 * 60 * 60,
	years: 365 * 24 * 60 * 60,
};

const DurationSchema = z
	.object({
		units: z.enum(DurationUnits),
		amount: z.coerce
			.number()
			.int()
			.positive()
			.transform((x) => x.toString()),
	})
	.transform((data) => ({
		...data,
		toSeconds: () => {
			return Math.floor(Number(data.amount) * SECONDS_PER_UNIT[data.units]);
		},
		addToDateTime: (date: ZonedDateTime) => {
			switch (data.units) {
				case "years":
					return date.add({ years: Number(data.amount) });
				case "months":
					return date.add({ months: Number(data.amount) });
				case "weeks":
					return date.add({ weeks: Number(data.amount) });
				case "days":
					return date.add({ days: Number(data.amount) });
				case "hours":
					return date.add({ hours: Number(data.amount) });
				case "minutes":
					return date.add({ minutes: Number(data.amount) });
				case "seconds":
					return date.add({ seconds: Number(data.amount) });
			}
		},
		subtractFromDateTime: (date: ZonedDateTime) => {
			switch (data.units) {
				case "years":
					return date.subtract({ years: Number(data.amount) });
				case "months":
					return date.subtract({ months: Number(data.amount) });
				case "weeks":
					return date.subtract({ weeks: Number(data.amount) });
				case "days":
					return date.subtract({ days: Number(data.amount) });
				case "hours":
					return date.subtract({ hours: Number(data.amount) });
				case "minutes":
					return date.subtract({ minutes: Number(data.amount) });
				case "seconds":
					return date.subtract({ seconds: Number(data.amount) });
			}
		},
	}));

export type Duration = z.output<typeof DurationSchema>;

// Helper functions
export const getCurrentDateTime = (): ZonedDateTime => {
	return now(getLocalTimeZone());
};

export const calculateExpirationDateTime = (
	duration: Duration,
	fromDate: ZonedDateTime = getCurrentDateTime(),
) => {
	return duration.addToDateTime(fromDate);
};

export const calculateStartDateTime = (
	duration: Duration,
	fromDate: ZonedDateTime = getCurrentDateTime(),
) => {
	return duration.subtractFromDateTime(fromDate);
};

export const formatDateTime = (date: ZonedDateTime) => {
	return date.toString();
};

export const formatDuration = (duration: Duration) => {
	const amount =
		duration.amount === "1"
			? `1 ${duration.units.slice(0, -1)}`
			: `${duration.amount} ${duration.units}`;
	return amount;
};

// Convert ZonedDateTime to seconds since epoch for contract
export const dateTimeToSeconds = (date: ZonedDateTime): number => {
	return Math.floor(date.toDate().getTime() / 1000);
};

export default DurationSchema;
