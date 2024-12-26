import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
	isAuthenticated: boolean;
	setAuthenticated: (auth: boolean) => void;
}

export const useAuthStore = create(
	persist<AuthState>(
		(set) => ({
			isAuthenticated: false,
			setAuthenticated: (auth) => set({ isAuthenticated: auth }),
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
