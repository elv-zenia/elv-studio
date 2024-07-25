import {useState} from "react";
import {CloseIcon} from "@/assets/icons";

const InlineNotification = ({
  title,
  message,
  subtext,
  type="error",
  hideCloseButton=false,
  actionText,
  ActionCallback
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const HandleClose = () => {
    setIsOpen(false);
  };

  if(!isOpen) { return null; }

  const CloseButton = () => {
    if(hideCloseButton) { return null; }

    return (
      <button
        type="button"
        title="Close notification"
        aria-label="Close notification"
        onClick={HandleClose}
        className="inline-notification__main__right-container__close-button"
      >
        <CloseIcon />
        {/*<ImageIcon className="inline-notification__main__right-container__close-button__icon" icon={CloseIcon} />*/}
      </button>
    );
  };

  return (
    <div className={`inline-notification inline-notification--${type}`}>
      <div className="inline-notification__main">
        {
          title &&
        <span className="inline-notification__main__title">{ title }</span>
        }

        { message }
        <div className="inline-notification__main__right-container">
          {
            actionText && ActionCallback &&
            <button className="inline-notification__main__right-container__action" onClick={ActionCallback}>
              { actionText }
            </button>
          }
          { CloseButton() }
        </div>
      </div>
      <div className="inline-notification__subtext">
        { subtext || "" }
      </div>
    </div>
  );
};

export default InlineNotification;
