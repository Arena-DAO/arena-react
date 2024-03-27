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
					href={env.IBC_FUN}
					isExternal
					isIconOnly
					aria-label="Bridge"
				>
					<FiExternalLink />
				</Button>
			</div>,
		);
	}, [env.IBC_FUN]);

	return (
		<iframe
			title="IBC FUN"
			src={env.IBC_FUN}
			className="w-screen left-0 fixed"
			style={{ minHeight: "85dvh" }}
		/>
	);
};

export default Bridge;
