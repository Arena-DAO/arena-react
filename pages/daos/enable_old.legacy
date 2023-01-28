import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  GridItem,
  Heading,
  Input,
  SimpleGrid,
  Textarea,
} from "@chakra-ui/react";
import { useChain } from "@cosmos-kit/react";
import {
  StepForm,
  FormStepper,
  FormStep,
  PrevButton,
  NextButton,
} from "@saas-ui/react";
import {
  CosmosMsgForEmpty,
  SingleChoiceProposeMsg,
} from "ts-codegen/dao/DaoProposalSingle.types";
import { toBinary } from "cosmwasm";
import { ExecuteMsg, ProposalModuleStatus } from "ts-codegen/dao/DaoCore.types";
import CreateAgon from "components/CreateAgon";
import Yup from "yup";
import { DaoCoreClient } from "ts-codegen/dao/DaoCore.client";
import {
  Duration,
  PercentageThreshold,
  InstantiateMsg as ProposalMultipleInstantiateMsg,
} from "ts-codegen/dao/DaoProposalMultiple.types";
import {
  InstantiateMsg as AgonCoreInstantiateMsg,
  ModuleInstantiateInfo,
  Ruleset,
} from "ts-codegen/agon/AgonCore.types";
import { DaoProposalSingleQueryClient } from "ts-codegen/dao/DaoProposalSingle.client";

export default function CreateDAO() {
  const chain = useChain(process.env.NEXT_PUBLIC_CHAIN!);
  const { errors, touched, handleSubmit, isSubmitting } = useFormik({
    initialValues: {
      title: "Enable the Agon Module",
      description: "Allow this DAO to host decentralized competition",
      dao_address: "",
      allow_revoting: false,
      close_proposal_on_execution_failure: true,
      max_voting_period: { time: 604800 } as Duration,
      min_voting_period: null as Duration | null,
      only_members_execute: false,
      voting_threshold: { majority: {} } as PercentageThreshold,
      competition_modules_instantiate_info: [] as ModuleInstantiateInfo[],
      rulesets: [] as Ruleset[],
    },
    validationSchema: {
      title: Yup.string().required(),
      description: Yup.string().required(),
      proposer: Yup.string(),
      dao_address: Yup.string().required(),
      agon_address: Yup.string().required(),
    },
    onSubmit: async (values, actions) => {
      console.log({ values, actions });
      alert(JSON.stringify(values, null, 2));
      let msg: CosmosMsgForEmpty = {
        wasm: {
          execute: {
            contract_addr: values.dao_address,
            funds: [],
            msg: toBinary({
              update_proposal_modules: {
                to_add: [
                  {
                    code_id: parseInt(
                      process.env.NEXT_PUBLIC_CODE_ID_PROPOSAL!
                    ),
                    label: "Agon Proposal Module",
                    msg: toBinary({
                      allow_revoting: values.allow_revoting,
                      close_proposal_on_execution_failure:
                        values.close_proposal_on_execution_failure,
                      max_voting_period: values.max_voting_period,
                      min_voting_period: values.min_voting_period,
                      only_members_execute: values.only_members_execute,
                      voting_strategy: {
                        single_choice: { quorum: values.voting_threshold },
                      },
                      pre_propose_info: {
                        module_may_propose: {
                          info: {
                            code_id: parseInt(
                              process.env.NEXT_PUBLIC_CODE_ID_AGON_CORE!
                            ),
                            label: "Agon Core",
                            msg: toBinary({
                              competition_modules_instantiate_info:
                                values.competition_modules_instantiate_info,
                              dao: values.dao_address,
                              rulesets: values.rulesets,
                            } as AgonCoreInstantiateMsg),
                          },
                        },
                      },
                    } as ProposalMultipleInstantiateMsg),
                  },
                ],
                to_disable: [],
              },
            } as ExecuteMsg),
          },
        },
      };
    },
  });

  return (
    <Container maxW="5x1" pb={10}>
      <Heading
        as="h1"
        className="holographic"
        fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
        fontWeight="extrabold"
        textAlign="center"
      >
        Create a DAO
      </Heading>
      <Form onSubmit={handleSubmit}>
        <SimpleGrid columns={12} spacing={4} my={4}>
          <FormControl
            as={GridItem}
            colSpan={{ base: 12, lg: 6, xl: 4 }}
            isInvalid={!!errors.dao_address && touched.dao_address}
          >
            <FormLabel htmlFor="dao_address">DAO Address</FormLabel>
            <Field
              as={Input}
              type="text"
              name="dao_address"
              focusBorderColor="secondary.400"
            />
            <FormErrorMessage>{errors.dao_address}</FormErrorMessage>
          </FormControl>
          <FormControl
            as={GridItem}
            colSpan={{ base: 12, lg: 6, xl: 4 }}
            isInvalid={!!errors.title && touched.title}
          >
            <FormLabel htmlFor="title">Title</FormLabel>
            <Field
              as={Input}
              type="text"
              name="title"
              focusBorderColor="secondary.400"
            />
            <FormErrorMessage>{errors.title}</FormErrorMessage>
          </FormControl>
          <FormControl
            as={GridItem}
            colSpan={{ base: 12 }}
            isInvalid={!!errors.description && touched.description}
          >
            <FormLabel htmlFor="description">Description</FormLabel>
            <Field
              as={Textarea}
              name="description"
              focusBorderColor="secondary.400"
              w="full"
            />
            <FormErrorMessage>{errors.description}</FormErrorMessage>
          </FormControl>
          <FormControl
            as={GridItem}
            colSpan={{ base: 10 }}
            isInvalid={!!errors.agon_address && touched.agon_address}
          >
            <FormLabel htmlFor="description">Agon Address</FormLabel>
            <Field
              as={Textarea}
              name="description"
              focusBorderColor="secondary.400"
              w="full"
            />
            <FormErrorMessage>{errors.description}</FormErrorMessage>
          </FormControl>
          <GridItem colSpan={{ base: 2 }}>
            <CreateAgon />
          </GridItem>
        </SimpleGrid>
        <Box
          px={{
            base: 4,
            sm: 6,
          }}
          py={3}
          textAlign="right"
        >
          <Button
            type="submit"
            colorScheme="secondary"
            isLoading={isSubmitting}
          >
            Submit
          </Button>
        </Box>
      </Form>
    </Container>
  );
}
