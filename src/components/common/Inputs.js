import React, {useEffect, useState} from "react";
import {ParseInputJson} from "Utils/Input";

export const Select = ({
  options,
  label,
  labelDescription,
  required,
  defaultOption={},
  formName,
  onChange
}) => {
  return (
    <>
      <label className="form__input-label" htmlFor={formName}>
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </label>
      <div className="form__input-description">{ labelDescription }</div>
      <select
        required={required}
        name={formName}
        onChange={onChange}
      >
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

export const Input = ({
  label,
  required,
  value,
  formName,
  onChange
}) => {
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
        value={value || ""}
        onChange={onChange}
      />
    </>
  );
};

export const TextArea = ({
  label,
  required,
  formName,
  onChange,
  value
}) => {
  return (
    <>
      <label className="form__input-label" htmlFor={formName}>
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </label>
      <textarea
        name={formName}
        required={required}
        onChange={onChange}
        value={value || ""}
      />
    </>
  );
};

export const JsonTextArea = ({
  formName,
  value,
  onChange,
  label,
  labelDescription,
  required
}) => {
  const [modifiedJSON, setModifiedJSON] = useState(value);
  const [error, setError] = useState();

  useEffect(() => {
    setModifiedJSON(value);
  }, [value]);

  const HandleChange = event => {
    try {
      const json = JSON.stringify(ParseInputJson(modifiedJSON), null, 2);
      setModifiedJSON(json);

      event.target.value = json;

      setError(undefined);
    } catch(error) {
      setError(error.message);
    }

    onChange(event);
  };

  return (
    <>
      <label htmlFor={formName} className="form__input-label">
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </label>
      <div className="form__input-description">{ labelDescription }</div>
      <textarea
        name={formName}
        value={modifiedJSON || ""}
        title={error}
        aria-errormessage={error}
        onChange={event => setModifiedJSON(event.target.value)}
        onBlur={HandleChange}
        className="form__json-field"
      />
    </>
  );
};

export const Checkbox = ({label, formName, value, checked, onChange}) => {
  return (
    <div className="form__checkbox-container">
      <label htmlFor={formName} className="form__input-label">{ label }</label>
      <input
        name={formName}
        type="checkbox"
        value={value || ""}
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
};
