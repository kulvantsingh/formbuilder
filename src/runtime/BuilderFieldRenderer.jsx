import React from "react";

function buildGridItemStyle(pos) {
  if (!pos) return {};
  const style = {};
  if (pos.colStart && pos.colStart !== "auto") {
    style.gridColumn = `${pos.colStart} / ${pos.colEnd || pos.colStart + 1}`;
  }
  if (pos.rowStart && pos.rowStart !== "auto") {
    style.gridRow = `${pos.rowStart} / ${pos.rowEnd || pos.rowStart + 1}`;
  }
  return style;
}

function buildRules(field) {
  const validation = field.validation || {};
  const messages = validation.messages || {};
  const rules = {};

  if (validation.required) {
    rules.required = messages.required || `${field.label?.text || "This field"} is required`;
  }
  if (validation.minLength !== undefined) {
    rules.minLength = {
      value: validation.minLength,
      message: messages.minLength || `Minimum length is ${validation.minLength}`,
    };
  }
  if (validation.maxLength !== undefined) {
    rules.maxLength = {
      value: validation.maxLength,
      message: messages.maxLength || `Maximum length is ${validation.maxLength}`,
    };
  }
  if (validation.min !== undefined) {
    rules.min = {
      value: validation.min,
      message: messages.min || `Minimum value is ${validation.min}`,
    };
  }
  if (validation.max !== undefined) {
    rules.max = {
      value: validation.max,
      message: messages.max || `Maximum value is ${validation.max}`,
    };
  }

  return rules;
}

function InputControl({ field, register }) {
  const rules = buildRules(field);
  const inputProps = register(field.name, field.type === "number"
    ? { ...rules, valueAsNumber: true }
    : rules);

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          className="builder-form-input"
          rows={4}
          placeholder={field.placeholder || ""}
          style={field.styles || {}}
          {...inputProps}
        />
      );
    case "number":
      return (
        <input
          type="number"
          className="builder-form-input"
          placeholder={field.placeholder || "0"}
          style={field.styles || {}}
          {...inputProps}
        />
      );
    case "select":
      return (
        <select className="builder-form-input" style={field.styles || {}} {...inputProps}>
          <option value="">{field.placeholder || "Select..."}</option>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case "radio":
      return (
        <div className="builder-choice-group">
          {(field.options || []).map((option) => (
            <label key={option.value} className="builder-check-row">
              <input type="radio" value={option.value} {...inputProps} />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <label className="builder-check-row">
          <input type="checkbox" {...inputProps} />
          <span>{field.label?.text || "Checkbox"}</span>
        </label>
      );
    case "date":
      return (
        <input
          type="date"
          className="builder-form-input"
          style={field.styles || {}}
          min={field.validation?.minDate || undefined}
          max={field.validation?.maxDate || undefined}
          {...inputProps}
        />
      );
    case "text":
    default:
      return (
        <input
          type="text"
          className="builder-form-input"
          placeholder={field.placeholder || ""}
          style={field.styles || {}}
          {...inputProps}
        />
      );
  }
}

export default function BuilderFieldRenderer({ field, register, errors }) {
  const error = errors?.[field.name];
  const labelPosition = field.label?.position || "top";
  const fieldStyle = {
    ...(field.styles?.fontSize ? { fontSize: `${field.styles.fontSize}px` } : {}),
    ...(field.styles?.textAlign ? { textAlign: field.styles.textAlign } : {}),
    ...buildGridItemStyle(field.gridPosition),
  };

  return (
    <div className="builder-field-card" style={fieldStyle}>
      {field.label?.text && labelPosition !== "hidden" && field.type !== "checkbox" && (
        <label
          className="builder-form-label"
          style={labelPosition === "inline" ? { display: "inline-block", marginRight: 8 } : undefined}
        >
          {field.label.text}
          {field.validation?.required && <span className="builder-required-star">*</span>}
        </label>
      )}

      {field.subLabel && <p className="builder-form-sublabel">{field.subLabel}</p>}
      <InputControl field={field} register={register} />
      {field.helperText && (
        <p
          className="builder-form-sublabel"
          style={field.styles?.helperTextColor ? { color: field.styles.helperTextColor } : undefined}
        >
          {field.helperText}
        </p>
      )}
      {error && <p className="builder-form-error">{error.message}</p>}
    </div>
  );
}
