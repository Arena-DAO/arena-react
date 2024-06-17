"use client";

import Profile, { type ProfileProps } from "@/components/Profile";
import { useWatch } from "react-hook-form";
import type { FormComponentProps } from "../CreateCompetitionForm";

const DuesProfile = ({
	control,
	index,
	...props
}: FormComponentProps &
	Omit<ProfileProps, "address"> & {
		index: number;
	}) => {
	const watchAddress = useWatch({ control, name: `dues.${index}.addr` });

	return <Profile address={watchAddress} hideIfInvalid {...props} />;
};

export default DuesProfile;
