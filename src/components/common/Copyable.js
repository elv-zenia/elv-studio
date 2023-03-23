import React, {useState} from "react";
import CopyIcon from "Assets/icons/clipboard.svg";
import CheckmarkIcon from "Assets/icons/check.svg";
import Tooltip from "Components/common/Tooltip";
import {CopyToClipboard} from "react-copy-to-clipboard/lib/Component";

export const Copyable = ({copy, children, className}) => {
  const [copied, setCopied] = useState(false);

  return (
    <span className={`copyable ${className || ""}`}>
      {
        children &&
        <div className="copyable__text">{ children }</div>
      }
      <CopyToClipboard text={copy} onCopy={() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      }}>
        <Tooltip
          className="copyable__tooltip"
          message="Copied"
          open={copied}
          icon={copied ? CheckmarkIcon : CopyIcon}
          delayDuration={300}
          title="Copy to Clipboard"
        />
      </CopyToClipboard>
    </span>
  );
};
