import env from "./env";

export interface LinkItem {
  label: string;
  href?: string;
  target?: string;
  env?: string;
}

export const LINK_ITEMS: LinkItem[] = [
  {
    label: "🏠 Home",
    href: "/",
  },
  {
    label: "⚔️ Compete",
    href: "/compete",
  },
  {
    label: "☯️ Create Team",
    href: `${env.DAO_DAO_URL}/dao/create`,
    target: "_blank",
  },
  {
    label: "🗳️ Participate",
    href: `${env.DAO_DAO_URL}/dao/${env.ARENA_DAO_ADDRESS}#proposals`,
    target: "_blank",
  },
  {
    label: "🚀 Buy",
    href: env.OSMOSIS_URL,
    target: "_blank",
    env: "production",
  },
  {
    label: "💧 Faucet",
    href: "/faucet",
    env: "development",
  },
];
