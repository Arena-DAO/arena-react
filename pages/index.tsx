import {
  Box,
  Heading,
  Container,
  Flex,
  Icon,
  chakra,
  Stack,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { BsCurrencyBitcoin, BsLightningFill } from "react-icons/bs";
import { FaBalanceScale } from "react-icons/fa";

interface FeatureProps extends PropsWithChildren {
  icon: JSX.Element;
  title: string;
}
function Feature(props: FeatureProps) {
  return (
    <Flex>
      <Flex shrink={0}>
        <Flex
          alignItems="center"
          justifyContent="center"
          h={12}
          w={12}
          rounded="md"
          _light={{
            bg: "brand.500",
          }}
        >
          <Icon
            boxSize={6}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {props.icon}
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
          {props.title}
        </chakra.dt>
        <chakra.dd mt={2}>{props.children}</chakra.dd>
      </Box>
    </Flex>
  );
}

export default function Home() {
  return (
    <Container maxW="5xl" pb={10}>
      <Heading
        as="h1"
        className="holographic"
        fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
        fontWeight="extrabold"
        mb={3}
        textAlign="center"
      >
        Welcome to the future of{" "}
        <Box
          as="span"
          color={useColorModeValue("secondary.600", "secondary.400")}
        >
          competition
        </Box>
        !
      </Heading>
      <Image
        mx="auto"
        py="3"
        src="/main_trophy.jpg"
        alt=""
        maxW={{ md: "75%", lg: "60%" }}
      />
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
          <Feature title="Decentralized Trust" icon={<FaBalanceScale />}>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores
            impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis
            ratione.
          </Feature>

          <Feature title="Minimized Risk" icon={<FaBalanceScale />}>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores
            impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis
            ratione.
          </Feature>

          <Feature title="Low Fees" icon={<BsCurrencyBitcoin />}>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores
            impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis
            ratione.
          </Feature>

          <Feature title="Next Generation" icon={<BsLightningFill />}>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores
            impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis
            ratione.
          </Feature>
        </Stack>
      </Box>
    </Container>
  );
}
