import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import ImageIcon from "Components/common/ImageIcon";
import InfoIcon from "Assets/icons/circle-info.svg";

const Tooltip = ({open, icon, message, side="top", onClick, delayDuration, className=""}) => {
  const TooltipProvider = TooltipPrimitive.Provider;
  const TooltipRoot = TooltipPrimitive.Root;
  const TooltipTrigger = TooltipPrimitive.Trigger;
  const TooltipContent = TooltipPrimitive.Content;

  return (
    <div className={`tooltip ${className}`}>
      <TooltipProvider delayDuration={delayDuration}>
        <TooltipRoot open={open}>
          <TooltipTrigger asChild>
            <button
              className="tooltip__button"
              type="button"
              title="Copy to Clipboard"
              onClick={onClick}
            >
              <ImageIcon className="tooltip__icon" icon={icon || InfoIcon} />
            </button>
          </TooltipTrigger>
          <TooltipContent side={side} sideOffset={8}>
            <div className="tooltip__content">
              { message }
            </div>
          </TooltipContent>
        </TooltipRoot>
      </TooltipProvider>
    </div>
  );
};

export default Tooltip;
