"use client";

import Profile from "@/components/Profile";
import { parseAbsoluteToLocal } from "@internationalized/date";
import {
	Accordion,
	AccordionItem,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	DatePicker,
	Input,
	Select,
	SelectItem,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Textarea,
	Tooltip,
} from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import type { PropsWithChildren } from "react";
import {
	type Control,
	Controller,
	type FieldError,
	useFieldArray,
	useFormContext,
} from "react-hook-form";
import { BsInfoCircle, BsPercent } from "react-icons/bs";
import { FiPlus, FiTrash } from "react-icons/fi";
import type { z } from "zod";
import type { CreateCompetitionSchema } from "~/config/schemas";
import { useCategoryMap } from "~/hooks/useCategories";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import DueBalance from "./components/DueBalance";
import DueProfile from "./components/DueProfile";
import MemberProfile from "./components/MemberProfile";
import RulesetsSelection from "./components/RulesetsSelection";

export type CreateCompetitionFormValues = z.infer<
	typeof CreateCompetitionSchema
>;

export interface FormComponentProps {
	control: Control<CreateCompetitionFormValues>;
}

interface CreateCompetitionFormProps extends PropsWithChildren {}

export default function CreateCompetitionForm({
	children,
}: CreateCompetitionFormProps) {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const searchParams = useSearchParams();
	const { data: categories } = useCategoryMap();
	const {
		control,
		watch,
		formState: { errors, isSubmitting, defaultValues },
		setValue,
		getValues,
	} = useFormContext<CreateCompetitionFormValues>();

	const watchExpiration = watch("expiration");
	const watchMembersFromDues = watch("membersFromDues");

	const {
		fields: rulesFields,
		append: rulesAppend,
		remove: rulesRemove,
	} = useFieldArray({ name: "rules", control });
	const {
		fields: duesFields,
		append: duesAppend,
		remove: duesRemove,
	} = useFieldArray({ name: "dues", control });
	const {
		fields: membersFields,
		append: membersAppend,
		remove: membersRemove,
	} = useFieldArray({ name: "members", control });
	const {
		fields: additionalLayeredFeesFields,
		append: additionalLayeredFeesAppend,
		remove: additionalLayeredFeesRemove,
	} = useFieldArray({ name: "additionalLayeredFees", control });

	const category = searchParams?.get("category") ?? "";
	const categoryItem = categories.get(category);
	const category_id =
		categoryItem && "category_id" in categoryItem
			? categoryItem.category_id
			: undefined;

	return (
		<div className="space-y-4">
			<Controller
				control={control}
				name="name"
				render={({ field }) => (
					<Input
						label="Competition Name"
						isDisabled={isSubmitting}
						isInvalid={!!errors.name}
						errorMessage={errors.name?.message}
						{...field}
					/>
				)}
			/>
			<Controller
				control={control}
				name="description"
				render={({ field }) => (
					<Textarea
						label="Competition Description"
						isDisabled={isSubmitting}
						isInvalid={!!errors.description}
						errorMessage={errors.description?.message}
						{...field}
					/>
				)}
			/>
			<div className="grid grid-cols-12 gap-2">
				<Select
					label="Expiration"
					className="col-span-12 md:col-span-4 sm:col-span-6"
					isDisabled={isSubmitting}
					defaultSelectedKeys={["at_time"]}
					onChange={(e) => {
						switch (e.target.value) {
							case "never":
								setValue("expiration", { never: {} });
								break;
							case "at_time":
								setValue("expiration", {
									at_time:
										defaultValues?.expiration &&
										"at_time" in defaultValues.expiration &&
										defaultValues.expiration.at_time
											? defaultValues.expiration.at_time
											: new Date().toString(),
								});
								break;
							case "at_height":
								setValue("expiration", { at_height: 0 });
								break;
						}
					}}
				>
					<SelectItem value="at_time" key="at_time">
						At Time
					</SelectItem>
					<SelectItem value="at_height" key="at_height">
						At Height
					</SelectItem>
					<SelectItem value="never" key="never">
						Never
					</SelectItem>
				</Select>
				{"at_height" in watchExpiration && (
					<Controller
						control={control}
						name="expiration.at_height"
						render={({ field }) => (
							<Input
								className="col-span-12 lg:col-span-4 sm:col-span-6"
								label="Height"
								type="number"
								isDisabled={isSubmitting}
								isInvalid={
									!!errors.expiration && "at_height" in errors.expiration
								}
								errorMessage={
									!!errors.expiration && "at_height" in errors.expiration
										? (errors.expiration.at_height as FieldError).message
										: ""
								}
								{...field}
								value={watchExpiration.at_height.toString()}
								onChange={(e) =>
									field.onChange(Number.parseInt(e.target.value))
								}
							/>
						)}
					/>
				)}
				{"at_time" in watchExpiration && (
					<Controller
						control={control}
						name="expiration.at_time"
						render={({ field }) => (
							<DatePicker
								showMonthAndYearPickers
								className="col-span-12 lg:col-span-4 sm:col-span-6"
								label="Time"
								isDisabled={isSubmitting}
								isInvalid={
									!!errors.expiration && "at_time" in errors.expiration
								}
								errorMessage={
									!!errors.expiration && "at_time" in errors.expiration
										? (errors.expiration.at_time as FieldError).message
										: ""
								}
								{...field}
								value={parseAbsoluteToLocal(watchExpiration.at_time)}
								onChange={(x) => field.onChange(x.toAbsoluteString())}
							/>
						)}
					/>
				)}
			</div>
			<Card>
				<CardHeader className="flex justify-between gap-4">
					<div>Dues</div>
					<div className="flex flex-nowrap gap-2">
						<Switch
							aria-label="Members from Dues"
							isDisabled={isSubmitting}
							defaultSelected={defaultValues?.membersFromDues}
							isSelected={watchMembersFromDues}
							onValueChange={(value) => {
								setValue("membersFromDues", value);
								if (!value)
									setValue(
										"members",
										getValues("dues").map((x) => ({ address: x.addr })),
									);
								else setValue("members", []);
							}}
						>
							Members from Dues
						</Switch>
						<Tooltip content="If enabled, then competition members can be inferred from the dues">
							<Button isIconOnly variant="light">
								<BsInfoCircle />
							</Button>
						</Tooltip>
					</div>
				</CardHeader>
				<CardBody>
					<Table aria-label="Dues" removeWrapper hideHeader>
						<TableHeader>
							<TableColumn>Dues</TableColumn>
						</TableHeader>
						<TableBody emptyContent="No dues provided">
							{duesFields.map((due, i) => (
								<TableRow key={due.id}>
									<TableCell>
										<Card>
											<CardHeader className="flex justify-between gap-4">
												<div className="text-nowrap">Due {i + 1}</div>
												<DueProfile
													cosmWasmClient={cosmWasmClient}
													index={i}
													control={control}
												/>
											</CardHeader>
											<CardBody className="space-y-4">
												<Controller
													control={control}
													name={`dues.${i}.addr`}
													render={({ field }) => (
														<Input
															label="Address"
															isDisabled={isSubmitting}
															isInvalid={!!errors.dues?.[i]?.addr}
															errorMessage={errors.dues?.[i]?.addr?.message}
															endContent={
																<Tooltip content="Delete Dues">
																	<Button
																		isIconOnly
																		aria-label="Delete Dues"
																		variant="faded"
																		isDisabled={isSubmitting}
																		onClick={() => duesRemove(i)}
																	>
																		<FiTrash />
																	</Button>
																</Tooltip>
															}
															{...field}
														/>
													)}
												/>
												<DueBalance
													control={control}
													index={i}
													getValues={getValues}
												/>
												<div className="text-danger text-xs">
													<p>{errors.dues?.[i]?.balance?.message}</p>
												</div>
											</CardBody>
										</Card>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<div className="text-danger text-xs">
						<p>{errors.dues?.message}</p>
						<p>{errors.dues?.root?.message}</p>
					</div>
				</CardBody>
				<CardFooter>
					<Button
						onClick={() =>
							duesAppend({
								addr: "",
								balance: { native: [], cw20: [], cw721: [] },
							})
						}
						isDisabled={isSubmitting}
						aria-label="Add Dues"
						startContent={<FiPlus />}
					>
						Add Dues
					</Button>
				</CardFooter>
			</Card>
			{!watchMembersFromDues && (
				<Card>
					<CardHeader>Members</CardHeader>
					<CardBody>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{membersFields?.map((rule, i) => (
								<div key={rule.id} className="flex flex-col gap-4">
									<Controller
										control={control}
										name={`members.${i}.address`}
										render={({ field }) => (
											<Input
												className="w-full"
												label={`Member ${i + 1}`}
												isDisabled={isSubmitting}
												isInvalid={!!errors.members?.[i]?.address}
												errorMessage={errors.members?.[i]?.address?.message}
												endContent={
													<Tooltip content="Delete member">
														<Button
															isIconOnly
															isDisabled={isSubmitting}
															aria-label="Delete member"
															variant="faded"
															onClick={() => membersRemove(i)}
														>
															<FiTrash />
														</Button>
													</Tooltip>
												}
												{...field}
											/>
										)}
									/>
									<MemberProfile index={i} control={control} />
								</div>
							))}
						</div>
						<div className="text-danger text-xs">
							<p>{errors.members?.message}</p>
							<p>{errors.members?.root?.message}</p>
						</div>
					</CardBody>
					<CardFooter>
						<Button
							onClick={() => membersAppend({ address: "" })}
							aria-label="Add member"
							isDisabled={isSubmitting}
							startContent={<FiPlus />}
						>
							Add Member
						</Button>
					</CardFooter>
				</Card>
			)}
			<Card>
				<CardHeader>Rules</CardHeader>
				<CardBody>
					<RulesetsSelection category_id={category_id} />
					<Table aria-label="Rules" hideHeader removeWrapper>
						<TableHeader>
							<TableColumn>Rules</TableColumn>
						</TableHeader>
						<TableBody>
							{rulesFields?.map((rule, i) => (
								<TableRow key={rule.id}>
									<TableCell>
										<Controller
											control={control}
											name={`rules.${i}.rule`}
											render={({ field }) => (
												<Input
													label={`Rule ${i + 1}`}
													isDisabled={isSubmitting}
													isInvalid={!!errors.rules?.[i]?.rule}
													errorMessage={errors.rules?.[i]?.rule?.message}
													endContent={
														<Tooltip content="Delete rule">
															<Button
																isIconOnly
																isDisabled={isSubmitting}
																aria-label="Delete Rule"
																variant="faded"
																onClick={() => rulesRemove(i)}
															>
																<FiTrash />
															</Button>
														</Tooltip>
													}
													{...field}
												/>
											)}
										/>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardBody>
				<CardFooter>
					<Button
						onClick={() => rulesAppend({ rule: "" })}
						aria-label="Add rule"
						isDisabled={isSubmitting}
						startContent={<FiPlus />}
					>
						Add Rule
					</Button>
				</CardFooter>
			</Card>
			<Accordion variant="splitted">
				<AccordionItem
					key="1"
					aria-label="Additional Layered Fees"
					title="Additional Layered Fees"
					subtitle="Set additional fees to be automatically sent when a competition is processed"
					isCompact
					className="gap-4 overflow-x-auto"
				>
					<Table aria-label="Distribution" removeWrapper>
						<TableHeader>
							<TableColumn>Recipient</TableColumn>
							<TableColumn>Percentage</TableColumn>
							<TableColumn>Action</TableColumn>
						</TableHeader>
						<TableBody emptyContent="No additional fees">
							{additionalLayeredFeesFields?.map((x, i) => (
								<TableRow key={x.id}>
									<TableCell>
										<Controller
											control={control}
											name={`additionalLayeredFees.${i}.addr`}
											render={({ field }) => (
												<Input
													label={`Recipient ${i + 1}`}
													isDisabled={isSubmitting}
													isInvalid={!!errors.additionalLayeredFees?.[i]?.addr}
													errorMessage={
														errors.additionalLayeredFees?.[i]?.addr?.message
													}
													{...field}
													className="min-w-80"
												/>
											)}
										/>
										<Profile
											className="mt-2"
											address={getValues(`additionalLayeredFees.${i}.addr`)}
											hideIfInvalid
										/>
									</TableCell>
									<TableCell className="align-top">
										<Controller
											control={control}
											name={`additionalLayeredFees.${i}.percentage`}
											render={({ field }) => (
												<Input
													type="number"
													min="0"
													max="100"
													step="1"
													label="Percentage"
													isDisabled={isSubmitting}
													isInvalid={
														!!errors.additionalLayeredFees?.[i]?.percentage
													}
													errorMessage={
														errors.additionalLayeredFees?.[i]?.percentage
															?.message
													}
													endContent={<BsPercent />}
													classNames={{ input: "text-right" }}
													{...field}
													value={field.value?.toString()}
													onChange={(e) =>
														field.onChange(Number.parseFloat(e.target.value))
													}
													className="min-w-32 max-w-40"
												/>
											)}
										/>
									</TableCell>
									<TableCell className="align-top">
										<Button
											isIconOnly
											aria-label="Delete Fee"
											variant="faded"
											onClick={() => additionalLayeredFeesRemove(i)}
											isDisabled={isSubmitting}
										>
											<FiTrash />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<Button
						onClick={() =>
							additionalLayeredFeesAppend({ addr: "", percentage: 0 })
						}
						aria-label="Add Fee"
						startContent={<FiPlus />}
						isDisabled={isSubmitting}
					>
						Add Fee
					</Button>
				</AccordionItem>
			</Accordion>
			{children}
		</div>
	);
}
