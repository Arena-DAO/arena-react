import { AssetList, Chain } from "@chain-registry/types";

export function getConstantineChain(): Chain {
  return {
    chain_name: "constantine",
    status: "live",
    network_type: "testnet",
    pretty_name: "Constantine Testnet",
    chain_id: "constantine-1",
    bech32_prefix: "archway",
    slip44: 118,
    apis: {
      rpc: [
        {
          address: "https://rpc.constantine-1.archway.tech",
        },
      ],
      rest: [
        {
          address: "https://api.constantine-1.archway.tech",
        },
      ],
    },
    explorers: [
      {
        url: "https://explorer.constantine-1.archway.tech",
      },
    ],
    fees: {
      fee_tokens: [
        {
          denom: "uconst",
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uconst",
        },
      ],
    },
    logo_URIs: {
      png: "https://raw.githubusercontent.com/archway-network/archway-docs/main/static/favicon-96x96.png",
      svg: "hhttps://raw.githubusercontent.com/archway-network/archway-docs/main/static/favicon.svg",
    },
  };
}

export function getConstantineAssets(): AssetList {
  return {
    chain_name: "constantine",
    assets: [
      {
        base: "uconst",
        display: "const",
        name: "Constantine",
        symbol: "CONST",
        denom_units: [
          { denom: "const", exponent: 6 },
          { denom: "uconst", exponent: 0 },
        ],
        logo_URIs: {
          png: "https://raw.githubusercontent.com/archway-network/archway-docs/main/static/favicon-96x96.png",
          svg: "https://raw.githubusercontent.com/archway-network/archway-docs/main/static/favicon.svg",
        },
      },
    ],
  };
}
