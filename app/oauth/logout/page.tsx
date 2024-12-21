"use client";

import { useChain } from "@cosmos-kit/react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useEnv } from "~/hooks/useEnv";
import type { Profile } from "~/hooks/useProfile";
import { useAuthStore } from "~/store/authStore";

const LogoutPage = () => {
	const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
	const env = useEnv();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { address } = useChain(env.CHAIN);

	useEffect(() => {
		const logout = async () => {
			try {
				if (address) {
					// Get profile
					const profile = queryClient.getQueryData<Profile>([
						"profile",
						address,
					]);

					if (profile?.discordId) {
						// Call the API route to clear the session
						await axios.post(
							`${env.API_URL}/logout?user_id=${profile.discordId}`,
							{},
							{ withCredentials: true },
						);
					}

					// Update Zustand store
					setAuthenticated(false);

					// Redirect the user after logging out
					router.push("/");
				}
			} catch (error) {
				console.error("Logout failed:", error);
			}
		};

		logout();
	}, [
		setAuthenticated,
		router,
		address,
		env.API_URL,
		queryClient.getQueryData,
	]);

	return <p>Logging out...</p>;
};

export default LogoutPage;
