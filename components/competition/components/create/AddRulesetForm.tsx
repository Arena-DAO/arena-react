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
import env from "@config/env";
import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Ruleset } from "@arena/ArenaCore.types";
import { FormComponentProps } from "../../CreateCompetitionForm";
import { useArenaCoreQueryExtensionQuery } from "@arena/ArenaCore.react-query";
import { ArenaCoreQueryClient } from "@arena/ArenaCore.client";

interface AddRulesetFormProps extends FormComponentProps {
  category_id: string;
}

export function AddRulesetForm({
  cosmwasmClient,
  control,
  category_id,
}: AddRulesetFormProps) {
  // TODO: add pagination support (limit is 30 results)
  const { data } = useArenaCoreQueryExtensionQuery({
    client: new ArenaCoreQueryClient(cosmwasmClient, env.ARENA_CORE_ADDRESS),
    args: { msg: { rulesets: { category_id: category_id } } },
  });
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

  if (!data) return null;

  const rulesets = data as unknown as Ruleset[];
  if (rulesets.length == 0) return null;

  return (
    <FormControl>
      <FormLabel>Rulesets</FormLabel>
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
    </FormControl>
  );
}
