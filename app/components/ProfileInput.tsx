import {
	Autocomplete,
	AutocompleteItem,
	type AutocompleteProps,
} from "@nextui-org/react";
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

	const items = useMemo(() => {
		if (emptyTeams) return [];
		return teams.map((x) => ({ address: x }));
	}, [teams, emptyTeams]);

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
