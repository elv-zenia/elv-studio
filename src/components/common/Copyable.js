import React, {useState} from "react";
import {CopyText} from "Utils/Clipboard";
import CopyIcon from "Assets/icons/clipboard.svg";
import CheckmarkIcon from "Assets/icons/check.svg";
import Tooltip from "Components/common/Tooltip";

export const Copyable = ({copy, children, className}) => {
  const [copied, setCopied] = useState(false);

  return (
    <span className={`copyable ${className || ""}`}>
      { children }
      <Tooltip
        message="Copied"
        open={copied}
        icon={copied ? CheckmarkIcon : CopyIcon}
        delayDuration={300}
        onClick={() => {
          CopyText(copy);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 3000);
        }}
      />
    </span>
  );
};
