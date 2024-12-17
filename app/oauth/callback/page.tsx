"use client";

import { Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function DiscordCallback() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Get the stored state and redirect URL
	const storedState = localStorage.getItem("discord_oauth_state");
	const redirectUrl = localStorage.getItem("discord_oauth_redirect");

	// Get state from URL parameters
	const state = searchParams.get("state");
	const errorDescription = searchParams.get("error_description");

	// Clear stored OAuth state immediately
	localStorage.removeItem("discord_oauth_state");
	localStorage.removeItem("discord_oauth_redirect");

	// Handle error cases
	if (errorDescription) {
		throw Error(errorDescription);
	}

	// Verify state parameter
	if (!state || state !== storedState) {
		throw Error("State mismatch - possible CSRF attack");
	}

	// If we have a stored redirect URL, use it, otherwise go to home
	if (redirectUrl) {
		router.push(redirectUrl);
	} else {
		router.push("/");
	}

	// Show loading state while processing
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50">
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
