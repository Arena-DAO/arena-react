"use client";

import { useEnv } from "~/hooks/useEnv";

const DAO = () => {
	const { data: env } = useEnv();
	return (
		<iframe
			title="Arena DAO"
			src={`${env.DAO_DAO_URL}/dao/${env.ARENA_DAO_ADDRESS}/proposals`}
			className="w-screen left-0 fixed"
			style={{ minHeight: "85dvh" }}
		/>
	);
};

export default DAO;
