import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import {
  CheckedDepositInfo,
  Coin,
  Config,
} from "@dao/DaoPreProposeSingle.types";
import { ArrayOfProposalModule } from "@dao/DaoDaoCore.types";
import { ProposalCreationPolicy } from "@dao/DaoProposalSingle.types";

export type ProposalAddrType = "proposal_module" | "prepropose";
type ProposalModuleType = "dao-proposal-multiple" | "dao-proposal-single";

interface ProposalConfig {
  addr: string;
  type: ProposalAddrType;
  funds?: Coin[];
}

export async function getProposalConfig(
  cosmwasmClient: CosmWasmClient,
  dao: string,
  type: ProposalModuleType,
  user?: string,
  exclude_module_policy: boolean = false
): Promise<ProposalConfig | null> {
  let proposalModules: ArrayOfProposalModule = [];
  proposalModules = await cosmwasmClient.queryContractSmart(dao, {
    active_proposal_modules: {},
  });
  for (let i = 0; i < proposalModules.length; i++) {
    const x = proposalModules[i]!;
    if (x.status != "enabled") continue;

    // Check the proposal module's type
    const proposalModuleType: string = await cosmwasmClient.queryContractSmart(
      x.address,
      { info: {} }
    );
    if (!proposalModuleType.match(type)) continue;

    // Check the creation policy
    let creationPolicy: ProposalCreationPolicy =
      await cosmwasmClient.queryContractSmart(x.address, {
        proposal_creation_policy: {},
      });

    if ("anyone" in creationPolicy)
      return { addr: x.address, type: "proposal_module" };
    else if ("module" in creationPolicy) {
      if (user && creationPolicy.module.addr == user)
        return { addr: x.address, type: "proposal_module" };
      if (exclude_module_policy) continue;

      let config: Config = await cosmwasmClient.queryContractSmart(
        creationPolicy.module.addr,
        { config: {} }
      );
      return {
        addr: creationPolicy.module.addr,
        type: "prepropose",
        funds: convertToCoin(config.deposit_info),
      };
    }
  }
  return null;
}

function convertToCoin(
  depositInfo: CheckedDepositInfo | null | undefined
): Coin[] | undefined {
  if (depositInfo)
    if ("native" in depositInfo.denom) {
      return [
        {
          denom: depositInfo.denom.native,
          amount: depositInfo.amount,
        },
      ];
    }

  return undefined;
}
