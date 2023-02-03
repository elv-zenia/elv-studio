import React from "react";
import {observer} from "mobx-react";
import Dialog from "Components/common/Dialog";
import {ingestStore} from "Stores";

const WarningDialog = observer(() => {
  return (
    <Dialog
      title={ingestStore.dialog.title}
      description={ingestStore.dialog.description}
      open={ingestStore.showDialog}
      onOpenChange={() => {}}
      ConfirmCallback={() => ingestStore.HideWarningDialog("YES")}
      confirmText="Yes"
      CancelCallback={() => ingestStore.HideWarningDialog("NO")}
      cancelText="No"
      Cancel
    />
  );
});

export default WarningDialog;
