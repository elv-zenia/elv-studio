import React, {useEffect, useState} from "react";
import {ParseInputJson} from "Utils/Input";

export const Select = ({
  options,
  label,
  labelDescription,
  required,
  defaultOption={},
  formName,
  onChange,
  disabled
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
        disabled={disabled}
      >
        {
          "label" in defaultOption && "value" in defaultOption ?
            <option value={defaultOption.value}>{defaultOption.label}</option> : null
        }
        {
          options.map(({value, label, disabled}) => (
            <option value={value} key={value} disabled={disabled}>
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
  onChange,
  placeholder,
  type="text",
  disabled,
  hidden
}) => {
  return (
    <>
      <label className={`form__input-label${disabled ? " form__input-label--disabled" : ""}`} htmlFor={formName}>
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </label>
      <input
        type={type}
        name={formName}
        required={required}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        hidden={hidden}
      />
    </>
  );
};

export const TextArea = ({
  label,
  required,
  formName,
  onChange,
  value,
  disabled
}) => {
  return (
    <>
      <label className={`form__input-label${disabled ? " form__input-label--disabled" : ""}`} htmlFor={formName}>
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </label>
      <textarea
        name={formName}
        required={required}
        onChange={onChange}
        value={value || ""}
        disabled={disabled}
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
      const json = JSON.stringify(ParseInputJson({metadata: modifiedJSON}), null, 2);
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
        className={`form__json-field${error ? " form__json-field--invalid" : ""}`}
      />
    </>
  );
};

export const Checkbox = ({
  label,
  formName,
  value,
  checked,
  onChange,
  disabled
}) => {
  return (
    <div className="form__checkbox-container">
      <label htmlFor={formName} className={`form__input-label${disabled ? " form__input-label--disabled" : ""}`}>{ label }</label>
      <input
        name={formName}
        type="checkbox"
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

export const Radio = ({label, formName, required, options=[]}) => {
  return (
    <div className="form__radio-container">
      <p className="form__input-label">
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </p>
      {
        options.map(({optionLabel, id, value, checked, onChange}) => (
          <div key={`radio-option-${id}`}>
            <input
              name={formName}
              id={id}
              type="radio"
              value={value}
              checked={checked}
              onChange={onChange}
            />
            <label htmlFor={id}>
              { optionLabel }
            </label>
          </div>
        ))
      }
    </div>
  );
};
