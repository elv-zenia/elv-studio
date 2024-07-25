import {useDropzone} from "react-dropzone";
import {ImageIcon as PictureIcon} from "@/assets/icons";

const Dropzone = ({accept, id, onDrop, disabled}) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    accept,
    onDrop,
    disabled
  });

  return (
    <section className={`dropzone${disabled ? " dropzone--disabled" : ""}`} id={id}>
      <div {...getRootProps({
        className: `dropzone__area${isDragActive ? " dropzone__area--active" : ""}`
      })}>
        <PictureIcon color="#565656" width={125} height={75} />
        <div className="dropzone__instructions">Drag and drop a file or click to upload</div>
        <input {...getInputProps()} />
      </div>
    </section>
  );
};

export default Dropzone;
