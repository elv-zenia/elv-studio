import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

const dialogSizes = {
  "XS": "xs",
  "SM": "sm",
  "MD": "md",
  "LG": "lg"
};

const Dialog = ({
  trigger,
  title,
  description,
  ConfirmCallback,
  CancelCallback,
  confirmText="Confirm",
  cancelText="Cancel",
  hideCancelButton=false,
  open,
  onOpenChange,
  children,
  size="SM"
}) => {
  const Dialog = DialogPrimitive.Root;
  const DialogTrigger = DialogPrimitive.Trigger;
  const DialogOverlay = DialogPrimitive.Overlay;
  const DialogContent = DialogPrimitive.Content;
  const DialogTitle = DialogPrimitive.Title;
  const DialogDescription = DialogPrimitive.Description;
  const DialogClose = DialogPrimitive.Close;

  return (
    <div className="dialog">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{ trigger }</DialogTrigger>
        <DialogOverlay className="dialog__overlay">
          <DialogContent className={`dialog__content dialog__content--${dialogSizes[size]}`}>
            <DialogTitle className="dialog__content__body__title">{ title }</DialogTitle>
            <div className="dialog__content__body">
              {
                description &&
                <DialogDescription>{ description }</DialogDescription>
              }
              { children }
            </div>
            <div className="dialog__actions">
              {
                !hideCancelButton &&
                <DialogClose asChild>
                  <button type="button" className="secondary-button" onClick={CancelCallback}>
                    { cancelText }
                  </button>
                </DialogClose>
              }
              <DialogClose asChild>
                <button type="button" className="primary-button" onClick={ConfirmCallback}>
                  { confirmText }
                </button>
              </DialogClose>
            </div>
          </DialogContent>
        </DialogOverlay>
      </Dialog>
    </div>
  );
};

export default Dialog;
