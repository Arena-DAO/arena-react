import {
	type ZonedDateTime,
	getLocalTimeZone,
	now,
} from "@internationalized/date";
import { useEffect, useState } from "react";
import type { Timestamp } from "~/codegen/ArenaWagerModule.types";
import { nanosToZonedDateTime } from "~/config/schemas/TimestampSchema";

/**
 * Hook to determine if a competition or its registration deadline has expired.
 * Automatically updates when the expiration time is reached.
 * @param competitionDateNanos - Competition start date in nanoseconds (required).
 * @param duration - Duration of the competition in seconds (optional).
 * @param deadlineBefore - Time before competition start for the registration deadline, in seconds (optional).
 * @returns {boolean} - True if the time has passed, false otherwise.
 */
export const useIsExpired = (
	competitionDateNanos: Timestamp,
	duration?: number,
	deadlineBefore?: number,
): boolean => {
	if (!duration && !deadlineBefore) {
		throw new Error("Either duration or deadlineBefore must be supplied.");
	}

	const competitionDate = nanosToZonedDateTime(BigInt(competitionDateNanos));
	const [isExpired, setIsExpired] = useState(() => {
		const current = now(getLocalTimeZone());

		if (deadlineBefore) {
			const registrationDeadline = competitionDate.subtract({
				seconds: deadlineBefore,
			});
			if (current.compare(registrationDeadline) >= 0) {
				return true;
			}
		} else if (duration) {
			const competitionEnd = competitionDate.add({ seconds: duration });
			if (current.compare(competitionEnd) >= 0) {
				return true;
			}
		}

		return false;
	});

	useEffect(() => {
		const current = now(getLocalTimeZone());
		let nextTriggerTime: ZonedDateTime | null = null;

		if (deadlineBefore) {
			const registrationDeadline = competitionDate.subtract({
				seconds: deadlineBefore,
			});
			if (current.compare(registrationDeadline) < 0) {
				nextTriggerTime = registrationDeadline;
			}
		} else if (duration) {
			const competitionEnd = competitionDate.add({ seconds: duration });
			if (current.compare(competitionEnd) < 0) {
				nextTriggerTime = competitionEnd;
			}
		}

		if (!nextTriggerTime) {
			setIsExpired(true);
			return; // Already expired, no timeout needed
		}

		const delay =
			nextTriggerTime.toDate().getTime() - current.toDate().getTime();

		const timeoutId = setTimeout(() => {
			setIsExpired(true);
		}, delay);

		return () => clearTimeout(timeoutId); // Cleanup timeout on unmount
	}, [duration, deadlineBefore, competitionDate.add, competitionDate.subtract]);

	return isExpired;
};
