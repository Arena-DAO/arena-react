"use client";

import { Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DiscordCallback() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Get redirect from URL parameters
	const redirectUrl = searchParams.get("redirect_url");
	const errorDescription = searchParams.get("error_description");

	// Handle error cases
	if (errorDescription) {
		throw Error(errorDescription);
	}

	// If we have a redirect URL, use it, otherwise go to home
	if (redirectUrl) {
		router.push(redirectUrl);
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
