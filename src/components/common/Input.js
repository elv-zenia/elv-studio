import React from "react";

const Input = ({label, required, value, formName}) => {
  return (
    <>
      <label className="form__input-label" htmlFor={formName}>
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </label>
      <input
        type="text"
        name={formName}
        required={required}
        value={value}
      />
    </>
  );
};

export default Input;
