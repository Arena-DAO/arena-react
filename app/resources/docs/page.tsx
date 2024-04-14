"use client";

import { Button, Link } from "@nextui-org/react";
import { useEffect } from "react";
import { FiExternalLink } from "react-icons/fi";
import { toast } from "react-toastify";
import { useEnv } from "~/hooks/useEnv";

const Docs = () => {
	const { data: env } = useEnv();
	useEffect(() => {
		toast.info(
			<div className="flex justify-between">
				<div className="my-auto">View page directly...</div>
				<Button
					as={Link}
					href={env.DOCS_URL}
					isExternal
					isIconOnly
					aria-label="Docs"
				>
					<FiExternalLink />
				</Button>
			</div>,
		);
	}, [env.DOCS_URL]);

	return (
		<iframe
			title="Docs"
			src={env.DOCS_URL}
			className="fixed left-0 w-screen"
			style={{ minHeight: "85dvh" }}
		/>
	);
};

export default Docs;
