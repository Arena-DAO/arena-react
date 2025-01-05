import { Spacer } from "@nextui-org/react";
import type React from "react";
import { useCategoryContext } from "~/contexts/CategoryContext";

const CategoryDisplay: React.FC = () => {
	const category = useCategoryContext();

	if (!category) return <Spacer />;

	return (
		<span>
			<span className="font-semibold">Category:</span> {category.title}
		</span>
	);
};

export default CategoryDisplay;
