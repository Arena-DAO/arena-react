"use client";

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
import {
	type Control,
	Controller,
	type FieldError,
	useFieldArray,
	useFormContext,
} from "react-hook-form";
import { FiPlus, FiTrash } from "react-icons/fi";
import type { z } from "zod";
import type { CreateCompetitionSchema } from "~/config/schemas";
import { keyboardDelegateFixSpace } from "~/helpers/NextUIHelpers";
import { useCategoryMap } from "~/hooks/useCategories";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import DueBalance from "./components/DueBalance";
import DueProfile from "./components/DueProfile";
import RulesetsSelection from "./components/RulesetsSelection";

export type CreateCompetitionFormValues = z.infer<
	typeof CreateCompetitionSchema
>;

export interface FormComponentProps {
	control: Control<CreateCompetitionFormValues>;
}

export default function CreateCompetitionForm() {
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

	const category = searchParams?.get("category") ?? "";
	const categoryItem = categories.get(category);
	const category_id =
		categoryItem && "category_id" in categoryItem
			? categoryItem.category_id
			: undefined;

	return (
		<>
			<Controller
				control={control}
				name="name"
				render={({ field }) => (
					<Input
						label="Name"
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
						label="Description"
						isDisabled={isSubmitting}
						isInvalid={!!errors.description}
						errorMessage={errors.description?.message}
						{...field}
					/>
				)}
			/>
			<div className="grid grid-cols-12 gap-4">
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
				<CardHeader>Rules</CardHeader>
				<CardBody>
					{cosmWasmClient && (
						<RulesetsSelection
							category_id={category_id}
							cosmWasmClient={cosmWasmClient}
						/>
					)}
					<Table
						aria-label="Rules"
						keyboardDelegate={keyboardDelegateFixSpace}
						hideHeader
						removeWrapper
					>
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
			<Card>
				<CardHeader>Dues</CardHeader>
				<CardBody>
					<Table
						aria-label="Dues"
						keyboardDelegate={keyboardDelegateFixSpace}
						removeWrapper
						hideHeader
					>
						<TableHeader>
							<TableColumn>Dues</TableColumn>
						</TableHeader>
						<TableBody emptyContent="No dues provided">
							{duesFields.map((due, index) => (
								<TableRow key={due.id}>
									<TableCell>
										<Card>
											<CardHeader className="flex justify-between">
												<div className="mr-4 text-nowrap">Due {index + 1}</div>
												{cosmWasmClient && (
													<DueProfile
														cosmWasmClient={cosmWasmClient}
														index={index}
														control={control}
													/>
												)}
											</CardHeader>
											<CardBody className="space-y-4">
												<Controller
													control={control}
													name={`dues.${index}.addr`}
													render={({ field }) => (
														<Input
															label="Address"
															isDisabled={isSubmitting}
															isInvalid={!!errors.dues?.[index]?.addr}
															errorMessage={errors.dues?.[index]?.addr?.message}
															endContent={
																<Tooltip content="Delete Dues">
																	<Button
																		isIconOnly
																		aria-label="Delete Dues"
																		variant="faded"
																		isDisabled={isSubmitting}
																		onClick={() => duesRemove(index)}
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
													index={index}
													getValues={getValues}
												/>
												<div className="text-danger text-xs">
													<p>{errors.dues?.[index]?.balance?.message}</p>
												</div>
											</CardBody>
										</Card>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
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
			<Accordion variant="shadow">
				<AccordionItem
					key="1"
					aria-label="Accordion 1"
					title="Competition DAO Details"
				>
					<div className="space-y-4">
						<Controller
							control={control}
							name="competition_dao_name"
							render={({ field }) => (
								<Input
									label="Name"
									isDisabled={isSubmitting}
									isInvalid={!!errors.competition_dao_name}
									errorMessage={errors.competition_dao_name?.message}
									{...field}
								/>
							)}
						/>
						<Controller
							control={control}
							name="competition_dao_description"
							render={({ field }) => (
								<Textarea
									label="Description"
									isDisabled={isSubmitting}
									isInvalid={!!errors.competition_dao_description}
									errorMessage={errors.competition_dao_description?.message}
									{...field}
								/>
							)}
						/>
					</div>
				</AccordionItem>
			</Accordion>
		</>
	);
}
