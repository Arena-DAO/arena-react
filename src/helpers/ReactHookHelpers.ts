import type { SharedSelection } from "@nextui-org/react";

export function getStringSet(sharedSelection: SharedSelection): Set<string> {
	// Check if the sharedSelection is a Set
	if (sharedSelection instanceof Set) {
		// Convert the Set<Key> to Set<string>
		return new Set(Array.from(sharedSelection).map((key) => key.toString()));
	}

	// Return null if it's not a Set
	return new Set();
}
