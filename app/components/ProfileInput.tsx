"use client";

import { useChain } from "@cosmos-kit/react";
import { Autocomplete, AutocompleteItem, type AutocompleteProps } from "@heroui/react";
import { useMemo } from "react";
import type { FieldError, FieldValues } from "react-hook-form";
import { ArenaTeamEnrollmentsQueryClient } from "~/codegen/ArenaTeamEnrollments.client";
import { useArenaTeamEnrollmentsListTeamsQuery } from "~/codegen/ArenaTeamEnrollments.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import Profile from "./Profile";

interface ProfileInputProps extends Omit<AutocompleteProps, "children"> {
	error?: FieldError;
	field: FieldValues;
	emptyTeams?: boolean;
	excludeSelf?: boolean;
	includeArena?: boolean;
}

export const ProfileInput = ({
	field,
	error,
	emptyTeams = false,
	excludeSelf = false,
	includeArena = false,
	...props
}: ProfileInputProps) => {
	const env = useEnv();
	const { data: client } = useCosmWasmClient();
	const { address } = useChain(env.CHAIN);

	// Query user's teams
	const { data: teams = [] } = useArenaTeamEnrollmentsListTeamsQuery({
		client:
			client && new ArenaTeamEnrollmentsQueryClient(client, env.ARENA_TEAM_ENROLLMENTS_ADDRESS),
		args: {
			user: address || "",
			limit: 100,
		},
		options: { enabled: !!client && !!address },
	});

	const items = useMemo(() => {
		const result = [];

		// Include the user's address if it's available and not excluded
		if (address && !excludeSelf) {
			result.push({ address });
		}

		if (includeArena) {
			result.push({ address: env.ARENA_DAO_ADDRESS });
		}

		// If emptyTeams is false, add all team addresses (avoiding duplicates)
		if (!emptyTeams) {
			result.push(
				...teams
					.filter((team) => {
						// Filter out user's address if excludeSelf is true
						return excludeSelf ? team !== address : true;
					})
					.map((team) => ({ address: team }))
			);
		}

		return result;
	}, [teams, emptyTeams, address, excludeSelf, includeArena, env.ARENA_DAO_ADDRESS]);

	return (
		<div className="flex w-full items-center">
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
						<AutocompleteItem key={typedItem.address} textValue={typedItem.address}>
							<Profile address={typedItem.address} />
						</AutocompleteItem>
					);
				}}
			</Autocomplete>
		</div>
	);
};
