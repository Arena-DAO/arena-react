import { Link } from "@nextui-org/react";
import { withIpfsSupport } from "~/helpers/IPFSHelpers";
import { useEnv } from "~/hooks/useEnv";

interface MaybeLinkProps {
	content: string;
}

const MaybeLink = ({ content }: MaybeLinkProps) => {
	const { data: env } = useEnv();

	const maybeIpfsUrl = withIpfsSupport(env.IPFS_GATEWAY, content);
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
