"use client";

import {
	Card,
	CardBody,
	CardHeader,
	DateInput,
	DateRangePicker,
} from "@nextui-org/react";
import React from "react";
import type { Timestamp } from "~/codegen/ArenaWagerModule.types";
import { nanosToZonedDateTime } from "~/config/schemas/TimestampSchema";

interface CompetitionDatesProps {
	competitionDateNanos: Timestamp; // Competition date in nanoseconds (required)
	duration: number; // Duration in seconds (required)
	deadlineBefore?: number; // Duration in seconds (optional)
}

const CompetitionDates: React.FC<CompetitionDatesProps> = React.memo(
	({ competitionDateNanos, duration, deadlineBefore }) => {
		const competitionDate = nanosToZonedDateTime(BigInt(competitionDateNanos));
		const expirationDate = competitionDate.add({ seconds: duration });
		const registrationDeadline = deadlineBefore
			? competitionDate.subtract({ seconds: deadlineBefore })
			: null;

		return (
			<div className="space-y-6">
				{registrationDeadline && (
					<div className="space-y-2">
						<h3 className="font-semibold text-lg">Registration Deadline</h3>
						<DateInput
							label="Deadline"
							value={registrationDeadline}
							isReadOnly
						/>
					</div>
				)}
				<Card>
					<CardHeader>
						<h3 className="font-semibold text-lg">Competition Dates</h3>
					</CardHeader>
					<CardBody className="gap-4">
						{deadlineBefore && (
							<DateInput
								label="Registration Deadline"
								value={registrationDeadline}
								isReadOnly
							/>
						)}
						<DateRangePicker
							label="Competition Date"
							value={{ start: competitionDate, end: expirationDate }}
							isReadOnly
						/>
					</CardBody>
				</Card>
			</div>
		);
	},
);

export default CompetitionDates;
