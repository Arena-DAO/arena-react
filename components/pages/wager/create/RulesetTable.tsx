import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { UnorderedList, ListItem } from "@chakra-ui/layout";
import {
  Tr,
  Td,
  ButtonGroup,
  Button,
  TableContainer,
  Table,
  Thead,
  Th,
  Tbody,
  ButtonProps,
  useDisclosure,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter,
} from "@chakra-ui/react";
import { DaoDaoCoreQueryClient } from "@dao/DaoDaoCore.client";
import { useDaoDaoCoreGetItemQuery } from "@dao/DaoDaoCore.react-query";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import env from "@config/env";
import { useEffect, useState } from "react";
import { Control, useFieldArray, useWatch } from "react-hook-form";
import { FormValues } from "~/pages/wager/create";
import { useAllRulesets } from "~/hooks/useAllRulesets";
import { isValidContractAddress } from "~/helpers/AddressHelpers";
import { Ruleset } from "@arena/ArenaCore.types";
import { RulesetsSchema } from "~/helpers/SchemaHelpers";
import z from "zod";

interface RulesetTableProps {
  cosmwasmClient: CosmWasmClient;
  control: Control<FormValues>;
}

interface RulesetTableInnerProps extends RulesetTableProps {
  arenaCoreAddr: string;
  setRulesetsCount: (count: number) => void;
}

function RulesetTableInner({
  arenaCoreAddr,
  cosmwasmClient,
  setRulesetsCount,
  control,
}: RulesetTableInnerProps) {
  const rulesets = useAllRulesets(
    cosmwasmClient,
    arenaCoreAddr,
    (count: number) => setRulesetsCount(count)
  );
  const buttonProps: ButtonProps = {
    size: "sm",
    variant: "outline",
  };
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalRuleset, setModalRuleset] = useState<Ruleset>();
  const { append, remove, fields } = useFieldArray({
    control,
    name: "rulesets",
  });

  return (
    <>
      <TableContainer>
        <Table variant="unstyled">
          <Thead>
            <Tr>
              <Th>Description</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rulesets.map((ruleset, i) => {
              const isRulesetSelected = fields.find(
                (x) => x.ruleset_id == ruleset.id
              );

              return (
                <Tr key={i}>
                  <Td>{ruleset.description}</Td>
                  <Td>
                    <ButtonGroup>
                      <Button
                        {...buttonProps}
                        onClick={() => {
                          setModalRuleset(ruleset);
                          onOpen();
                        }}
                      >
                        View
                      </Button>
                      <Button
                        isDisabled={!isRulesetSelected}
                        visibility={isRulesetSelected ? "unset" : "hidden"}
                        {...buttonProps}
                        onClick={() =>
                          remove(
                            fields.indexOf(
                              fields.find((x) => x.ruleset_id == ruleset.id)!
                            )
                          )
                        }
                      >
                        Unselect
                      </Button>
                    </ButtonGroup>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rules</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <UnorderedList>
              {modalRuleset?.rules.map((rule, index) => (
                <ListItem key={index}>{rule}</ListItem>
              ))}
            </UnorderedList>
          </ModalBody>
          <ModalFooter>
            {modalRuleset &&
              !fields.find((x) => x.ruleset_id == modalRuleset.id) && (
                <Button
                  {...buttonProps}
                  onClick={() => {
                    append({ ruleset_id: modalRuleset.id });
                    onClose();
                  }}
                >
                  Select
                </Button>
              )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export function WagerCreateRulesetTable({
  cosmwasmClient,
  control,
}: RulesetTableProps) {
  let watchDAOAddress = useWatch({ control, name: "dao_address" });
  const { data, isError, isFetched, refetch } = useDaoDaoCoreGetItemQuery({
    client: new DaoDaoCoreQueryClient(cosmwasmClient, watchDAOAddress),
    args: { key: env.ARENA_ITEM_KEY },
    options: { enabled: false },
  });
  useEffect(() => {
    if (isValidContractAddress(watchDAOAddress)) refetch();
  }, [watchDAOAddress, refetch]);
  const [rulesetsCount, setRulesetsCount] = useState<number>();

  if (!isFetched || isError || rulesetsCount === 0) {
    return null;
  }

  return (
    <FormControl>
      <FormLabel>Rulesets</FormLabel>
      {data && data.item && (
        <RulesetTableInner
          arenaCoreAddr={data.item}
          setRulesetsCount={(count: number) => setRulesetsCount(count)}
          cosmwasmClient={cosmwasmClient}
          control={control}
        />
      )}
      <small>Rulesets Count: {rulesetsCount}</small>
    </FormControl>
  );
}
