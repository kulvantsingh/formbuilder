import React from "react";
import { sanitizeRichText } from "./richText";

const getLabelText = (field) =>
  typeof field.label === "object" && field.label !== null ? field.label.text : field.label;

const getLabelHtml = (field) =>
  typeof field.label === "object" && field.label !== null ? field.label.html : undefined;

const isPhoneLikeField = (field) => {
  const labelText = getLabelText(field) || "";
  const keyText = `${field.id || ""} ${field.name || ""} ${labelText}`;
  return field.type === "phone" || /phone|mobile|contact/i.test(keyText);
};

const getValidationRules = (field) => {
  const rules = {};
  const isRequired = field.required || field.validation?.required;
  const v = field.validation || {};
  const isPhoneLike = isPhoneLikeField(field);

  if (isRequired) {
    const labelText = getLabelText(field);
    rules.required = v.messages?.required || `${labelText || "This field"} is required`;
  }
  if (field.validation) {
    if (v.minLength !== undefined) rules.minLength = { value: v.minLength, message: v.messages?.minLength || `Min length is ${v.minLength}` };
    if (v.maxLength !== undefined) rules.maxLength = { value: v.maxLength, message: v.messages?.maxLength || `Max length is ${v.maxLength}` };

    if (v.pattern === "email" || v.pattern === "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/") {
      rules.pattern = { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, message: v.messages?.pattern || "Invalid email format" };
    } else if (v.pattern) {
      // Strip potential visual regex wrappers from string
      let regexStr = v.pattern;
      if (regexStr.startsWith('/') && regexStr.endsWith('/')) {
        regexStr = regexStr.slice(1, -1);
      }
      rules.pattern = { value: new RegExp(regexStr), message: v.messages?.pattern || "Invalid format" };
    }

    if (isPhoneLike) {
      if (v.min !== undefined && rules.minLength === undefined) {
        rules.minLength = { value: v.min, message: v.messages?.min || `Min length is ${v.min}` };
      }
      if (v.max !== undefined && rules.maxLength === undefined) {
        rules.maxLength = { value: v.max, message: v.messages?.max || `Max length is ${v.max}` };
      }
      if (!rules.pattern) {
        rules.pattern = { value: /^\d+$/, message: v.messages?.pattern || "Only digits are allowed" };
      }
    } else {
      if (v.min !== undefined) rules.min = { value: v.min, message: v.messages?.min || `Min value is ${v.min}` };
      if (v.max !== undefined) rules.max = { value: v.max, message: v.messages?.max || `Max value is ${v.max}` };
    }

    if (v.minDate) rules.min = { value: v.minDate, message: v.messages?.minDate || `Date cannot be before ${v.minDate}` };
    if (v.maxDate) rules.max = { value: v.maxDate, message: v.messages?.maxDate || `Date cannot be after ${v.maxDate}` };
  }
  return rules;
};

