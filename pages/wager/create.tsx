import { useRouter } from "next/router";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
} from "@chakra-ui/react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { ExecuteMsg, Uint128 } from "@agon/ArenaWagerModule.types";
import { toBinary } from "cosmwasm";
import { InstantiateMsg as DaoCoreInstantiateMsg } from "@dao/DaoCore.types";
import { InstantiateMsg as EscrowInstantiateMsg } from "@agon/ArenaEscrow.types";
import {
  DaoCoreReactQuery,
  useDaoCoreGetItemQuery,
} from "@dao/DaoCore.react-query";
import { useChain } from "@cosmos-kit/react";
import { DaoCoreQueryClient } from "@dao/DaoCore.client";
import { useArenaCoreQueryExtensionQuery } from "@agon/ArenaCore.react-query";
import { ArenaCoreQueryClient } from "@agon/ArenaCore.client";
// Import ExecuteMsg and other types if necessary

interface Wager {
  competition_dao: DaoCoreInstantiateMsg;
  escrow: EscrowInstantiateMsg;
  name: string;
  description: string;
  rules: string[];
  ruleset?: Uint128;
}

export default async function CreateWager() {
  const router = useRouter();
  const { daoAddress: daoAddressFromQuery } = router.query;

  const [daoAddress, setDaoAddress] = useState<string>("");
  const [showWagerForm, setShowWagerForm] = useState<boolean>(false);
  const cosmwasmClient = await useChain(
    process.env.NEXT_PUBLIC_CHAIN!
  ).getCosmWasmClient();

  useEffect(() => {
    if (daoAddressFromQuery) {
      setDaoAddress(daoAddressFromQuery as string);
      validateDaoAddress(daoAddressFromQuery as string);
    }
  }, [daoAddressFromQuery]);

  async function validateDaoAddress(address: string) {
    let arenaModuleQuery = useDaoCoreGetItemQuery({
      client: new DaoCoreQueryClient(cosmwasmClient, address),
      args: { key: "Arena" },
    });

    if (
      arenaModuleQuery.error ||
      arenaModuleQuery.isLoading ||
      !arenaModuleQuery.data.item
    )
      return false;

    let competitionModuleQuery = useArenaCoreQueryExtensionQuery({
      client: new ArenaCoreQueryClient(
        cosmwasmClient,
        arenaModuleQuery.data.item
      ),
      args: {
        msg: {
          competition_module: {
            key: "wagers",
          },
        },
      },
    });

    if (
      competitionModuleQuery.error ||
      competitionModuleQuery.isLoading ||
      !competitionModuleQuery.data
    )
      return false;

    return true;
  }

  const handleDaoAddressSubmit = async () => {
    const validationResult = await validateDaoAddress(daoAddress);
    setShowWagerForm(validationResult as boolean);
  };

  const initialValues: Wager = {
    competition_dao: {
      automatically_add_cw20s: false,
      automatically_add_cw721s: false,
      description: "",
      name: "",
      proposal_modules_instantiate_info: [],
      voting_module_instantiate_info: {
        code_id: 0,
        label: "",
        msg: "",
      },
    },
    escrow: {
      dues: [],
      lock_when_funded: true,
    },
    name: "",
    description: "",
    rules: [],
  };

  const validationSchema = Yup.object().shape({
    // ... (validation schema for nested fields)
    name: Yup.string().required("Name is required"),
    // ... (add the rest of the validation schema for nested fields)
  });

  const onSubmit = async (values: Wager, { setSubmitting }) => {
    // ... (submit logic)
  };

  return (
    <>
      <FormControl mb={4}>
        <FormLabel htmlFor="daoAddress">DAO Address</FormLabel>
        <Input
          id="daoAddress"
          value={daoAddress}
          onChange={(e) => setDaoAddress(e.target.value)}
          placeholder="DAO Address"
        />
        <Button mt={2} onClick={handleDaoAddressSubmit}>
          Validate DAO Address
        </Button>
      </FormControl>
      {showWagerForm && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {(formik) => (
            <>
              <form onSubmit={formik.handleSubmit}>
                <VStack spacing={4}>
                  <FormControl
                    id="name"
                    isInvalid={formik.touched.name && !!formik.errors.name}
                  >
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <Input
                      {...formik.getFieldProps("name")}
                      placeholder="Name"
                    />
                    <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
                  </FormControl>

                  {/* ... (add the rest of the form controls here, following the same structure) */}

                  <Button
                    colorScheme="teal"
                    type="submit"
                    isLoading={formik.isSubmitting}
                  >
                    Create Wager
                  </Button>
                </VStack>
              </form>
            </>
          )}
        </Formik>
      )}
    </>
  );
}
