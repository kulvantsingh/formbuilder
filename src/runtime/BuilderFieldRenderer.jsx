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
  const _min = validation.min !== undefined ? validation.min : validation.minValue;
  if (_min !== undefined) {
    rules.min = {
      value: _min,
      message: messages.min || `Minimum value is ${_min}`,
    };
  }
  const _max = validation.max !== undefined ? validation.max : validation.maxValue;
  if (_max !== undefined) {
    rules.max = {
      value: _max,
      message: messages.max || `Maximum value is ${_max}`,
    };
  }

  if (validation.minChar !== undefined) {
    rules.validate = {
      ...(rules.validate || {}),
      minChar: (val) => {
        if (!val && val !== 0) return true;
        return String(val).length >= validation.minChar || messages.minChar || `Minimum length is ${validation.minChar} characters`;
      }
    };
  }
  if (validation.maxChar !== undefined) {
    rules.validate = {
      ...(rules.validate || {}),
      maxChar: (val) => {
        if (!val && val !== 0) return true;
        return String(val).length <= validation.maxChar || messages.maxChar || `Maximum length is ${validation.maxChar} characters`;
      }
    };
  }
  if (validation.pattern) {
    let regexStr = validation.pattern;
    if (regexStr.startsWith('/') && regexStr.endsWith('/')) {
      regexStr = regexStr.slice(1, -1);
    }
    rules.pattern = {
      value: new RegExp(regexStr),
      message: messages.pattern || "Invalid format",
    };
  }

  return rules;
}

function InputControl({ field, register }) {
  const rules = buildRules(field);
  const inputProps = register(field.name, field.type === "number"
    ? { ...rules, valueAsNumber: true }
    : rules);

  const handleKeyDown = (e) => {
    const allowed = field.validation?.allowedCharacters;
    if (!allowed || !Array.isArray(allowed) || allowed.length === 0) return;

    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;

    const isAlphabet = /^[a-zA-Z\s]*$/.test(e.key);
    const isNumeric = /^[0-9]*$/.test(e.key);

    const labels = allowed.map(a => typeof a === 'string' ? a : a.label);

    let allow = false;
    if (labels.includes("Alphabet") && isAlphabet) allow = true;
    if (labels.includes("Numeric") && isNumeric) allow = true;
    if (labels.includes("Alphanumeric/ Special Characters") || labels.includes("Alphanumeric") && (isAlphabet || isNumeric)) allow = true;
    if (labels.includes("Different languages") || labels.includes("Languages")) allow = true; // allow all

    if (!allow) {
      e.preventDefault();
    }
  };

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          className="builder-form-input"
          rows={4}
          placeholder={field.placeholder || ""}
          style={field.styles || {}}
          onKeyDown={handleKeyDown}
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
      if (field.options && field.options.length > 0) {
        return (
          <div className="builder-choice-group">
            {field.options.map((option) => (
              <label key={option.value} className="builder-check-row">
                <input type="checkbox" value={option.value} {...inputProps} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );
      }
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
    case "heading": {
      const Tag = field.styles?.fontSize > 24 ? "h2" : "h3";
      return <Tag style={field.styles || {}}>{field.label?.text}</Tag>;
    }
    case "attachment":
    case "file": {
      const accepts = Array.isArray(field.validation?.fileTypes)
        ? field.validation.fileTypes.join(", ")
        : "";
      return (
        <input
          type="file"
          className="builder-form-input builder-file-input"
          multiple={field.multiple}
          accept={accepts}
          style={field.styles || { border: '1px dashed var(--border)' }}
          {...inputProps}
        />
      );
    }
    case "multiselect":
      return (
        <select className="builder-form-input" multiple style={{ ...(field.styles || {}), minHeight: '80px' }} {...inputProps}>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case "rating": {
      const max = field.max || 5;
      const stars = Array.from({ length: max }, (_, i) => max - i);
      return (
        <div className="builder-choice-group builder-rating" style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'flex-end', gap: '4px' }}>
          {stars.map((star) => (
            <label key={star} className="builder-rating-item" style={{ cursor: 'pointer' }}>
              <input type="radio" value={star} style={{ display: 'none' }} {...inputProps} />
              <span className="star-icon" style={{ fontSize: '24px', opacity: 0.5 }}>★</span>
            </label>
          ))}
        </div>
      );
    }
    case "table":
      return (
        <div className="builder-table-container" style={{ overflowX: 'auto', width: '100%', ...(field.styles || {}) }}>
          <table className="builder-form-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                {Array.from({ length: field.columnCount || 3 }).map((_, colIndex) => (
                  <th key={colIndex} style={{ borderBottom: '2px solid var(--border)', padding: '8px' }}>
                    {field.headers?.[colIndex] || `Column ${colIndex + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: field.rowCount || 2 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: field.columnCount || 3 }).map((_, colIndex) => (
                    <td key={colIndex} style={{ borderBottom: '1px solid var(--border)', padding: '8px' }}>
                      <input
                        type="text"
                        className="builder-form-input"
                        style={{ padding: '6px' }}
                        {...register(`${field.name}.${rowIndex}.${colIndex}`)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "text":
    default:
      return (
        <input
          type="text"
          className="builder-form-input"
          placeholder={field.placeholder || ""}
          style={field.styles || {}}
          onKeyDown={handleKeyDown}
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
      {field.label?.text && labelPosition !== "hidden" && field.type !== "heading" && (
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
