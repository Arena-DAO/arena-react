"use client";

import { Accordion, AccordionItem, Button, Input } from "@heroui/react";
import { Trash, Plus } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { useCategoryContext } from "~/contexts/CategoryContext";
import RulesetsSelection from "./RulesetsSelection";
import React, { useCallback } from "react";

interface RuleInputProps {
	index: number;
	removeRule: (index: number) => void;
	isSubmitting: boolean;
}

const RuleInput: React.FC<RuleInputProps> = ({
	index,
	removeRule,
	isSubmitting,
}) => {
	return (
		<Controller
			name={`rules.${index}.rule`}
			render={({ field, fieldState: { error } }) => (
				<Input
					{...field}
					label={`Rule ${index + 1}`}
					placeholder="Enter rule or paste a link"
					isInvalid={!!error}
					errorMessage={error?.message}
					isRequired
					isDisabled={isSubmitting}
					endContent={
						<Button
							variant="faded"
							isIconOnly
							className="my-auto"
							isDisabled={isSubmitting}
							onPress={() => removeRule(index)}
							aria-label={`Remove rule ${index + 1}`}
						>
							<Trash />
						</Button>
					}
				/>
			)}
		/>
	);
};

const RulesAndRulesetsForm = () => {
	const {
		control,
		formState: { isSubmitting },
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

	const handleAddRule = useCallback(() => {
		appendRule({ rule: "" });
	}, [appendRule]);

	const handleRemoveRule = useCallback(
		(index: number) => {
			removeRule(index);
		},
		[removeRule],
	);

	return (
		<div className="space-y-6">
			<div>
				{ruleFields.map((field, index) => (
					<div key={field.id} className="mt-4 flex items-center space-x-2">
						<RuleInput
							index={index}
							removeRule={handleRemoveRule}
							isSubmitting={isSubmitting}
						/>
					</div>
				))}
				<Button
					className="mt-4"
					onPress={handleAddRule}
					isDisabled={isSubmitting}
					startContent={<Plus />}
					aria-label="Add Rule"
				>
					Add Rule
				</Button>
			</div>
			{category?.category_id && (
				<Accordion>
					<AccordionItem
						key="rulesets"
						aria-label="Rulesets"
						title="Rulesets"
						isDisabled={isSubmitting}
					>
						<RulesetsSelection category_id={category.category_id.toString()} />
					</AccordionItem>
				</Accordion>
			)}
		</div>
	);
};

export default React.memo(RulesAndRulesetsForm);
