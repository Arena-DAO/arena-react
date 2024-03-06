"use client";

import { Skeleton, User, UserProps } from "@nextui-org/react";
import { useToken } from "~/hooks/useToken";
import { WithClient } from "~/types/util";

interface TokenCardProps extends Omit<UserProps, "name"> {
	denomOrAddress: string;
	isNative?: boolean;
}

const TokenInfo = ({
	cosmWasmClient,
	denomOrAddress,
	isNative = false,
	...props
}: WithClient<TokenCardProps>) => {
	const {
		data: token,
		isLoading,
		isError,
	} = useToken(cosmWasmClient, denomOrAddress, isNative);

	if (isError) {
		return null;
	}

	return (
		<Skeleton isLoaded={!isLoading}>
			<User
				name={token?.symbol}
				avatarProps={{
					src:
						token?.logo_URIs?.svg ??
						token?.logo_URIs?.png ??
						token?.logo_URIs?.jpeg,
				}}
				{...props}
			/>
		</Skeleton>
	);
};

export default TokenInfo;
