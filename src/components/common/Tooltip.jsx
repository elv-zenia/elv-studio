import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {CircleInfoIcon as InfoIcon} from "@/assets/icons";

const Tooltip = ({
  open,
  Icon,
  message,
  side="top",
  onClick,
  delayDuration,
  className="",
  title="",
  sideOffset=8,
  align="center",
  alignOffest=0,
  maxWidth="100%"
}) => {
  const TooltipProvider = TooltipPrimitive.Provider;
  const TooltipRoot = TooltipPrimitive.Root;
  const TooltipPortal = TooltipPrimitive.Portal;
  const TooltipTrigger = TooltipPrimitive.Trigger;
  const TooltipContent = TooltipPrimitive.Content;
  const TooltipArrow = TooltipPrimitive.Arrow;

  const iconProps = {
    height: 16,
    width: 16,
    color: "#404040"
  }

  return (
    <div className={`tooltip ${className}`}>
      <TooltipProvider delayDuration={delayDuration}>
        <TooltipRoot open={open}>
          <TooltipTrigger asChild>
            <button
              className="tooltip__button"
              type="button"
              title={title}
              onClick={onClick}
            >
              {
                Icon ? <Icon {...iconProps} /> : <InfoIcon {...iconProps} />
              }
            </button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              side={side}
              sideOffset={sideOffset}
              align={align}
              style={{maxWidth: maxWidth}}
              alignOffset={alignOffest}
            >
              <div className="tooltip__content">
                { message }
                <TooltipArrow className="tooltip__arrow" />
              </div>
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>
      </TooltipProvider>
    </div>
  );
};

export default Tooltip;
