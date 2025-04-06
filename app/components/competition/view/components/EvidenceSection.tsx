"use client";

import MaybeLink from "@/components/MaybeLink";
import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import {
	Accordion,
	AccordionItem,
	Button,
	Card,
	CardBody,
	CardFooter,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tooltip,
	addToast,
	useDisclosure,
	useDraggable,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	type InfiniteData,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { chunk } from "lodash";
import { Plus, Trash } from "lucide-react";
import React from "react";
import { useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { z } from "zod";
import {
	ArenaWagerModuleClient,
	ArenaWagerModuleQueryClient,
} from "~/codegen/ArenaWagerModule.client";
import { arenaWagerModuleQueryKeys } from "~/codegen/ArenaWagerModule.react-query";
import type { Evidence } from "~/codegen/ArenaWagerModule.types";
import EvidenceSchema from "~/config/schemas/EvidenceSchema";
import { formatTimestampToDisplay } from "~/helpers/DateHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface EvidenceSectionProps {
	moduleAddr: string;
	competitionId: string;
}

const EvidenceFormSchema = z.object({
	evidence: EvidenceSchema,
});

type EvidenceFormValues = z.infer<typeof EvidenceFormSchema>;

const EvidenceSection = ({
	competitionId,
	moduleAddr,
}: EvidenceSectionProps) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [isSectionOpen, setIsSectionOpen] = React.useState(false);
	const fetchEvidence = async ({ pageParam = undefined }) => {
		if (!cosmWasmClient) {
			throw new Error("Could not get CosmWasm client");
		}

		const client = new ArenaWagerModuleQueryClient(cosmWasmClient, moduleAddr);
		const data = await client.evidence({
			competitionId,
			startAfter: pageParam,
		});

		return {
			items: data,
			nextCursor:
				data.length === env.PAGINATION_LIMIT
					? data[data.length - 1]?.id
					: undefined,
		};
	};

	const query = useInfiniteQuery({
		queryKey: arenaWagerModuleQueryKeys.evidence(moduleAddr, {
			competitionId,
		}),
		queryFn: fetchEvidence,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		enabled: !!cosmWasmClient && isSectionOpen,
	});

	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const {
		control,
		formState: { errors, isSubmitting },
		handleSubmit,
	} = useForm<EvidenceFormValues>({
		defaultValues: { evidence: [{ content: "" }] },
		resolver: zodResolver(EvidenceFormSchema),
	});
	const { fields, append, remove } = useFieldArray({
		control,
		name: "evidence",
	});

	const onSubmit = async (values: EvidenceFormValues) => {
		try {
			if (!address) throw "Could not get user address";

			const client = await getSigningCosmWasmClient();
			const competitionClient = new ArenaWagerModuleClient(
				client,
				address,
				moduleAddr,
			);

			const response = await competitionClient.submitEvidence({
				competitionId,
				evidence: values.evidence.map((x) => x.content),
			});

			addToast({
				color: "success",
				description: "Evidence has been submitted",
			});

			const evidence_id = response.events
				.find((x) => x.attributes.find((attr) => attr.key === "evidence_count"))
				?.attributes.find((attr) => attr.key === "evidence_count")?.value;

			if (evidence_id) {
				queryClient.setQueryData<InfiniteData<Evidence[]> | undefined>(
					arenaWagerModuleQueryKeys.evidence(moduleAddr, { competitionId }),
					(oldData) => {
						const newEvidence = values.evidence.map((x, i) => ({
							id: (Number(evidence_id) - values.evidence.length + i).toString(),
							content: x.content,
							submit_time: new Date().toISOString(),
							submit_user: address,
						}));

						if (!oldData || oldData.pages.length === 0) {
							// If oldData is undefined, create a new InfiniteData structure
							return {
								pages: [newEvidence],
								pageParams: [undefined],
							};
						}

						// If there are existing pages, append to the last page
						const newData = [...oldData.pages.flat(), ...newEvidence];

						const newPages = chunk(newData, env.PAGINATION_LIMIT);

						return {
							pageParams: [
								undefined,
								...newPages.slice(0, -1).map((page) => page.at(-1)?.id),
							],
							pages: newPages,
						};
					},
				);
			} else {
				query.refetch();
			}
		} catch (e) {
			console.error(e);
			addToast({ color: "danger", description: (e as Error).toString() });
		}
	};

	const evidence = useMemo(
		() => query.data?.pages.flatMap((page) => page.items) ?? [],
		[query.data],
	);

	// biome-ignore lint/style/noNonNullAssertion: correct
	const targetRef = React.useRef(null!);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

	return (
		<>
			<Card>
				<CardBody>
					<Accordion
						selectionMode="single"
						onSelectionChange={(keys) => {
							if (keys === "all") {
								setIsSectionOpen(true);
							} else {
								setIsSectionOpen(keys.has("evidence"));
							}
						}}
					>
						<AccordionItem
							key="evidence"
							aria-label="Evidence"
							title="Evidence"
							classNames={{ title: "font-semibold text-xl", content: "gap-2" }}
						>
							<Table
								isHeaderSticky
								aria-label="Evidence"
								bottomContent={
									query.hasNextPage && (
										<div className="flex w-full justify-center">
											<Button
												onPress={() => query.fetchNextPage()}
												isLoading={query.isFetchingNextPage}
											>
												Load More
											</Button>
										</div>
									)
								}
								classNames={{
									base: "max-h-xl overflow-auto table-auto",
								}}
							>
								<TableHeader>
									<TableColumn>Evidence Time</TableColumn>
									<TableColumn>Submission User</TableColumn>
									<TableColumn>Content</TableColumn>
								</TableHeader>
								<TableBody
									emptyContent="No evidence available"
									items={evidence}
									isLoading={query.isLoading}
									loadingContent={<Spinner color="white" />}
								>
									{(item: Evidence) => (
										<TableRow key={item.id}>
											<TableCell>
												{formatTimestampToDisplay(item.submit_time)}
											</TableCell>
											<TableCell>
												<Profile address={item.submit_user} />
											</TableCell>
											<TableCell>
												<MaybeLink content={item.content} />
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
							<CardFooter>
								<Button onPress={onOpen} isDisabled={isSubmitting}>
									Add Evidence
								</Button>
							</CardFooter>
						</AccordionItem>
					</Accordion>
				</CardBody>
			</Card>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				size="4xl"
				ref={targetRef}
			>
				<ModalContent>
					<ModalHeader {...moveProps}>Add Evidence</ModalHeader>
					<ModalBody className="space-y-4">
						{fields?.map((evidence, i) => (
							<Controller
								key={evidence.id}
								control={control}
								name={`evidence.${i}.content`}
								render={({ field }) => (
									<Input
										label={`Item ${i + 1}`}
										isDisabled={isSubmitting}
										isInvalid={!!errors.evidence?.[i]?.content}
										errorMessage={errors.evidence?.[i]?.content?.message}
										endContent={
											<Tooltip content="Delete evidence item">
												<Button
													isIconOnly
													aria-label="Delete evidence item"
													variant="faded"
													onPress={() => remove(i)}
													isDisabled={isSubmitting}
												>
													<Trash />
												</Button>
											</Tooltip>
										}
										{...field}
									/>
								)}
							/>
						))}
						<div className="text-danger text-xs">
							<p>{errors.evidence?.message}</p>
							<p>{errors.evidence?.root?.message}</p>
						</div>
					</ModalBody>
					<ModalFooter>
						<Button
							onPress={() => append({ content: "" })}
							isDisabled={isSubmitting}
							aria-label="Add evidence item"
							startContent={<Plus />}
						>
							Add Item
						</Button>
						<Button
							onPress={() => handleSubmit(onSubmit)()}
							isLoading={isSubmitting}
						>
							Submit
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default EvidenceSection;
