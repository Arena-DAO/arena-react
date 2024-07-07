import { Button, Input, Tooltip } from "@nextui-org/react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { FiInfo, FiMinus, FiPlus } from "react-icons/fi";
import { useCategoryContext } from "~/contexts/CategoryContext";
import RulesetsSelection from "./RulesetsSelection";

const RulesAndRulesetsForm = () => {
	const { control } = useFormContext();
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
				<h3 className="mb-2 flex items-center font-semibold text-lg">
					Rules
					<Tooltip content="You can enter a text rule or paste a link to an external document">
						<span className="ml-2 cursor-help">
							<FiInfo />
						</span>
					</Tooltip>
				</h3>
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
									endContent={
										<Button
											variant="faded"
											isIconOnly
											className="my-auto"
											onClick={() => removeRule(index)}
										>
											<FiMinus />
										</Button>
									}
								/>
							)}
						/>
					</div>
				))}
				<Button
					className="mt-4"
					onClick={() => appendRule({ rule: "" })}
					startContent={<FiPlus />}
				>
					Add Rule
				</Button>
			</div>
			{category?.category_id && (
				<div>
					<h3 className="mb-2 flex items-center font-semibold text-lg">
						Rulesets
						<Tooltip content="Select predefined rulesets for this category">
							<span className="ml-2 cursor-help">
								<FiInfo />
							</span>
						</Tooltip>
					</h3>
					<RulesetsSelection category_id={category.category_id.toString()} />
				</div>
			)}
		</div>
	);
};

export default RulesAndRulesetsForm;
