"use client";

import Profile, { type ProfileProps } from "@/components/Profile";
import { useWatch } from "react-hook-form";
import type { FormComponentProps } from "../CreateCompetitionForm";

const MemberProfile = ({
	control,
	index,
	...props
}: FormComponentProps &
	Omit<ProfileProps, "address"> & {
		index: number;
	}) => {
	const watchAddress = useWatch({ control, name: `members.${index}.address` });

	return <Profile address={watchAddress} hideIfInvalid {...props} />;
};

export default MemberProfile;
