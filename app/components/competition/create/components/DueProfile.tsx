"use client";

import Profile, { ProfileProps } from "@/components/Profile";
import { useWatch } from "react-hook-form";
import { WithClient } from "~/types/util";
import { FormComponentProps } from "../CreateCompetitionForm";

const DuesProfile = ({
	cosmWasmClient,
	control,
	index,
	...props
}: WithClient<FormComponentProps & Omit<ProfileProps, "address">> & {
	index: number;
}) => {
	const watchAddress = useWatch({ control, name: `dues.${index}.addr` });

	return (
		<Profile
			cosmWasmClient={cosmWasmClient}
			address={watchAddress}
			hideIfInvalid
			{...props}
		/>
	);
};

export default DuesProfile;
