"use client";

import { useChain } from "@cosmos-kit/react";
import { Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEnv } from "~/hooks/useEnv";

export default function DiscordCallback() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const { data: env } = useEnv();
	const { address } = useChain(env.CHAIN);

	// Get redirect from URL parameters
	const redirectUri = searchParams.get("redirect_uri");
	const errorDescription = searchParams.get("error_description");

	// Handle error cases
	if (errorDescription) {
		throw Error(errorDescription);
	}

	// Invalidate profile query
	if (address) {
		queryClient.invalidateQueries({ queryKey: ["profile", address] });
	}

	// If we have a redirect URL, use it, otherwise go to home
	if (redirectUri) {
		router.push(decodeURIComponent(redirectUri));
	} else {
		router.push("/");
	}

	// Show loading state while processing
	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<h1 className="text-center font-bold text-2xl">
						Completing Authentication
					</h1>
				</CardHeader>
				<CardBody>
					<div className="flex justify-center">
						<Spinner color="primary" />
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
