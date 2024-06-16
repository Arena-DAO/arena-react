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
} from "@nextui-org/react";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FiPlus, FiTrash } from "react-icons/fi";
import { useAsyncList } from "react-stately";
import { toast } from "react-toastify";
import { z } from "zod";
import {
	ArenaWagerModuleClient,
	ArenaWagerModuleQueryClient,
} from "~/codegen/ArenaWagerModule.client";
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
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const [hasMore, setHasMore] = useState(false);
	const list = useAsyncList<Evidence, string | undefined>({
		async load({ cursor }) {
			if (!cosmWasmClient) {
				return { items: [] };
			}

			const client = new ArenaWagerModuleQueryClient(
				cosmWasmClient,
				moduleAddr,
			);

			const data = await client.evidence({ competitionId, startAfter: cursor });

			setHasMore(data.length === env.PAGINATION_LIMIT);

			return {
				items: data,
				cursor: data[data.length - 1]?.id,
			};
		},
	});
	const [loaderRef, scrollerRef] = useInfiniteScroll({
		hasMore,
		onLoadMore: list.loadMore,
	});

	// Form section
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
				list.append(
					...values.evidence.map((x, i) => ({
						id: (Number(evidence_id) - values.evidence.length + i).toString(),
						content: x.content,
						submit_time: new Date().toString(),
						submit_user: address,
					})),
				);
			} else {
				list.reload();
			}

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (e: any) {
			console.error(e);
			toast.error(e.toString());
		}
	};

	if (list.items.length === 0 && hideIfEmpty) return null;

	return (
		<>
			<Card>
				<CardHeader>Evidence</CardHeader>
				<CardBody>
					<Table
						isHeaderSticky
						aria-label="Evidence"
						baseRef={scrollerRef}
						removeWrapper
						bottomContent={
							hasMore ? (
								<div className="flex w-full justify-center">
									<Spinner ref={loaderRef} color="white" />
								</div>
							) : null
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
							items={list.items}
							isLoading={list.isLoading}
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
					<Button onClick={onOpen} isDisabled={!address}>
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
													onClick={() => remove(i)}
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
							onClick={() => append({ content: "" })}
							isDisabled={isSubmitting}
							aria-label="Add evidence item"
							startContent={<FiPlus />}
						>
							Add Item
						</Button>
						<Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
							Submit
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default EvidenceSection;
