import React from "react";
import {useDropzone} from "react-dropzone";

import ImageIcon from "Components/common/ImageIcon";
import PictureIcon from "Assets/icons/image.svg";

const Dropzone = ({accept, id, OnDrop}) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    accept,
    onDrop: OnDrop
  });

  return (
    <section className="dropzone" id={id}>
      <div {...getRootProps({
        className: `dropzone__area${isDragActive ? " dropzone__area--active" : ""}`
      })}>
        <ImageIcon
          className="dropzone__icon"
          icon={PictureIcon}
        />
        <div className="dropzone__instructions">Drag and drop a file or click to upload</div>
        <input {...getInputProps()} />
      </div>
    </section>
  );
};

export default Dropzone;
