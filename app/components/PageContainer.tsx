import type { PropsWithChildren } from "react";

interface PageContainerProps extends PropsWithChildren {
	className?: string;
}

const PageContainer = ({ children, className = "" }: PageContainerProps) => {
	return <div className={`px-4 py-6 sm:px-6 lg:px-8 xl:px-12 ${className}`}>{children}</div>;
};

export default PageContainer;
