"use client";

import { Button, Link } from "@nextui-org/react";
import { useEffect } from "react";
import { FiExternalLink } from "react-icons/fi";
import { toast } from "react-toastify";
import { useEnv } from "~/hooks/useEnv";

const Bridge = () => {
	const { data: env } = useEnv();
	useEffect(() => {
		toast.info(
			<div className="flex justify-between">
				<div className="my-auto">View page directly...</div>
				<Button
					as={Link}
					href={env.OSMOSIS_URL}
					isExternal
					isIconOnly
					aria-label="Osmosis"
				>
					<FiExternalLink />
				</Button>
			</div>,
		);
	}, [env.OSMOSIS_URL]);

	return (
		<iframe
			title="Osmosis"
			src={env.OSMOSIS_URL}
			className="w-screen left-0 fixed"
			style={{ minHeight: "85dvh" }}
		/>
	);
};

export default Bridge;
