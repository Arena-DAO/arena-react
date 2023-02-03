import {
  FormLayout,
  Form,
  ArrayField,
  SubmitButton,
  Field,
  Card,
  DisplayIf,
} from "@saas-ui/react";
import { yupResolver } from "@saas-ui/forms/yup";
import { toBinary } from "cosmwasm";
import {
  CosmosMsgForEmpty,
  InstantiateMsg as ProposalMultipleInstantiateMsg,
} from "ts-codegen/dao/DaoProposalMultiple.types";
import { ExecuteMsg, ProposalModuleStatus } from "ts-codegen/dao/DaoCore.types";
import {
  DaoCoreClient,
  DaoCoreQueryClient,
} from "ts-codegen/dao/DaoCore.client";
import { DaoProposalSingleClient } from "ts-codegen/dao/DaoProposalSingle.client";
import { InstantiateMsg as AgonCoreInstantiateMsg } from "ts-codegen/agon/AgonCore.types";
import * as Yup from "yup";
import {
  Heading,
  SimpleGrid,
  Container,
  Grid,
  Text,
  GridItem,
} from "@chakra-ui/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import React from "react";
import { useChain } from "@cosmos-kit/react";

interface AgonForm {
  dao: string;
  allow_revoting: boolean;
  close_proposal_on_execution_failure: boolean;
  max_voting_period: number;
  max_voting_period_units: string;
  min_voting_period: number;
}

