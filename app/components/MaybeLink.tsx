import { Link } from "@nextui-org/react";

interface MaybeLinkProps {
	content: string;
}

const MaybeLink = ({ content }: MaybeLinkProps) => {
	const url = URL.canParse(content) ? new URL(content) : undefined;

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
