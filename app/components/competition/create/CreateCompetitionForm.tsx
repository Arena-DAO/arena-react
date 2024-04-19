"use client";

import { parseAbsoluteToLocal } from "@internationalized/date";
import {
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
import {
	type Control,
	Controller,
	type FieldError,
	useFieldArray,
	useFormContext,
} from "react-hook-form";
import { BsInfoCircle } from "react-icons/bs";
import { FiPlus, FiTrash } from "react-icons/fi";
import type { z } from "zod";
import type { CreateCompetitionSchema } from "~/config/schemas";
import { keyboardDelegateFixSpace } from "~/helpers/NextUIHelpers";
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

interface CreateCompetitionFormProps {
	isMembersFromDuesVisible?: boolean;
}

export default function CreateCompetitionForm({
	isMembersFromDuesVisible = true,
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
				<CardHeader className="flex justify-between space-x-4">
					<div>Dues</div>
					{isMembersFromDuesVisible && (
						<div className="flex flex-nowrap space-x-2">
							<Switch
								aria-label="Members from Dues"
								isDisabled={isSubmitting}
								defaultSelected={defaultValues?.membersFromDues}
								isSelected={watchMembersFromDues}
								onValueChange={(value) => setValue("membersFromDues", value)}
							>
								Members from Dues
							</Switch>
							<Tooltip content="If enabled, then competition members can be inferred from the dues">
								<Button isIconOnly variant="light">
									<BsInfoCircle />
								</Button>
							</Tooltip>
						</div>
					)}
				</CardHeader>
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
							{duesFields.map((due, i) => (
								<TableRow key={due.id}>
									<TableCell>
										<Card>
											<CardHeader className="flex justify-between space-x-4">
												<div className="text-nowrap">Due {i + 1}</div>
												{cosmWasmClient && (
													<DueProfile
														cosmWasmClient={cosmWasmClient}
														index={i}
														control={control}
													/>
												)}
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
			{isMembersFromDuesVisible && !watchMembersFromDues && (
				<Card>
					<CardHeader>Members</CardHeader>
					<CardBody>
						<Table
							aria-label="Members"
							keyboardDelegate={keyboardDelegateFixSpace}
							hideHeader
							removeWrapper
						>
							<TableHeader>
								<TableColumn>Member</TableColumn>
							</TableHeader>
							<TableBody>
								{membersFields?.map((rule, i) => (
									<TableRow key={rule.id}>
										<TableCell>
											<div className="flex space-x-4">
												<Controller
													control={control}
													name={`members.${i}.address`}
													render={({ field }) => (
														<Input
															className="max-w-3xl"
															label={`Member ${i + 1}`}
															isDisabled={isSubmitting}
															isInvalid={!!errors.members?.[i]?.address}
															errorMessage={
																errors.members?.[i]?.address?.message
															}
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
												{cosmWasmClient && (
													<MemberProfile
														cosmWasmClient={cosmWasmClient}
														index={i}
														control={control}
													/>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
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
		</div>
	);
}
