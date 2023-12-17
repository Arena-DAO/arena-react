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
  useBreakpointValue,
  Link,
} from "@chakra-ui/react";
import Chart from "react-google-charts";
import {
  BsBookmarkFill,
  BsBuildingFill,
  BsCalendarEventFill,
  BsChatFill,
  BsCheck2All,
  BsClockFill,
  BsCollectionFill,
  BsCollectionPlayFill,
  BsCurrencyBitcoin,
  BsHddNetworkFill,
  BsLightningFill,
  BsLockFill,
  BsPeopleFill,
  BsPersonFill,
  BsPersonFillLock,
  BsPersonRolodex,
  BsShieldFillCheck,
  BsTable,
} from "react-icons/bs";
import { IconType } from "react-icons/lib";
import NextLink from "next/link";
import env from "@config/env";

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
  return (
    <Container maxW="container.xl" pb={12}>
      <Stack gap={10}>
        <Box textAlign="center">
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
        <Image
          src="/future_of_competition.png"
          alt="The future of competition"
          className="trophy_cursor"
          borderRadius="lg"
          alignSelf="center"
          w={{ base: "100%", md: "90%", lg: "85%", xl: "75%" }}
        />
        <Box>
          <Link as={NextLink} href="#about">
            <Heading size="xl" id="about">
              <chakra.span color="secondary.400">#</chakra.span> About Us
            </Heading>
          </Link>
          <Stack
            mt="6"
            spacing={8}
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))"
            gap={6}
          >
            <Feature
              title="Trustless Competitions"
              icon={BsShieldFillCheck}
              description="Our platform offers a robust, trust-minimized escrow solution. When conflicts or indecision arise, the Arena DAO can step in to ensure fair and transparent outcomes through decentralized governance."
            />
            <Feature
              title="Infrastructure"
              icon={BsBuildingFill}
              description="We provide the infrastructure necessary for hosting different types of competitions like wagers, leagues, and eventually tournaments. These can happen in any type of token standard (cw20, cw721, or native)."
            />
            <Feature
              title="Built-in Security"
              icon={BsLockFill}
              description="Unlike traditional competition services, the Arena DAO does not utilize a centralized credit-system with unknown security risks. We use smart contracts to efficiently move money while inheriting the network's security."
            />
            <Feature
              title="DAO as a Service"
              icon={BsLightningFill}
              description="The Arena DAO is more than just a decentralized autonomous organization. It's a DAO as a service. They compete, and we mediate. With each competition within the Arena ecosystem, we earn a percentage of the distributed amount."
            />
          </Stack>
        </Box>
        <Box>
          <Link as={NextLink} href="#initial_token_distribution">
            <Heading size="xl" id="initial_token_distribution">
              <chakra.span color="secondary.400">#</chakra.span> Initial Token
              Distribution
            </Heading>
          </Link>
          <Text as="em">(tentative)</Text>
          <Chart
            chartType="PieChart"
            data={[
              ["Group", "Percentage"],
              ["Founder (vested)", 30],
              ["x/drip (airdrop)", 5],
              ["Liquidity Bootstrapping", 25],
              ["Community Pool", 30],
              ["Liquidity Incentives", 5],
              ["SubDAO's", 5],
            ]}
            options={{
              backgroundColor: "transparent",
              legend: {
                textStyle: {
                  color: useColorModeValue("black", "white"),
                },
                position: useBreakpointValue({
                  base: "none",
                  sm: "bottom",
                  md: "labeled",
                }),
              },
            }}
            width={"100%"}
            height={"400px"}
          />
        </Box>
        <Box>
          <Link as={NextLink} href="#arena_core">
            <Heading size="xl" id="arena_core">
              <chakra.span color="secondary.400">#</chakra.span> Arena Core
            </Heading>
          </Link>
          <Stack
            mt="6"
            spacing={8}
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))"
            gap={6}
          >
            <Feature
              title="Proposals"
              icon={BsChatFill}
              description="The Arena Core is a custom proposal module attached to the Arena DAO which will allow competitions to ask for mediation without requiring a stake in the DAO."
            />
            <Feature
              title="Tax"
              icon={BsCurrencyBitcoin}
              description={`We also store relevant competition data here like the competition tax. The current rate is set to ${env.ARENA_TAX}%, and this is a field which can be adjusted through a governance proposal. Each processed competition will automatically send the tax to the DAO's treasury.`}
            />

            <Feature
              title="Rulesets"
              icon={BsBookmarkFill}
              description="To avoid constantly applying the same rules when creating competitions. The community can decide upon common sets of rules to be available on creation."
            />
            <Feature
              title="Competition Modules"
              icon={BsHddNetworkFill}
              description="Through competition modules, we are able to handle any type of programmable competition. Currently, the Arena DAO supports wagers and round-robin leagues."
            />
          </Stack>
        </Box>
        <Box>
          <Link as={NextLink} href="#escrow">
            <Heading size="xl" id="escrow">
              <chakra.span color="secondary.400">#</chakra.span> Escrows
            </Heading>
          </Link>
          <Stack
            mt="6"
            spacing={8}
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))"
            gap={6}
          >
            <Feature
              title="Event-Based"
              icon={BsCalendarEventFill}
              description="The escrow will automatically lock itself when all dues are received and send an activation message to its respective competition. On competition processing, the funds will be automatically sent to all users."
            />
            <Feature
              title="Preset Distribution"
              icon={BsPersonRolodex}
              description="An escrow member can decide to automatically distribute its receiving shares according to a preset distribution. For a team, this can be useful to reduce friction in payouts."
            />
          </Stack>
        </Box>
        <Box>
          <Link as={NextLink} href="#wagers">
            <Heading size="xl" id="wagers">
              <chakra.span color="secondary.400">#</chakra.span> Wagers
            </Heading>
          </Link>
          <Stack
            mt="6"
            spacing={8}
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))"
            gap={6}
          >
            <Feature
              title="Custom Membership"
              icon={BsPeopleFill}
              description="The wager module allows users to create a wager with any amount of members. A member can be a sole user or a team defined on-chain by a DAO. 4-player chess just became a whole lot more interesting."
            />
            <Feature
              title="All or Nothing"
              icon={BsCheck2All}
              description="Creating a wager will also create a new DAO consisting of each member of the competition. All members of this DAO must agree to the competition result, otherwise the wager will be jailed for the Arena DAO to process."
            />
          </Stack>
        </Box>
        <Box>
          <Link as={NextLink} href="#leagues">
            <Heading size="xl" id="leagues">
              <chakra.span color="secondary.400">#</chakra.span> Leagues
            </Heading>
          </Link>
          <Stack
            mt="6"
            spacing={8}
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))"
            gap={6}
          >
            <Feature
              title="Round-Robin Format"
              icon={BsClockFill}
              description="Leagues follow the round-robin format. Each member will play each other member once to build up their ranking."
            />
            <Feature
              title="Host"
              icon={BsPersonFill}
              description="Unlike wagers, we cannot expect each member to vote for each match of the league. A league requires a host that is responsible for quickly deciding on match winners and processing the final result."
            />
            <Feature
              title="Leaderboard"
              icon={BsTable}
              description="Each match within the league will build up the users' scores. After the last round is played, a decision can be voted on based off of the leaderboard standings."
            />
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
