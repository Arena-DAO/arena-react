"use client";

import { Button, type ButtonProps } from "@heroui/react";
import { FiCheck, FiClipboard } from "react-icons/fi";
import useClipboard from "react-use-clipboard";

interface CopyAddressButtonProps extends ButtonProps {
	address: string;
}

export function CopyAddressButton({
	address,
	...props
}: CopyAddressButtonProps) {
	const [isCopied, setCopied] = useClipboard(address, {
		successDuration: 1000,
	});

	return (
		<Button
			onPress={setCopied}
			aria-label="Copy address"
			startContent={isCopied ? <FiCheck /> : <FiClipboard />}
			isDisabled={isCopied}
			{...props}
		>
			{isCopied ? "Copied" : "Copy Address"}
		</Button>
	);
}
