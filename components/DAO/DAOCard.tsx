import { useChain } from "@cosmos-kit/react";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { DaoCoreQueryClient } from "../../ts-codegen/dao/DaoCore.client";
import { DumpStateResponse } from "../../ts-codegen/dao/DaoCore.types";

interface DAOCardProps extends PropsWithChildren {
  addr: string;
}

export default async function DAOCard({ addr }: DAOCardProps) {
  const chain = useChain(process.env.NEXT_PUBLIC_CHAIN!);
  const [DAOState, setDAOState] = useState<DumpStateResponse>();
  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      componentIsMounted.current = false;
    };
  }, []);
  useEffect(() => {
    async function queryDAO() {
      try {
        const client = new DaoCoreQueryClient(
          await chain.getCosmWasmClient(),
          addr
        );
        const state = await client.dumpState();

        if (componentIsMounted.current) {
          setDAOState(state);
        }
      } catch (err) {
        console.error(err);
      }
    }

    queryDAO();
  }, []);

  if (!DAOState) {
    return <></>;
  }
  return <></>;
}
