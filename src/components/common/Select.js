import React from "react";

const Select = ({
  options,
  label,
  labelDescription,
  required,
  defaultOption={},
  formName
}) => {
  return (
    <>
      <label className="form__input-label" htmlFor={formName}>
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </label>
      <div className="form__input-description">{ labelDescription }</div>
      <select required={required} name={formName}>
        {
          "label" in defaultOption && "value" in defaultOption ?
            <option value={defaultOption.value}>{defaultOption.label}</option> : null
        }
        {
          options.map(({value, label}) => (
            <option value={value} key={value}>
              { label }
            </option>
          ))
        }
      </select>
    </>
  );
};

export default Select;
