import { CompetitionStatus } from "@arena/ArenaWagerModule.types";

export const statusColors: { [key in CompetitionStatus]: string } = {
  pending: "yellow",
  active: "green",
  inactive: "grey",
  jailed: "red",
};
