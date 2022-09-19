import React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

const ButtonMenu = ({trigger, items=[], onOpenChange}) => {
  const DropdownMenu = DropdownMenuPrimitive.Root;
  const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
  const DropdownMenuContent = DropdownMenuPrimitive.Content;
  const DropdownMenuItem = DropdownMenuPrimitive.DropdownMenuItem;
  const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

  return (
    <div className="button-menu">
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          { trigger }
        </DropdownMenuTrigger>

        <DropdownMenuContent className="button-menu__content" sideOffset={-5}>
          {items.map(({label, onClick, separator}) => {
            if(separator) { return <DropdownMenuSeparator className="button-menu__content__separator" />; }

            return (
              <DropdownMenuItem
                key={label}
                className="button-menu__content__item"
                onSelect={onClick}
              >
                {label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ButtonMenu;
