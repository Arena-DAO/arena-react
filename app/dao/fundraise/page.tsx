"use client";

import { Tab, Tabs } from "@nextui-org/react";
import { useMemo } from "react";
import devFundraises from "~/config/fundraise.development.json";
import prodFundraises from "~/config/fundraise.production.json";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import FundraiseInfo from "./components/FundraiseInfo";

interface FundraiseRound {
	title: string;
	description: string;
	address?: string;
	id: number;
}

const Fundraise = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);

	const fundraises: FundraiseRound[] = useMemo(
		() => (env.ENV === "development" ? devFundraises : prodFundraises),
		[env.ENV],
	);

	return (
		<div className="space-y-4">
			<h1 className="text-center text-5xl">Fundraises</h1>
			<Tabs items={fundraises}>
				{(item) => (
					<Tab key={item.id} title={item.title}>
						<p>{item.description}</p>
						{cosmWasmClient && item.address && (
							<FundraiseInfo
								fundraiseAddress={item.address}
								cosmWasmClient={cosmWasmClient}
							/>
						)}
					</Tab>
				)}
			</Tabs>
		</div>
	);
};

export default Fundraise;
