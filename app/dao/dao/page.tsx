"use client";

import { Button, Link } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { toast } from "react-toastify";
import { useEnv } from "~/hooks/useEnv";

const DAO = () => {
	const { data: env } = useEnv();
	const [href] = useState(
		`${env.DAO_DAO_URL}/dao/${env.ARENA_DAO_ADDRESS}/proposals`,
	);
	useEffect(() => {
		toast.info(
			<div className="flex justify-between">
				<div className="my-auto">View page directly...</div>
				<Button as={Link} href={href} isExternal isIconOnly aria-label="Bridge">
					<FiExternalLink />
				</Button>
			</div>,
		);
	}, [href]);

	return (
		<iframe
			title="Arena DAO"
			src={href}
			className="fixed left-0 w-screen"
			style={{ minHeight: "85dvh" }}
		/>
	);
};

export default DAO;
