import { Accordion, AccordionItem, Button, Input } from "@heroui/react";
import { Minus, Plus } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { useCategoryContext } from "~/contexts/CategoryContext";
import RulesetsSelection from "./RulesetsSelection";

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

	return (
		<div className="space-y-6">
			<div>
				{ruleFields.map((field, index) => (
					<div key={field.id} className="mt-4 flex items-center space-x-2">
						<Controller
							name={`rules.${index}.rule`}
							control={control}
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
										>
											<Minus />
										</Button>
									}
								/>
							)}
						/>
					</div>
				))}
				<Button
					className="mt-4"
					onPress={() => appendRule({ rule: "" })}
					isDisabled={isSubmitting}
					startContent={<Plus />}
				>
					Add Rule
				</Button>
			</div>
			{category?.category_id && (
				<Accordion>
					<AccordionItem
						key="1"
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

export default RulesAndRulesetsForm;
