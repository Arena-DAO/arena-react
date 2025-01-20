"use client";

import { Button } from "@heroui/react"; // Your UI library
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { BsShare } from "react-icons/bs"; // Share icon
import { toast } from "react-toastify";
import useClipboard from "react-use-clipboard";

interface ShareButtonProps {
	address: string;
}

const ShareLinkButton: React.FC<ShareButtonProps> = ({ address }) => {
	const path = usePathname();
	const link = useMemo(() => {
		const currentUrl = new URL(window.location.origin + path); // Full URL
		currentUrl.searchParams.set("addTeam", address); // Add or update `addTeam` param
		return currentUrl.toString();
	}, [address, path]);
	const [isCopied, setCopied] = useClipboard(link, { successDuration: 1000 });

	return (
		<Button
			isIconOnly
			aria-label="Share"
			color="primary"
			onPress={() => {
				setCopied();
				toast.success("Shareable link to teammates is copied 📋");
			}}
			isDisabled={isCopied}
		>
			<BsShare />
		</Button>
	);
};

export default ShareLinkButton;
