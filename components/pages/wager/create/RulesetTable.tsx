import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { UnorderedList, ListItem } from "@chakra-ui/layout";
import {
  TableContainerProps,
  Tr,
  Td,
  ButtonGroup,
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Skeleton,
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
import { Control, useWatch } from "react-hook-form";
import { FormValues } from "~/pages/wager/create";
import { useAllRulesets } from "~/hooks/useAllRulesets";
import { isValidContractAddress } from "~/helpers/AddressHelpers";
import { Ruleset } from "@arena/ArenaCore.types";

interface RulesetProps {
  cosmwasmClient: CosmWasmClient;
  onRulesetSelect: (id: string | undefined) => void;
}

interface RulesetTableProps extends RulesetProps {
  control: Control<FormValues>;
}

interface RulesetTableInnerProps extends RulesetProps {
  selectedRuleset: string | undefined;
  arenaCoreAddr: string;
  setRulesetsCount: (count: number) => void;
}

function RulesetTableInner({
  arenaCoreAddr,
  cosmwasmClient,
  onRulesetSelect,
  selectedRuleset,
  setRulesetsCount,
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
            {rulesets.map((ruleset, i) => (
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
                    {selectedRuleset == ruleset.id && (
                      <Button
                        {...buttonProps}
                        onClick={() => onRulesetSelect(undefined)}
                      >
                        Unselect
                      </Button>
                    )}
                  </ButtonGroup>
                </Td>
              </Tr>
            ))}
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
            {selectedRuleset != modalRuleset?.id && (
              <Button
                {...buttonProps}
                onClick={() => onRulesetSelect(modalRuleset?.id)}
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
  onRulesetSelect,
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
  const [selectedRuleset, setSelectedRuleset] = useState<string>();
  const [rulesetsCount, setRulesetsCount] = useState<number>();
  useEffect(() => {
    onRulesetSelect(selectedRuleset);
    setSelectedRuleset(selectedRuleset);
  }, [selectedRuleset, onRulesetSelect]);

  if (!isFetched || isError || rulesetsCount === 0) {
    return null;
  }

  return (
    <FormControl>
      <FormLabel>Rulesets</FormLabel>
      {data && data.item && (
        <RulesetTableInner
          selectedRuleset={selectedRuleset}
          arenaCoreAddr={data.item}
          setRulesetsCount={(count: number) => setRulesetsCount(count)}
          cosmwasmClient={cosmwasmClient}
          onRulesetSelect={(id: string | undefined) => setSelectedRuleset(id)}
        />
      )}
      <small>Rulesets Count: {rulesetsCount}</small>
    </FormControl>
  );
}
