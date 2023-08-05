import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DaoDaoCoreQueryClient } from "@dao/DaoDaoCore.client";
import { DaoProposalSingleQueryClient } from "@dao/DaoProposalSingle.client";
import { DaoPreProposeSingleQueryClient } from "@dao/DaoPreProposeSingle.client";

export type ProposalAddrType = "proposal_module" | "prepropose";

interface ProposalAddrResponse {
  addr: string;
  type: ProposalAddrType;
}

export async function getProposalAddr(
  cosmWasmClient: CosmWasmClient,
  dao: string,
  user?: string
): Promise<ProposalAddrResponse | null> {
  let daoCoreClient = new DaoDaoCoreQueryClient(cosmWasmClient, dao);
  let proposalModules = [];
  let startAfter: string | undefined;
  do {
    proposalModules = await daoCoreClient.activeProposalModules({
      startAfter: startAfter,
    });
    for (let i = 0; i < proposalModules.length; i++) {
      const x = proposalModules[i]!;
      if (x.status != "enabled") continue;
      let proposalModuleClient = new DaoProposalSingleQueryClient(
        cosmWasmClient,
        x.address
      );
      let creationPolicy = await proposalModuleClient.proposalCreationPolicy();

      if ("anyone" in creationPolicy)
        return { addr: x.address, type: "proposal_module" };
      else if ("module" in creationPolicy) {
        if (user && creationPolicy.module.addr == user)
          return { addr: x.address, type: "proposal_module" };

        let daoPreProposeClient = new DaoPreProposeSingleQueryClient(
          cosmWasmClient,
          creationPolicy.module.addr
        );
        let config = await daoPreProposeClient.config();
        if (!config.deposit_info)
          return { addr: creationPolicy.module.addr, type: "prepropose" };
      }

      startAfter = proposalModules[proposalModules.length - 1]?.address;
    }
  } while (proposalModules.length != 0);
  return null;
}
