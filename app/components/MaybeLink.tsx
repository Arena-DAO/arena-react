"use client";

import { Link } from "@heroui/react";
import { withIpfsSupport } from "~/helpers/IPFSHelpers";

interface MaybeLinkProps {
	content: string;
}

const MaybeLink = ({ content }: MaybeLinkProps) => {
	const maybeIpfsUrl = withIpfsSupport(content);
	const url =
		maybeIpfsUrl && URL.canParse(maybeIpfsUrl)
			? new URL(maybeIpfsUrl)
			: undefined;

	if (url?.href) {
		return (
			<Link isExternal href={url.href}>
				{content}
			</Link>
		);
	}
	return <>{content}</>;
};

export default MaybeLink;
