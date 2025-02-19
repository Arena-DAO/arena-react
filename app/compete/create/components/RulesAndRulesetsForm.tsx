import {
	Accordion,
	AccordionItem,
	Button,
	Card,
	Chip,
	Divider,
	Input,
	Tab,
	Tabs,
	Textarea,
	Tooltip,
} from "@heroui/react";
import {
	FileText,
	GripVertical,
	Link,
	LinkIcon,
	Plus,
	Trash,
} from "lucide-react";
import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { useCategoryContext } from "~/contexts/CategoryContext";
import RulesetsSelection from "./RulesetsSelection";

const RulesAndRulesetsForm = () => {
	const {
		control,
		formState: { isSubmitting },
		watch,
	} = useFormContext();
	const category = useCategoryContext();
	const {
		fields: ruleFields,
		append: appendRule,
		remove: removeRule,
	} = useFieldArray({
		control,
		name: "rules",
	});

	// Watch current rules for validation
	const rules = watch("rules");
	const rulesCount = rules?.length || 0;

	// For switching between simple/advanced rule input
	const [selectedRuleType, setSelectedRuleType] = useState<"simple" | "link">(
		"simple",
	);

	// Helper to detect if a string is a valid URL
	const isValidUrl = (string: string) => {
		try {
			new URL(string);
			return true;
		} catch (_) {
			return false;
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-6">
				{/* Rules explanation */}
				<Card className="border border-primary/10 bg-primary/5 p-4">
					<div className="flex items-start gap-3">
						<div className="mt-1 rounded-full bg-primary/10 p-2">
							<FileText size={20} className="text-primary" />
						</div>
						<div>
							<h4 className="mb-1 font-medium">Competition Rules</h4>
							<p className="text-foreground/70 text-sm">
								Clearly define the rules for your competition. You can add
								custom rules directly or link to external rule documents. You
								can also select from predefined rulesets if available for your
								category.
							</p>
						</div>
					</div>
				</Card>

				{/* Rule input section */}
				<div>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="font-semibold text-lg">Custom Rules</h3>
						<Chip variant="flat" color={rulesCount > 0 ? "success" : "default"}>
							{rulesCount} rule{rulesCount !== 1 ? "s" : ""} added
						</Chip>
					</div>

					{/* Add rule button with tabs */}
					<Card className="mb-4 overflow-hidden border border-primary/10">
						<div className="border-primary/10 border-b p-4">
							<Tabs
								aria-label="Rule input type"
								color="primary"
								selectedKey={selectedRuleType}
								onSelectionChange={(key) =>
									setSelectedRuleType(key as "simple" | "link")
								}
								size="sm"
							>
								<Tab
									key="simple"
									title={
										<div className="flex items-center gap-2 px-1">
											<FileText size={16} />
											<span>Text Rule</span>
										</div>
									}
								/>
								<Tab
									key="link"
									title={
										<div className="flex items-center gap-2 px-1">
											<Link size={16} />
											<span>External Link</span>
										</div>
									}
								/>
							</Tabs>
						</div>

						<div className="p-4">
							{selectedRuleType === "simple" ? (
								<div className="space-y-4">
									<Textarea
										label="Add a rule"
										placeholder="Enter your competition rule here..."
										description="Describe the rule clearly and concisely"
										isDisabled={isSubmitting}
										minRows={3}
										maxRows={5}
										id="new-rule-text"
									/>
									<Button
										onPress={() => {
											const ruleText = (
												document.getElementById(
													"new-rule-text",
												) as HTMLTextAreaElement
											)?.value;
											if (ruleText) {
												appendRule({ rule: ruleText });
												(
													document.getElementById(
														"new-rule-text",
													) as HTMLTextAreaElement
												).value = "";
											}
										}}
										startContent={<Plus size={16} />}
										color="primary"
										className="w-full"
										isDisabled={isSubmitting}
									>
										Add Rule
									</Button>
								</div>
							) : (
								<div className="space-y-4">
									<Input
										label="Rule Link"
										placeholder="https://example.com/rules"
										description="Link to a document containing your competition rules"
										startContent={<LinkIcon />}
										isDisabled={isSubmitting}
										id="new-rule-link"
									/>
									<Button
										onPress={() => {
											const linkText = (
												document.getElementById(
													"new-rule-link",
												) as HTMLInputElement
											)?.value;
											if (linkText && isValidUrl(linkText)) {
												appendRule({ rule: linkText });
												(
													document.getElementById(
														"new-rule-link",
													) as HTMLInputElement
												).value = "";
											}
										}}
										startContent={<Plus size={16} />}
										color="primary"
										className="w-full"
										isDisabled={isSubmitting}
									>
										Add Link
									</Button>
								</div>
							)}
						</div>
					</Card>

					{/* List of rules */}
					{ruleFields.length > 0 && (
						<Card className="border border-primary/10">
							<div className="p-4">
								<h4 className="mb-4 font-medium">Current Rules</h4>
								<div className="space-y-3">
									{ruleFields.map((field, index) => (
										<div
											key={field.id}
											className="flex items-start gap-3 border-primary/5 border-b pb-3 last:border-0"
										>
											<div className="cursor-move pt-1 text-foreground/40">
												<GripVertical size={18} />
											</div>

											<Controller
												name={`rules.${index}.rule`}
												control={control}
												render={({ field, fieldState: { error } }) => (
													<div className="flex-1">
														<div className="flex items-start gap-2">
															<div className="flex-1">
																{isValidUrl(field.value) ? (
																	<div>
																		<Chip
																			startContent={<LinkIcon size={14} />}
																			variant="flat"
																			color="secondary"
																			size="sm"
																			className="mb-1"
																		>
																			External Link
																		</Chip>
																		<a
																			href={field.value}
																			target="_blank"
																			rel="noopener noreferrer"
																			className="block break-all text-primary hover:underline"
																		>
																			{field.value}
																		</a>
																	</div>
																) : (
																	<div className="whitespace-pre-wrap text-sm">
																		{field.value}
																	</div>
																)}
																{error && (
																	<div className="mt-1 text-danger text-xs">
																		{error.message}
																	</div>
																)}
															</div>

															<Tooltip content="Remove rule">
																<Button
																	variant="light"
																	isIconOnly
																	color="danger"
																	onPress={() => removeRule(index)}
																	isDisabled={isSubmitting}
																	size="sm"
																>
																	<Trash size={16} />
																</Button>
															</Tooltip>
														</div>
													</div>
												)}
											/>
										</div>
									))}
								</div>
							</div>
						</Card>
					)}
				</div>

				{/* Rulesets section */}
				{category?.category_id && (
					<div className="mt-6">
						<Divider className="my-4" />
						<h3 className="mb-4 font-semibold text-lg">Predefined Rulesets</h3>

						<Accordion>
							<AccordionItem
								key="rulesets"
								aria-label="Category Rulesets"
								title={
									<div className="flex items-center gap-2">
										<FileText size={18} />
										<span>Available Rulesets for {category.title}</span>
									</div>
								}
								subtitle="Select from predefined rulesets for this category"
								isDisabled={isSubmitting}
								classNames={{
									title: "text-lg",
								}}
							>
								<RulesetsSelection
									category_id={category.category_id.toString()}
								/>
							</AccordionItem>
						</Accordion>
					</div>
				)}
			</div>
		</div>
	);
};

export default RulesAndRulesetsForm;
