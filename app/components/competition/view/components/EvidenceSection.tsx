"use client";

import MaybeLink from "@/components/MaybeLink";
import Profile from "@/components/Profile";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
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
	useDisclosure,
	useDraggable,
} from "@nextui-org/react";
import {
	type InfiniteData,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { chunk } from "lodash";
import React from "react";
import { useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FiPlus, FiTrash } from "react-icons/fi";
import { toast } from "react-toastify";
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
	hideIfEmpty: boolean;
}

const EvidenceFormSchema = z.object({
	evidence: EvidenceSchema,
});

type EvidenceFormValues = z.infer<typeof EvidenceFormSchema>;

const EvidenceSection = ({
	competitionId,
	moduleAddr,
	hideIfEmpty,
}: EvidenceSectionProps) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const queryClient = useQueryClient();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
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
		enabled: !!cosmWasmClient,
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

			toast.success("Evidence has been submitted");

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
			toast.error((e as Error).toString());
		}
	};

	const evidence = useMemo(
		() => query.data?.pages.flatMap((page) => page.items) ?? [],
		[query.data],
	);

	const targetRef = React.useRef(null);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

	if (evidence.length === 0 && hideIfEmpty) return null;

	return (
		<>
			<Card ref={targetRef}>
				<CardHeader {...moveProps}>
					<h2 className="font-semibold text-xl">Evidence</h2>
				</CardHeader>
				<CardBody>
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
				</CardBody>
				<CardFooter>
					<Button onPress={onOpen} isDisabled={isSubmitting}>
						Add Evidence
					</Button>
				</CardFooter>
			</Card>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
				<ModalContent>
					<ModalHeader>Add Evidence</ModalHeader>
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
													<FiTrash />
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
							startContent={<FiPlus />}
						>
							Add Item
						</Button>
						<Button
							onPress={() => handleSubmit(onSubmit)}
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
