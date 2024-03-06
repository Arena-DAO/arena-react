"use client";

import {
	Accordion,
	AccordionItem,
	Button,
	Card,
	CardBody,
	CardHeader,
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
	Control,
	FieldError,
	useFieldArray,
	useFormContext,
} from "react-hook-form";
import { FiDelete, FiPlus } from "react-icons/fi";
import { z } from "zod";
import { CreateCompetitionSchema } from "~/config/schemas";
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
		register,
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
			<Input
				{...register("name")}
				label="Name"
				isDisabled={isSubmitting}
				isInvalid={!!errors.name}
				errorMessage={errors.name?.message}
			/>
			<Textarea
				{...register("description")}
				label="Description"
				isDisabled={isSubmitting}
				isInvalid={!!errors.description}
				errorMessage={errors.description?.message}
			/>
			<div className="grid grid-cols-12 gap-4">
				<Select
					label="Expiration"
					className="col-span-12 sm:col-span-6 md:col-span-4"
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
					<Input
						className="col-span-12 sm:col-span-6 lg:col-span-4"
						{...register("expiration.at_height")}
						label="Height"
						type="number"
						value={watchExpiration.at_height.toString()}
						isDisabled={isSubmitting}
						isInvalid={!!errors.expiration && "at_height" in errors.expiration}
						errorMessage={
							!!errors.expiration && "at_height" in errors.expiration
								? (errors.expiration.at_height as FieldError).message
								: ""
						}
					/>
				)}
				{"at_time" in watchExpiration && (
					<Input
						{...register("expiration.at_time")}
						className="col-span-12 sm:col-span-6 lg:col-span-4"
						type="datetime-local"
						placeholder="Select date and time"
						value={watchExpiration.at_time}
						label="Time"
						isDisabled={isSubmitting}
						isInvalid={!!errors.expiration && "at_time" in errors.expiration}
						errorMessage={
							!!errors.expiration && "at_time" in errors.expiration
								? (errors.expiration.at_time as FieldError).message
								: ""
						}
						endContent={
							<div className="pointer-events-none flex items-center">
								<span className="text-default-400 text-small">UTC</span>
							</div>
						}
					/>
				)}
			</div>
			{cosmWasmClient && (
				<RulesetsSelection
					category_id={category_id}
					cosmWasmClient={cosmWasmClient}
				/>
			)}
			<Button
				onClick={() => rulesAppend({ rule: "" })}
				aria-label="Add rule"
				startContent={<FiPlus />}
			>
				Add Rule
			</Button>
			<Table aria-label="Rules">
				<TableHeader>
					<TableColumn>Rules</TableColumn>
				</TableHeader>
				<TableBody emptyContent="No rules given">
					{rulesFields?.map((rule, ruleIndex) => (
						<TableRow key={rule.id}>
							<TableCell>
								<Input
									{...register(`rules.${ruleIndex}.rule`)}
									label={`Rule ${ruleIndex + 1}`}
									isDisabled={isSubmitting}
									isInvalid={!!errors.rules?.[ruleIndex]?.rule}
									errorMessage={errors.rules?.[ruleIndex]?.rule?.message}
									endContent={
										<Tooltip content="Delete rule">
											<Button
												isIconOnly
												aria-label="Delete Rule"
												variant="faded"
												onClick={() => rulesRemove(ruleIndex)}
											>
												<FiDelete />
											</Button>
										</Tooltip>
									}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<Button
				onClick={() =>
					duesAppend({ addr: "", balance: { native: [], cw20: [], cw721: [] } })
				}
				aria-label="Add due"
				startContent={<FiPlus />}
			>
				Add Team
			</Button>
			<Table aria-label="Teams">
				<TableHeader>
					<TableColumn>Teams</TableColumn>
				</TableHeader>
				<TableBody emptyContent="No teams provided">
					{duesFields.map((due, index) => (
						<TableRow key={due.id}>
							<TableCell>
								<Card>
									<CardHeader className="flex justify-between">
										<div>Team {index + 1}</div>
										{cosmWasmClient && (
											<DueProfile
												cosmWasmClient={cosmWasmClient}
												index={index}
												control={control}
											/>
										)}
									</CardHeader>
									<CardBody className="space-y-4">
										<Input
											label="Address"
											{...register(`dues.${index}.addr`)}
											isDisabled={isSubmitting}
											isInvalid={!!errors.dues?.[index]?.addr}
											errorMessage={errors.dues?.[index]?.addr?.message}
											endContent={
												<Tooltip content="Delete Team">
													<Button
														isIconOnly
														aria-label="Delete Team"
														variant="faded"
														onClick={() => duesRemove(index)}
													>
														<FiDelete />
													</Button>
												</Tooltip>
											}
										/>
										{cosmWasmClient && (
											<DueBalance
												control={control}
												cosmWasmClient={cosmWasmClient}
												index={index}
												getValues={getValues}
											/>
										)}
									</CardBody>
								</Card>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<Accordion variant="shadow">
				<AccordionItem
					key="1"
					aria-label="Accordion 1"
					title="Competition DAO Details"
				>
					<div className="space-y-4">
						<Input
							{...register("competition_dao_name")}
							value={defaultValues?.competition_dao_name}
							label="Name"
							isDisabled={isSubmitting}
							isInvalid={!!errors.competition_dao_name}
							errorMessage={errors.competition_dao_name?.message}
						/>
						<Textarea
							{...register("competition_dao_description")}
							value={defaultValues?.competition_dao_description}
							label="Description"
							isDisabled={isSubmitting}
							isInvalid={!!errors.competition_dao_description}
							errorMessage={errors.competition_dao_description?.message}
						/>
					</div>
				</AccordionItem>
			</Accordion>
		</>
	);
}
