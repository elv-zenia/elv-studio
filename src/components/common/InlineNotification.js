import React, {useState} from "react";
import ImageIcon from "Components/common/ImageIcon";
import CloseIcon from "Assets/icons/close.svg";

const InlineNotification = ({title, message, type="error"}) => {
  const [isOpen, setIsOpen] = useState(true);

  const HandleClose = () => {
    setIsOpen(false);
  };

  if(!isOpen) { return null; }

  return (
    <div className={`inline-notification inline-notification--${type}`}>
      <span className="inline-notification__title">{ title }</span>
      { message }
      <button
        type="button"
        title="Close notification"
        aria-label="Close notification"
        onClick={HandleClose}
        className="inline-notification__close-button"
      >
        <ImageIcon className="inline-notification__close-button__icon" icon={CloseIcon} />
      </button>
    </div>
  );
};

export default InlineNotification;
