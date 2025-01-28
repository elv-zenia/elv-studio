import {ActionIcon, Button, Flex, Text} from "@mantine/core";
import {CopyToClipboard} from "@/utils/helpers.js";
import {CheckmarkIcon, ClipboardIcon} from "@/assets/icons/index.jsx";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import styles from "./JobDetailsCard.module.css";

const LinkText = ({value, LinkCallback}) => {
  return (
    <Flex maw="100%">
      <Button
        variant="transparent"
        onClick={() => LinkCallback}
        pl={0}
      >
        <Text truncate="end">{ value }</Text>
      </Button>
    </Flex>
  );
};

const CopyText = ({value}) => {
  const [copied, setCopied] = useState(false);

  return (
    <Flex direction="row" align="center" gap={10} w="100%">
      <Text truncate="end">
        { value }
      </Text>
      <ActionIcon
        variant="transparent"
        onClick={() => {
          CopyToClipboard({text: value});
          setCopied(true);

          setTimeout(() => {
            setCopied(false);
          }, [3000]);
        }}
      >
        {
          copied ?
            <CheckmarkIcon /> : <ClipboardIcon />
        }
      </ActionIcon>
    </Flex>
  );
};

const PlainText = ({value}) => {
  return (
    <Text>{ value }</Text>
  );
};

const JobDetailsCard = observer(({
  label,
  value,
  secondary = false,
  type,
  LinkCallback
}) => {
  const TYPE_MAP = {
    "TEXT": <PlainText value={value} />,
    "LINK": <LinkText LinkCallback={LinkCallback} value={value} />,
    "COPY": <CopyText value={value} />
  };

  return (
    <Flex
      bd={secondary ? "1px solid var(--mantine-color-elv-gray-2)" : "none"}
      bg={secondary ? "transparent" : "var(--mantine-color-elv-gray-1)"}
      mb={16}
      p="1.5rem 1rem"
      w="100%"
      align="center"
      className={styles.card}
    >
      <Flex w="100%" gap={0} direction="column">
        <Text>{ label }</Text>
        { TYPE_MAP[type] }
      </Flex>
    </Flex>
  );
});

export default JobDetailsCard;
