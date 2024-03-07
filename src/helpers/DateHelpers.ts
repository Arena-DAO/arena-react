import { UTCDateMini } from "@date-fns/utc";
import { format } from "date-fns";

export const formatExpirationTime = (time: string) =>
	format(
		new UTCDateMini(Number(BigInt(time) / BigInt(1e6))),
		"yyyy-MM-dd'T'HH:mm",
	);
