import { Container } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { Link } from "@saas-ui/react";

export default function TeamsHome() {
  return (
    <Container maxW="150ch" centerContent pb={10}>
      <Link className="text-decoration-none" href="/teams/create">
        <Button>Create</Button>
      </Link>
    </Container>
  );
}
