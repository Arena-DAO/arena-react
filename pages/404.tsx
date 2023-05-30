// pages/404.tsx
import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

const NotFound: React.FC = () => {
  return (
    <Box textAlign="center" mt={10}>
      <Heading as="h1" size="2xl" mb={5}>
        404
      </Heading>
      <Text fontSize="xl">Page not found</Text>
    </Box>
  );
};

export default NotFound;
