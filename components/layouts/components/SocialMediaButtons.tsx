import { Flex } from "@chakra-ui/layout";
import { IconButton } from "@chakra-ui/react";
import { BsTwitter, BsDiscord, BsGithub } from "react-icons/bs";

export default function SocialMediaButtons() {
  return (
    <Flex justifyContent="center" mt="auto !important">
      <IconButton
        as="a"
        href="https://twitter.com/ArenaDAO"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitter"
        variant="outline"
        icon={<BsTwitter />}
        colorScheme="primary"
        mx={2}
      />
      <IconButton
        as="a"
        href="https://discord.gg/ECmVAFvuuR"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discord"
        variant="outline"
        icon={<BsDiscord />}
        colorScheme="primary"
        mx={2}
      />
      <IconButton
        as="a"
        href="https://github.com/Arena-DAO"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        variant="outline"
        icon={<BsGithub />}
        colorScheme="primary"
        mx={2}
      />
    </Flex>
  );
}
