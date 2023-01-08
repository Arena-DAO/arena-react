import { AssetList, Chain } from "@chain-registry/types";

export function getMorpheusChain(): Chain {
  return {
    chain_name: "morpheus",
    status: "live",
    network_type: "testnet",
    pretty_name: "Morpheus Apollo Testnet",
    chain_id: "morpheus-apollo-3",
    bech32_prefix: "desmos",
    slip44: 852,
    apis: {
      rpc: [
        {
          address: "https://rpc.morpheus.desmos.network:443",
        },
      ],
      rest: [
        {
          address: "https://api.morpheus.desmos.network:443",
        },
      ],
      gql: [
        {
          address: "https://gql.morpheus.desmos.network/v1/graphql",
        },
      ],
    },
    explorers: [
      {
        url: "https://morpheus.desmos.network/",
      },
    ],
    fees: {
      fee_tokens: [
        {
          denom: "udaric",
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "udaric",
        },
      ],
    },
    logo_URIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.svg",
    },
  };
}

export function getMorpheusAssets(): AssetList {
  return {
    chain_name: "morpheus",
    assets: [
      {
        description: "The native token of Morpheus",
        denom_units: [
          {
            denom: "udaric",
            exponent: 0,
            aliases: [],
          },
          {
            denom: "daric",
            exponent: 6,
            aliases: [],
          },
        ],
        base: "udaric",
        name: "Daric",
        display: "daric",
        symbol: "DARIC",
        logo_URIs: {
          png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.png",
          svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.svg",
        },
      },
    ],
  };
}
