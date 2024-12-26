import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TeamState {
	teams: string[];
	addTeam: (team: string) => void;
	removeTeam: (team: string) => void;
}

export const useTeamStore = create(
	persist<TeamState>(
		(set) => ({
			teams: [],
			addTeam: (team) =>
				set((state) => ({
					teams: [...state.teams, team],
				})),

			removeTeam: (team) =>
				set((state) => ({
					teams: state.teams.filter((t) => t !== team),
				})),
		}),
		{
			name: "team-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
