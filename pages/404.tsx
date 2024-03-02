import { Box, Heading, Text } from "@chakra-ui/react";
// pages/404.tsx
import React from "react";

const NotFound: React.FC = () => {
	return (
		<Box textAlign="center" mt={10}>
			<Heading>404</Heading>
			<Text>Page not found</Text>
		</Box>
	);
};

export default NotFound;