export default function EnableAgon() {
  const chain = useChain(process.env.NEXT_PUBLIC_CHAIN!);
  const schema = Yup.object().shape({
    dao: Yup.string().required().label("DAO"),
    allow_revoting: Yup.bool().label("Allow Revoting"),
    close_proposal_on_execution_failure: Yup.bool().label(
      "Close Proposal on Execution Failure"
    ),
    max_voting_period: Yup.number()
      .integer()
      .positive()
      .label("Max Voting Period"),
    max_voting_period_units: Yup.mixed().oneOf(["Time", "Height"]),
    min_voting_period: Yup.number()
      .integer()
      .positive()
      .transform((currentValue, originalValue) => {
        return originalValue === "" ? null : currentValue;
      })
      .nullable()
      .label("Min Voting Period"),
    min_voting_period_units: Yup.mixed().oneOf(["Time", "Height"]),
    only_members_execute: Yup.bool().label("Only Members Execute"),
    voting_threshold: Yup.mixed().oneOf(["Majority", "Percentage"]),
    voting_threshold_percentage: Yup.number()
      .positive()
      .transform((currentValue, originalValue) => {
        return originalValue === "" ? null : currentValue;
      })
      .nullable()
      .min(0)
      .max(100)
      .label("Percentage"),
    rulesets: Yup.array()
      .of(
        Yup.object().shape({
          description: Yup.string().required().label("Description"),
          rules: Yup.array()
            .min(1)
            .of(
              Yup.object().shape({
                rule: Yup.string().required().label("Rule"),
              })
            )
            .label("Rules"),
        })
      )
      .label("Rulesets"),
    //competition_modules_instantiate_info: [] as ModuleInstantiateInfo[],
  });
  interface AgonParams extends Yup.InferType<typeof schema> {}
  const onSubmit = async (params: AgonParams) => {
    let msg: CosmosMsgForEmpty = {
      wasm: {
        execute: {
          contract_addr: params.dao,
          funds: [],
          msg: toBinary({
            update_proposal_modules: {
              to_add: [
                {
                  code_id: parseInt(process.env.NEXT_PUBLIC_CODE_ID_PROPOSAL!),
                  label: "Agon Proposal Module",
                  msg: toBinary({
                    allow_revoting: params.allow_revoting,
                    close_proposal_on_execution_failure:
                      params.close_proposal_on_execution_failure,
                    max_voting_period:
                      params.max_voting_period_units == "Time"
                        ? { time: params.max_voting_period }
                        : { height: params.max_voting_period },
                    min_voting_period: params.min_voting_period
                      ? params.min_voting_period_units == "Time"
                        ? { time: params.min_voting_period }
                        : { height: params.min_voting_period }
                      : null,
                    only_members_execute: params.only_members_execute,
                    voting_strategy: {
                      single_choice: { quorum: params.voting_threshold },
                    },
                    pre_propose_info: {
                      module_may_propose: {
                        info: {
                          code_id: parseInt(
                            process.env.NEXT_PUBLIC_CODE_ID_AGON_CORE!
                          ),
                          label: "Agon Core",
                          msg: toBinary({
                            competition_modules_instantiate_info: [],
                            dao: params.dao,
                            rulesets:
                              params.rulesets?.map((x) => {
                                return {
                                  description: x.description,
                                  enabled: true,
                                  rules: x.rules?.map((y) => {
                                    return y.rule;
                                  }),
                                };
                              }) ?? [],
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

    //query proposal modules for a single proposal module
    const cosmwasmClient = await chain.getSigningCosmWasmClient();
    const daoClient = new DaoCoreQueryClient(cosmwasmClient, params.dao);
    const proposalModules = await daoClient.activeProposalModules({});
    for (const proposalModule of proposalModules) {
      const proposalClient = new DaoProposalSingleClient(
        cosmwasmClient,
        chain.address!,
        proposalModule.address
      );

      const creationPolicy: any = await proposalClient.proposalCreationPolicy();
      console.log(creationPolicy);
      if (
        creationPolicy.anyone == undefined ||
        creationPolicy.module.addr != chain.address!
      )
        continue;

      await proposalClient.propose({
        title: "Enable the Agon Proposal Module",
        description:
          "Allow decentralized competition to be handled through this DAO!",
        msgs: [msg],
      });
    }
  };
  return (
    <Container pb={10} centerContent maxW="4x1">
      <Heading
        as="h1"
        className="holographic"
        fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
        fontWeight="extrabold"
        textAlign="center"
      >
        Enable Agon
      </Heading>
      <Text fontWeight="bold" mb={3} textAlign="center">
        Use this form to create a proposal enabling Agon Protocol on your DAO!
      </Text>
      <Card>
        <Form
          resolver={yupResolver(schema)}
          onSubmit={onSubmit}
          m="4"
          defaultValues={{
            max_voting_period: 64800,
            max_voting_period_units: "Time",
            min_voting_period_units: "Time",
            voting_threshold: "Majority",
            voting_threshold_percentage: 33,
          }}
        >
          <FormLayout>
            <Field name="dao" label="DAO" />
            <FormLayout columns={2}>
              <Field
                type="switch"
                name="allow_revoting"
                label="Allow Revoting"
              />
              <Field
                type="switch"
                name="close_proposal_on_execution_failure"
                label="Close Proposal on Execution Failure"
              />
            </FormLayout>
            <FormLayout templateColumns="auto 25%">
              <Field name="max_voting_period" label="Max Voting Period" />
              <Field
                type="select"
                name="max_voting_period_units"
                label="Units"
                options={[{ value: "Time" }, { value: "Height" }]}
              />
            </FormLayout>
            <FormLayout templateColumns="auto 25%">
              <Field name="min_voting_period" label="Min Voting Period" />
              <Field
                type="select"
                name="min_voting_period_units"
                label="Units"
                options={[{ value: "Time" }, { value: "Height" }]}
              />
            </FormLayout>
            <Field
              type="switch"
              name="only_members_execute"
              label="Only Members Execute"
            />
            <FormLayout columns={2}>
              <Field
                type="select"
                name="voting_threshold"
                label="Voting Threshold"
                options={[{ value: "Majority" }, { value: "Percentage" }]}
              />
              <DisplayIf
                name="voting_threshold"
                condition={(x) => x == "Percentage"}
              >
                <Field name="voting_threshold_percentage" label="Percentage" />
              </DisplayIf>
            </FormLayout>
            <ArrayField name="rulesets" label="Rulesets">
              <Field
                type="textarea"
                name="description"
                placeholder="Description"
                label="Description"
              />
              <ArrayField name="rules" label="Rules">
                <Field name="rule" placeholder="Rule" />
              </ArrayField>
            </ArrayField>
            <SubmitButton label="Submit" />
          </FormLayout>
        </Form>
      </Card>
    </Container>
  );
}
