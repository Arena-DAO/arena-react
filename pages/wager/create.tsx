import { Container, Heading } from "@chakra-ui/layout";

const CreateWagerPage = () => {
  return (
    <Container
      maxW={{ base: "100%", md: "75%", lg: "60%" }}
      centerContent
      pb={10}
    >
      <Heading
        as="h1"
        fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
        fontWeight="extrabold"
        mb={3}
      >
        Create a Wager
      </Heading>
    </Container>
  );
};

export default CreateWagerPage;
