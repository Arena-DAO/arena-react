"use client";

import { Button, addToast } from "@heroui/react"; // Your UI library
import { Share } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

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
				addToast({
					color: "success",
					description: "Shareable link to teammates is copied 📋",
				});
			}}
			isDisabled={isCopied}
		>
			<Share />
		</Button>
	);
};

export default ShareLinkButton;
