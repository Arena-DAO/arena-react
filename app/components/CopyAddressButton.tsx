"use client";

import { Button, ButtonProps, Tooltip } from "@nextui-org/react";
import { FiCheck, FiCopy } from "react-icons/fi";
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
		<Tooltip content={isCopied ? "Address Copied!" : "Copy Address"}>
			<Button isIconOnly onClick={setCopied} {...props}>
				{isCopied ? <FiCheck /> : <FiCopy />}
			</Button>
		</Tooltip>
	);
}