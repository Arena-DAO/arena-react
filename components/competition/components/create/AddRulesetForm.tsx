import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { ListItem, UnorderedList } from "@chakra-ui/layout";
import {
	Button,
	ButtonGroup,
	ButtonProps,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import React from "react";
import { useFieldArray } from "react-hook-form";
import env from "~/config/env";
import { ArenaCoreQueryClient } from "~/ts-codegen/arena/ArenaCore.client";
import { useArenaCoreQueryExtensionQuery } from "~/ts-codegen/arena/ArenaCore.react-query";
import { Ruleset } from "~/ts-codegen/arena/ArenaCore.types";
import { FormComponentProps } from "../../CreateCompetitionForm";

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
	const initialRef = React.useRef(null);

	if (!data) return null;

	const rulesets = data as unknown as Ruleset[];
	if (rulesets.length === 0) return null;

	return (
		<>
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
							{rulesets.map((ruleset) => {
								const isRulesetSelected = fields.find(
									(x) => x.ruleset_id === ruleset.id,
								);

								return (
									<Tr key={ruleset.id}>
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
																fields.find(
																	(x) => x.ruleset_id === ruleset.id,
																)!,
															),
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
			</FormControl>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				isCentered
				initialFocusRef={initialRef}
			>
				<ModalOverlay />
				<ModalContent ref={initialRef}>
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
							!fields.find((x) => x.ruleset_id === modalRuleset.id) && (
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
