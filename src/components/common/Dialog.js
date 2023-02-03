import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

const Dialog = ({
  trigger,
  title,
  description,
  ConfirmCallback,
  CancelCallback,
  confirmText="Confirm",
  cancelText="Cancel",
  open,
  onOpenChange
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
          <DialogContent className="dialog__content">
            <DialogTitle>{ title }</DialogTitle>
            <DialogDescription>{ description }</DialogDescription>
            <div className="dialog__actions">
              <DialogClose asChild>
                <button type="button" className="secondary-button" onClick={CancelCallback}>
                  { cancelText }
                </button>
              </DialogClose>
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
