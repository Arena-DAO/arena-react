"use client";

import { Skeleton, User, type UserProps } from "@nextui-org/react";
import { getDisplayToken } from "~/helpers/TokenHelpers";
import { useToken } from "~/hooks/useToken";

interface TokenCardProps extends Omit<UserProps, "name"> {
	denomOrAddress: string;
	isNative?: boolean;
	amount?: bigint | string;
}

const TokenInfo = ({
	denomOrAddress,
	isNative = false,
	amount,
	...props
}: TokenCardProps) => {
	denomOrAddress = isNative
		? denomOrAddress
		: denomOrAddress.replace("cw20:", "");
	const {
		data: token,
		isLoading,
		isError,
	} = useToken(denomOrAddress, isNative);

	let displayName = token?.symbol || denomOrAddress;

	if (amount !== undefined && token) {
		const displayAmount = getDisplayToken(
			{ denom: denomOrAddress, amount: amount.toString() },
			token,
		);
		displayName = `${Number(displayAmount.amount).toLocaleString()} ${token.symbol}`;
	}

	if (isError) {
		return <User name={displayName} {...props} />;
	}

	return (
		<Skeleton isLoaded={!isLoading}>
			<User
				name={displayName}
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
