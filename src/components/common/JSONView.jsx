import {ActionIcon, Box, Code} from "@mantine/core";
import {CopyToClipboard} from "@/utils/helpers.js";
import {CheckmarkIcon, ClipboardIcon} from "@/assets/icons/index.jsx";
import {useState} from "react";

const JSONView = ({json, copyable=false}) => {
  const [copied, setCopied] = useState(false);

  return (
    <Box
      pos="relative"
    >
      <Code block>
        <Box
          mih="1.5rem"
          p="0.5rem 2.75rem 0.5rem 1rem"
          m="1rem 0"
        >
          { json }
        </Box>
          {
            copyable &&
            (
              <ActionIcon
                variant="transparent"
                pos="absolute"
                right="0.5rem"
                top="0.5rem"
                onClick={() => {
                  CopyToClipboard({text: json});
                  setCopied(true);

                  setTimeout(() => {
                    setCopied(false);
                  }, [3000]);
                }}
              >
                {
                  copied ?
                    <CheckmarkIcon width={14} /> : <ClipboardIcon />
                }
              </ActionIcon>
            )
          }
      </Code>
    </Box>
  );
};

export default JSONView;
