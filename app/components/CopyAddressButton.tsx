"use client";

import { Button, type ButtonProps } from "@nextui-org/react";
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
		<Button isIconOnly onClick={setCopied} aria-label="Copy address" {...props}>
			{isCopied ? <FiCheck /> : <FiClipboard />}
		</Button>
	);
}
