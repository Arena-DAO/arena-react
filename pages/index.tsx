import {
  Box,
  Heading,
  Container,
  Flex,
  Icon,
  chakra,
  Stack,
  useColorModeValue,
  Text,
  Image,
} from "@chakra-ui/react";
import {
  BsChatFill,
  BsCurrencyBitcoin,
  BsLightningFill,
  BsShieldFillCheck,
} from "react-icons/bs";
import { IconType } from "react-icons/lib";

interface FeatureProps {
  icon: IconType;
  title: string;
  description: string;
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <Flex alignItems="start" flexDirection="row">
      <Icon as={icon} w={6} h={6} color="secondary.400" />
      <Box ml={4}>
        <Text fontWeight="semibold" fontSize="lg">
          {title}
        </Text>
        <Text mt={2} color={useColorModeValue("gray.700", "gray.300")}>
          {description}
        </Text>
      </Box>
    </Flex>
  );
}

export default function Home() {
  const trophy_cursor = encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 100 100" style="fill:black;font-size:24px;"><text y="50%">🏆</text></svg>'
  );
  return (
    <Container maxW="container.xl" pb={12}>
      <Box textAlign="center" mb={10}>
        <Heading
          as="h1"
          fontSize={{ base: "3xl", sm: "4xl", md: "6xl" }}
          fontWeight="extrabold"
          lineHeight="1.2"
        >
          Welcome to the future of{" "}
          <chakra.span color="secondary.400">competition</chakra.span>!
        </Heading>
      </Box>
      <Stack
        spacing={8}
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))"
        gap={6}
        mb={6}
      >
        <Feature
          title="Secure and Transparent Escrows"
          icon={BsShieldFillCheck}
          description="Our platform offers a robust, trust-minimized escrow solution. When conflicts arise, the Arena DAO intervenes, ensuring fair and transparent outcomes through decentralized governance. "
        />
        <Feature
          title="Dynamic Community Engagement"
          icon={BsChatFill}
          description="Arena DAO promotes interaction, lowering competition barriers, fostering engagement, and offering diverse community opportunities."
        />
        <Feature
          title="Cost-Efficient Transactions"
          icon={BsCurrencyBitcoin}
          description="Leverage the advantages of the Juno network with Arena DAO. Our platform offers significantly reduced transaction fees, making it economical for users to engage in competitions and related activities."
        />
        <Feature
          title="Rewarding Participation"
          icon={BsLightningFill}
          description="Arena DAO acknowledges and rewards its active members with a portion of the protocol revenue. This incentive-driven model motivates users to contribute actively, nurturing a lively ecosystem that benefits every participant."
        />
      </Stack>
      <Image
        src="/future_of_competition.png"
        alt="The future of competition"
        className="hover_trophy"
        borderRadius="lg"
      />
    </Container>
  );
}
