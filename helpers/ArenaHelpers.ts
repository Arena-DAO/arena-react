import { BalanceVerified } from "@arena/ArenaEscrow.types";
import { CompetitionStatus } from "@arena/ArenaWagerModule.types";

export const statusColors: { [key in CompetitionStatus]: string } = {
  pending: "yellow",
  active: "green",
  inactive: "grey",
  jailed: "red",
};

export function isBalanceEmpty(balance: BalanceVerified): boolean {
  return (
    balance.cw20.length == 0 &&
    balance.native.length == 0 &&
    balance.cw721.length == 0
  );
}
