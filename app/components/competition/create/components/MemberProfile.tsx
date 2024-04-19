"use client";

import Profile, { type ProfileProps } from "@/components/Profile";
import { useWatch } from "react-hook-form";
import type { WithClient } from "~/types/util";
import type { FormComponentProps } from "../CreateCompetitionForm";

const MemberProfile = ({
	cosmWasmClient,
	control,
	index,
	...props
}: WithClient<FormComponentProps & Omit<ProfileProps, "address">> & {
	index: number;
}) => {
	const watchAddress = useWatch({ control, name: `members.${index}.address` });

	return (
		<Profile
			cosmWasmClient={cosmWasmClient}
			address={watchAddress}
			hideIfInvalid
			{...props}
		/>
	);
};

export default MemberProfile;
