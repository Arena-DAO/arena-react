import { useChain } from "@cosmos-kit/react";
import {
	Autocomplete,
	AutocompleteItem,
	type AutocompleteProps,
} from "@heroui/react";
import { useMemo } from "react";
import type { FieldError, FieldValues } from "react-hook-form";
import { useEnv } from "~/hooks/useEnv";
import { useTeamStore } from "~/store/teamStore";
import Profile from "./Profile";

interface ProfileInputProps extends Omit<AutocompleteProps, "children"> {
	error?: FieldError;
	field: FieldValues;
	emptyTeams?: boolean;
}

export const ProfileInput = ({
	field,
	error,
	emptyTeams = false,
	...props
}: ProfileInputProps) => {
	const env = useEnv();
	const teams = useTeamStore((x) => x.teams);
	const { address } = useChain(env.CHAIN);

	const items = useMemo(() => {
		// Always include the user's address if it's available
		const result = address ? [{ address }] : [];

		// If emptyTeams is false, add all team addresses (avoiding duplicates)
		if (!emptyTeams) {
			result.push(
				...teams
					.filter((team) => team !== address)
					.map((team) => ({ address: team })),
			);
		}

		return result;
	}, [teams, emptyTeams, address]);

	return (
		<div className="flex items-center">
			{/* Profile Avatar */}
			<Profile address={field.value} justAvatar className="mr-2" />

			{/* Address Input */}
			<Autocomplete
				{...field}
				{...props}
				allowsCustomValue
				defaultItems={items}
				isRequired
				placeholder={`${env.BECH32_PREFIX}...`}
				errorMessage={error?.message}
				isInvalid={!!error}
				onInputChange={field.onChange}
			>
				{(item) => {
					const typedItem = item as { address: string };
					return (
						<AutocompleteItem
							key={typedItem.address}
							textValue={typedItem.address}
						>
							<Profile address={typedItem.address} />
						</AutocompleteItem>
					);
				}}
			</Autocomplete>
		</div>
	);
};
