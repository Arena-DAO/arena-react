import { useEnv } from "~/hooks/useEnv";
import Profile from "./Profile";
import { Input, type InputProps } from "@nextui-org/react";
import type { FieldError, FieldValues } from "react-hook-form";

interface ProfileInputProps extends InputProps {
	error?: FieldError;
	field: FieldValues;
}

export const ProfileInput = ({ field, error, ...props }: ProfileInputProps) => {
	const env = useEnv();
	return (
		<div className="flex items-center">
			{/* Profile Avatar */}
			<Profile address={field.value} justAvatar className="mr-2" />

			{/* Address Input */}
			<Input
				{...field}
				{...props}
				isRequired
				placeholder={`${env.BECH32_PREFIX}...`}
				errorMessage={error?.message}
				isInvalid={!!error}
			/>
		</div>
	);
};
