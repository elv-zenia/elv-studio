import React from "react";

const TextArea = ({label, required, formName}) => {
  return (
    <>
      <label className="form__input-label" htmlFor={formName}>
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </label>
      <textarea name={formName} required={required} />
    </>
  );
};

export default TextArea;
