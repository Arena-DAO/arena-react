"use client";

import { Spinner } from "@nextui-org/react";
import { getDisplayToken } from "~/helpers/TokenHelpers";
import { useToken } from "~/hooks/useToken";

interface TokenAmountProps {
	amount: bigint;
	denomOrAddress: string;
	isNative?: boolean;
	className?: string;
}

const TokenAmount = ({
	amount,
	denomOrAddress,
	isNative = false,
	className,
}: TokenAmountProps) => {
	denomOrAddress = isNative
		? denomOrAddress
		: denomOrAddress.replace("cw20:", "");

	const {
		data: token,
		isLoading,
		isError,
	} = useToken(denomOrAddress, isNative);

	if (isError) {
		return <div className={className}>{amount.toString()}</div>;
	}
	if (isLoading) {
		return <Spinner />;
	}
	if (!token) {
		return null;
	}
	const displayAmount = getDisplayToken(
		{ denom: denomOrAddress, amount: amount.toString() },
		token,
	);

	return <div className={className}>{displayAmount.amount}</div>;
};

export default TokenAmount;
