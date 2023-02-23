import {
  Container,
  Heading,
  Text,
  Image,
  Tooltip,
  Input,
  VisuallyHidden,
} from "@chakra-ui/react";
import {
  InstantiateMsg as DAOInstantiateMsg,
  ModuleInstantiateInfo,
} from "@dao/DaoCore.types";
import { InstantiateMsg as CW4DisbursementInstantiateMsg } from "@agon/Cw4Disbursement.types";
import * as Yup from "yup";
import { toBinary } from "cosmwasm";
import {
  Card,
  FormLayout,
  Form,
  SubmitButton,
  Field,
  ArrayFieldAddButton,
  ArrayFieldContainer,
  ArrayFieldRemoveButton,
  ArrayFieldRowContainer,
  ArrayFieldRowFields,
  ArrayFieldRows,
  Button,
  UseArrayFieldReturn,
} from "@saas-ui/react";
import { InstantiateMsg as ProposalSingleInstantiateMsg } from "@dao/DaoProposalSingle.types";
import { InstantiateMsg as PreProposeSingleInstantiateMsg } from "@dao/DaoPreProposeSingle.types";
import { yupResolver } from "@saas-ui/forms/yup";
import { Key } from "react";
import { parse } from "csv-parse";
import React from "react";

export default function TeamsCreate() {
  const schema = Yup.object().shape({
    admin: Yup.string().label("Admin"),
    name: Yup.string().required().label("Name"),
    description: Yup.string().required().label("Description"),
    image_url: Yup.string().label("Image URL"),
    members: Yup.array()
      .min(2)
      .of(
        Yup.object().shape({
          address: Yup.string().required().label("Address"),
          voting_weight: Yup.number().min(0).required().label("Voting Weight"),
        })
      )
      .label("Members"),
  });
  interface SchemaParams extends Yup.InferType<typeof schema> {}
  const onSubmit = async (params: SchemaParams) => {
    let msg: DAOInstantiateMsg = {
      admin: params.admin,
      automatically_add_cw20s: true,
      automatically_add_cw721s: true,
      dao_uri: null,
      description: params.description,
      image_url: params.image_url,
      initial_items: [],
      name: params.name,
      proposal_modules_instantiate_info: [
        {
          code_id: parseInt(process.env.NEXT_PUBLIC_CODE_ID_PROPOSAL_SINGLE!),
          label: "Proposal Single",
          msg: toBinary({
            allow_revoting: true,
            close_proposal_on_execution_failure: true,
            max_voting_period: { time: 64800 },
            only_members_execute: true,
            pre_propose_info: {
              module_may_propose: {
                info: {
                  code_id: parseInt(
                    process.env.NEXT_PUBLIC_CODE_ID_PREPROPOSE_SINGLE!
                  ),
                  label: "PrePropose Single",
                  msg: toBinary({
                    open_proposal_submission: false,
                  } as PreProposeSingleInstantiateMsg),
                },
              },
            },
            threshold: {
              absolute_percentage: {
                percentage: {
                  percent: "100",
                },
              },
            },
          } as ProposalSingleInstantiateMsg),
        } as ModuleInstantiateInfo,
      ],
      voting_module_instantiate_info: {
        code_id: parseInt(process.env.NEXT_PUBLIC_CODE_ID_CW4_DISBURSEMENT!),
        label: "CW4 Disbursement",
        msg: toBinary({
          members:
            params.members?.map((x) => {
              return {
                addr: x.address,
                weight: x.voting_weight,
              };
            }) ?? [],
        } as CW4DisbursementInstantiateMsg),
      } as ModuleInstantiateInfo,
    };
  };
  const promptFile = () => {
    document.getElementById("import_members")?.click();
  };
  const imageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    let img = document.getElementById("image_preview") as HTMLImageElement;
    img.src = e.target.value;
  };
  const membersRef = React.useRef<UseArrayFieldReturn>(null);
  const importMembers = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    reader.readAsText(e.target.files!.item(0)!);
    reader.onload = () => {
      const parser = parse(reader.result as string, {
        trim: true,
      });
      parser.on("readable", () => {
        let record;
        while ((record = parser.read()) !== null) {
          membersRef.current?.append({
            address: record[0],
            voting_weight: record[1],
          });
        }
      });
    };
  };

  return (
    <Container pb={10} centerContent maxW="70ch">
      <Heading
        as="h1"
        className="holographic"
        fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
        fontWeight="extrabold"
        textAlign="center"
      >
        Create Team
      </Heading>
      <Text fontWeight="bold" mb={3} textAlign="center">
        Assemble a group to take into competition!
      </Text>
      <Card w="100%">
        <Form resolver={yupResolver(schema)} onSubmit={onSubmit} m="4">
          <FormLayout>
            <Field name="admin" label="Admin Address" />
            <Field name="name" label="Name" />
            <Field type="textarea" name="description" label="Description" />
            <FormLayout templateColumns="25% auto ">
              <Image
                id="image_preview"
                src="/logo-sm.svg"
                onError={(e) => (e.currentTarget.src = "/logo-sm.svg")}
                boxSize="100px"
                borderRadius="full"
                alt="Team Image"
                mx="auto"
              />
              <Field
                name="image_url"
                label="Image URL"
                verticalAlign="middle"
                onChange={imageChanged}
              />
            </FormLayout>
            <Tooltip label="Use this to import members through a CSV file: address, weight">
              <Button onClick={promptFile}>Import Members</Button>
            </Tooltip>
            <VisuallyHidden>
              <Input
                id="import_members"
                type="file"
                accept=".csv,.txt"
                onChange={importMembers}
              />
            </VisuallyHidden>
            <ArrayFieldContainer
              name="members"
              label="Members"
              keyName="key"
              ref={membersRef}
            >
              <ArrayFieldRows>
                {(fields) => (
                  <>
                    {fields.map((field, i) => {
                      return (
                        <ArrayFieldRowContainer
                          key={field.key as Key}
                          index={i}
                        >
                          <ArrayFieldRowFields columns={2} spacing={1}>
                            <Field
                              name="address"
                              label={"Address " + (i + 1)}
                            />
                            <Field
                              name="voting_weight"
                              label="Voting Weight"
                              defaultValue="1"
                            />
                          </ArrayFieldRowFields>
                          <ArrayFieldRemoveButton />
                        </ArrayFieldRowContainer>
                      );
                    })}
                  </>
                )}
              </ArrayFieldRows>
              <ArrayFieldAddButton />
            </ArrayFieldContainer>
            <SubmitButton label="Create" />
          </FormLayout>
        </Form>
      </Card>
    </Container>
  );
}
