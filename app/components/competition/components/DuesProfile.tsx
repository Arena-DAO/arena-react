"use client";

import Profile from "@/components/Profile";
import { useWatch } from "react-hook-form";
import { WithClient } from "~/types/util";
import { FormComponentProps } from "../CreateCompetitionForm";

const DuesProfile = ({
	cosmWasmClient,
	control,
	index,
}: WithClient<FormComponentProps> & { index: number }) => {
	const watchAddress = useWatch({ control, name: `dues.${index}.addr` });

	return (
		<Profile
			cosmWasmClient={cosmWasmClient}
			address={watchAddress}
			hideIfInvalid
		/>
	);
};

export default DuesProfile;
