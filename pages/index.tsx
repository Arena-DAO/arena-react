import {
  Box,
  Heading,
  Container,
  Flex,
  Icon,
  chakra,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  BsChatFill,
  BsCurrencyBitcoin,
  BsLightningFill,
  BsShieldFillCheck,
} from "react-icons/bs";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <Flex>
      <Flex shrink={0}>
        <Flex
          alignItems="center"
          justifyContent="center"
          h={12}
          w={12}
          rounded="md"
          bg="brand.500"
        >
          <Icon
            boxSize={6}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {icon}
          </Icon>
        </Flex>
      </Flex>
      <Box ml={4}>
        <chakra.dt
          fontSize="lg"
          fontWeight="bold"
          lineHeight="6"
          color={useColorModeValue("secondary.600", "secondary.400")}
        >
          {title}
        </chakra.dt>
        <chakra.dd mt={2}>{description}</chakra.dd>
      </Box>
    </Flex>
  );
}
export default function Home() {
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
        Welcome to the future of&nbsp;
        <Box
          as="span"
          color={useColorModeValue("secondary.600", "secondary.400")}
        >
          competition
        </Box>
        !
      </Heading>
      <Box mt={10}>
        <Stack
          spacing={{
            base: 10,
            md: 0,
          }}
          display={{
            md: "grid",
          }}
          gridTemplateColumns={{
            md: "repeat(2,1fr)",
          }}
          gridColumnGap={{
            md: 8,
          }}
          gridRowGap={{
            md: 10,
          }}
        >
          <Feature
            title="Trustless Escrow Management"
            icon={<BsShieldFillCheck />}
            description="If an escrow resolution cannot be reached, we guarantee a trustless
            solution through the Arena DAO. The Arena DAO is a decentralized
            autonomous organization that governs the platform and ensures its
            integrity. It empowers the community to make decisions collectively,
            leading to a fair and transparent outcome."
          />

          <Feature
            title="Enhanced Community Interaction"
            icon={<BsChatFill />}
            description="By lowering the barriers of entry for competitions, Arena DAO fosters greater interaction among members and supports a thriving ecosystem. This leads to increased engagement and diverse opportunities within the community."
          />

          <Feature
            title="Low Fees"
            icon={<BsCurrencyBitcoin />}
            description="Operating on the Juno network, Arena DAO benefits from lower transaction fees compared to other blockchain networks. This makes it more accessible and affordable for users to participate in competitions and activities."
          />

          <Feature
            title="Incentivized Participation"
            icon={<BsLightningFill />}
            description="Arena DAO rewards active community members with a share of the protocol revenue. This incentivized participation system encourages users to contribute to the platform and engage in competitions, leading to a more vibrant and dynamic ecosystem that benefits everyone involved."
          />
        </Stack>
      </Box>
    </Container>
  );
}
