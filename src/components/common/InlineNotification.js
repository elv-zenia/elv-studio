import React, {useState} from "react";
import ImageIcon from "Components/common/ImageIcon";
import CloseIcon from "Assets/icons/close.svg";

const InlineNotification = ({
  title,
  message,
  subtext,
  type="error",
  hideCloseButton=false
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const HandleClose = () => {
    setIsOpen(false);
  };

  if(!isOpen) { return null; }

  return (
    <div className={`inline-notification inline-notification--${type}`}>
      <div className="inline-notification__main">
        {
          title &&
          <span className="inline-notification__main__title">{ title }</span>
        }
        { message }
        {
          !hideCloseButton &&
          <button
            type="button"
            title="Close notification"
            aria-label="Close notification"
            onClick={HandleClose}
            className="inline-notification__main__close-button"
          >
            <ImageIcon className="inline-notification__main__close-button__icon" icon={CloseIcon} />
          </button>
        }
      </div>
      <div className="inline-notification__subtext">{ subtext || "" }</div>
    </div>
  );
};

export default InlineNotification;
