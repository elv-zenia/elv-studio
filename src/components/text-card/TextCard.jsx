import {Box, Flex, Stack, Text} from "@mantine/core";

const TextCard = ({title, message, rightSection}) => {
  return (
    <Box
      bg="elv-gray.0"
      mb={16}
      p="1.5rem 1rem"
      style={{borderRadius: "7px"}}
    >
      <Flex align="center" direction="row">
        <Stack gap={0}>
          {
            title &&
            <Text>{ title }</Text>
          }
          {
            message &&
            <Text pt={4}>
              { message }
            </Text>
          }
        </Stack>
        {
          rightSection &&
          <Box ml="auto">
            { rightSection }
          </Box>
        }
      </Flex>
    </Box>
  );
};

export default TextCard;
