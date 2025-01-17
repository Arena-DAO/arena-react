"use client";

import { DateInput, DateRangePicker } from "@heroui/react";
import React from "react";
import type { Timestamp } from "~/codegen/ArenaWagerModule.types";
import { nanosToZonedDateTime } from "~/config/schemas/TimestampSchema";

interface CompetitionDatesProps {
	competitionDateNanos: Timestamp; // Competition date in nanoseconds (required)
	duration: number; // Duration in seconds (required)
	deadlineBefore?: number; // Duration in seconds (optional)
	hideExpiration?: boolean;
}

const CompetitionDates: React.FC<CompetitionDatesProps> = React.memo(
	({
		competitionDateNanos,
		duration,
		deadlineBefore,
		hideExpiration = false,
	}) => {
		const competitionDate = nanosToZonedDateTime(BigInt(competitionDateNanos));
		const expirationDate = !hideExpiration
			? competitionDate.add({ seconds: duration })
			: null;
		const registrationDeadline = deadlineBefore
			? competitionDate.subtract({ seconds: deadlineBefore })
			: null;

		return (
			<>
				{deadlineBefore && (
					<DateInput
						label="Registration Deadline"
						value={registrationDeadline}
						isReadOnly
						variant="bordered"
					/>
				)}
				{expirationDate ? (
					<DateRangePicker
						label="Competition Date"
						value={{ start: competitionDate, end: expirationDate }}
						isReadOnly
						variant="bordered"
					/>
				) : (
					<DateInput
						label="Competition Date"
						value={competitionDate}
						isReadOnly
						variant="bordered"
					/>
				)}
			</>
		);
	},
);

export default CompetitionDates;