const FieldRenderer = ({ field, register, setValue, error, multiSelects = {}, onToggleMultiSelect, currentValue }) => {
  const isFullWidth = ["textarea", "multiselect", "radio", "file", "rating", "checkbox"].includes(field.type);
  const wrapClass = `field-wrap${isFullWidth ? " field-full" : ""}`;
  const inputClass = `field-input${error ? " has-error" : ""}`;
  const inputStyle = {
    textAlign: field.styles?.textAlign || 'left',
    fontSize: field.styles?.fontSize ? `${field.styles.fontSize}px` : undefined
  };

  const labelText = getLabelText(field);
  const safeHeadingHtml = sanitizeRichText(getLabelHtml(field));
  const isRequired = field.required || field.validation?.required;
  const isPhoneLike = isPhoneLikeField(field);

  const subLabelEl = field.subLabel ? (
    <div className="field-sub-label" style={{ fontSize: '12px', opacity: 0.7, marginBottom: '2px' }}>
      {field.subLabel}
    </div>
  ) : null;

  const labelEl = (
    <div style={{ marginBottom: '6px' }}>
      <label className="field-label" htmlFor={field.id} style={{ fontSize: field.styles?.fontSize ? `${field.styles.fontSize}px` : undefined }}>
        {labelText}
        {isRequired && <span className="required-star">*</span>}
      </label>
      {subLabelEl}
    </div>
  );

  const renderHelperText = () => {
    if (!field.helperText) return null;
    return (
      <div className="field-helper-text" style={{
        fontSize: '12px',
        marginTop: '4px',
        color: field.styles?.helperTextColor || 'var(--text-3)'
      }}>
        {field.helperText}
      </div>
    );
  };

  const renderError = () => {
    if (!error) return null;
    return <div className="validation-error-msg">{error.message}</div>;
  };

  const rules = getValidationRules(field);

  switch (field.type) {
    case "heading": {
      const headingStyle = {
        margin: 0,
        fontSize: field.styles?.fontSize ? `${field.styles.fontSize}px` : undefined,
        fontWeight: field.styles?.fontWeight || 700,
        textAlign: field.styles?.textAlign || "left",
        color: field.styles?.color || "inherit",
      };

      if (safeHeadingHtml) {
        return (
          <div
            className={wrapClass}
            style={headingStyle}
          >
            <div
              className="heading-rich-text"
              dangerouslySetInnerHTML={{ __html: safeHeadingHtml }}
            />
          </div>
        );
      }

      const Tag = field.styles?.fontSize >= 32 ? "h1" : field.styles?.fontSize >= 24 ? "h2" : "h3";
      return (
        <div className={wrapClass}>
          <Tag style={{ ...headingStyle, fontSize: "inherit" }}>{labelText || "Heading"}</Tag>
        </div>
      );
    }

    case "text":
    case "email":
    case "number":
    case "phone":
      return (
        <div className={wrapClass}>
          {labelEl}
          <input
            id={field.id}
            type={isPhoneLike ? "tel" : field.type}
            className={inputClass}
            style={inputStyle}
            inputMode={isPhoneLike ? "numeric" : undefined}
            autoComplete={isPhoneLike ? "tel" : undefined}
            placeholder={field.placeholder || `Enter ${labelText?.toLowerCase()}…`}
            {...register(field.id, rules)}
          />
          {renderHelperText()}
          {renderError()}
        </div>
      );


    case "date":
      return (
        <div className={wrapClass}>
          {labelEl}
          <input
            id={field.id}
            type="date"
            className={inputClass}
            style={inputStyle}
            min={field.validation?.minDate}
            max={field.validation?.maxDate}
            {...register(field.id, rules)}
          />
          {renderHelperText()}
          {renderError()}
        </div>
      );

    case "textarea":
      return (
        <div className={wrapClass}>
          {labelEl}
          <textarea
            id={field.id}
            className={inputClass}
            style={inputStyle}
            rows={field.rows || 3}
            placeholder={field.placeholder || `Enter ${labelText?.toLowerCase()}…`}
            {...register(field.id, rules)}
          />
          {renderHelperText()}
          {renderError()}
        </div>
      );

    case "dropdown":
    case "select":
      return (
        <div className={wrapClass}>
          {labelEl}
          <select id={field.id} className={inputClass} style={inputStyle} {...register(field.id, rules)}>
            <option value="">— Select —</option>
            {(field.options || []).map((o, idx) => {
              const optLabel = typeof o === 'object' ? o.label : o;
              const optVal = typeof o === 'object' ? o.value : o;
              return <option key={idx} value={optVal}>{optLabel}</option>;
            })}
          </select>
          {renderHelperText()}
          {renderError()}
        </div>
      );

    case "radio":
      return (
        <div className={wrapClass}>
          {labelEl}
          <div className="field-radio-group">
            {(field.options || []).map((o, idx) => {
              const optLabel = typeof o === 'object' ? o.label : o;
              const optVal = typeof o === 'object' ? o.value : o;
              return (
                <label key={idx} className="field-radio-item">
                  <input type="radio" value={optVal} {...register(field.id, rules)} />
                  {optLabel}
                </label>
              );
            })}
          </div>
          {renderHelperText()}
          {renderError()}
        </div>
      );

    case "checkbox":
      return (
        <div className={wrapClass}>
          <label className="field-checkbox-item" style={{ width: "fit-content" }}>
            <input type="checkbox" {...register(field.id, rules)} />
            {labelText}
          </label>
          {renderHelperText()}
          {renderError()}
        </div>
      );

    case "multiselect": {
      const selected = multiSelects[field.id] || [];
      return (
        <div className={wrapClass}>
          {labelEl}
          <div className="field-multiselect-tags">
            {(field.options || []).map((o, idx) => {
              const optLabel = typeof o === 'object' ? o.label : o;
              const optVal = typeof o === 'object' ? o.value : o;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`field-tag${selected.includes(optVal) ? " selected" : ""}`}
                  onClick={() => onToggleMultiSelect(field.id, optVal)}
                >
                  {optLabel}
                </button>
              );
            })}
          </div>
          {/* Note: React Hook Form doesn't trivially validate custom tag array states out of the box without Control, but we ignore it for now or assume it's optional */}
        </div>
      );
    }

    case "file": {
      const accepts = Array.isArray(field.accept) ? field.accept.join(", ") : field.accept || "";
      const hint = [
        accepts.replace(/application\//g, "").replace(/image\//g, "").toUpperCase(),
        field.maxSizeMB ? `Max ${field.maxSizeMB}MB` : "",
      ].filter(Boolean).join(" · ");

      let actualFile = null;
      if (currentValue instanceof File) actualFile = currentValue;
      else if (currentValue && currentValue.length > 0 && currentValue[0] instanceof File) actualFile = currentValue[0];

      const previewUrl = actualFile && actualFile.type.startsWith("image/")
        ? URL.createObjectURL(actualFile)
        : null;

      return (
        <div className={wrapClass}>
          {labelEl}
          <label className={`field-file-label${error ? ' has-error' : ''}`} htmlFor={field.id} style={error ? { borderColor: "var(--danger)" } : {}}>
            {previewUrl ? (
              <img src={previewUrl} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} alt="Preview" />
            ) : (
              <span className="field-file-icon">📎</span>
            )}
            <span className="field-file-text">
              <span style={{ fontWeight: actualFile ? '600' : 'normal', color: actualFile ? 'var(--text)' : 'inherit' }}>
                {actualFile ? actualFile.name : "Click to upload or drag & drop"}
              </span>
              {!actualFile && hint && <span className="field-file-hint">{hint}</span>}
            </span>
            <input
              id={field.id}
              type="file"
              className="field-file-input"
              accept={accepts}
              {...register(field.id, rules)}
              onChange={(e) => {
                const file = e.target.files[0];
                setValue(field.id, file, { shouldValidate: true });
              }}
            />
          </label>
          {renderError()}
        </div>
      );
    }

    case "rating": {
      const max = field.max || 5;
      const stars = Array.from({ length: max }, (_, i) => max - i);
      const groupName = `rating_${field.id}`;
      return (
        <div className={wrapClass}>
          {labelEl}
          <div className="field-rating">
            {stars.map((star) => (
              <React.Fragment key={star}>
                <input
                  type="radio"
                  id={`${groupName}_${star}`}
                  name={groupName}
                  value={star}
                  {...register(field.id, rules)}
                />
                <label htmlFor={`${groupName}_${star}`} title={`${star} star${star > 1 ? "s" : ""}`}>
                  ★
                </label>
              </React.Fragment>
            ))}
          </div>
          {renderError()}
        </div>
      );
    }

    default:
      return null;
  }
};

export default FieldRenderer;
