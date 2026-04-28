import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { sanitizeRichText } from "../richText";

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

function AttachmentControl({ field, register }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const acceptedTypes = Array.isArray(field.validation?.fileTypes)
    ? field.validation.fileTypes.join(",")
    : "";
  const acceptedTypesLabel = Array.isArray(field.validation?.fileTypes)
    ? field.validation.fileTypes.join(", ")
    : "";

  const registration = useMemo(() => {
    if (!register) return {};

    const baseRules = buildRules(field);

    if (field.validation?.maxFileSize) {
      baseRules.validate = {
        ...(baseRules.validate || {}),
        maxSize: (fileList) => {
          if (!fileList || fileList.length === 0) return true;
          const maxSizeInBytes = field.validation.maxFileSize * 1024 * 1024;
          for (let i = 0; i < fileList.length; i++) {
            if (fileList[i].size > maxSizeInBytes) {
              return `File ${fileList[i].name} exceeds maximum size of ${field.validation.maxFileSize}MB`;
            }
          }
          return true;
        }
      };
    }

    if (field.validation?.maxFiles && field.multiple) {
      baseRules.validate = {
        ...(baseRules.validate || {}),
        maxFiles: (fileList) => {
          if (!fileList || fileList.length === 0) return true;
          if (fileList.length > field.validation.maxFiles) {
            return field.validation.messages?.maxFiles || `Maximum of ${field.validation.maxFiles} files allowed`;
          }
          return true;
        }
      };
    }

    return register(field.name, {
      ...baseRules,
      onChange: (event) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(files);
      },
    });
  }, [field.name, field.validation, register]);

  const previewUrl = useMemo(
    () => (previewFile ? URL.createObjectURL(previewFile) : ""),
    [previewFile]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChipClick = (file) => {
    if (file?.type?.startsWith("image/")) {
      setPreviewFile(file);
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
  };

  return (
    <>
      <div className="attachment-field-shell" style={field.styles || {}}>
        <div className="attachment-field-header">
          <span className="attachment-field-title">
            {field.multiple ? "Choose one or more files" : "Choose a file"}
          </span>
          {acceptedTypesLabel && (
            <span className="attachment-field-meta">Accepted: {acceptedTypesLabel}</span>
          )}
        </div>

        <div className="attachment-input-box">
          <input
            type="file"
            className="attachment-native-input"
            multiple={!!field.multiple}
            accept={acceptedTypes || undefined}
            {...registration}
          />
        </div>

        <div className="attachment-file-list">
          {selectedFiles.length > 0 ? (
            selectedFiles.map((file) => (
              <button
                key={`${file.name}-${file.lastModified}`}
                type="button"
                className="attachment-file-chip"
                onClick={() => handleFileChipClick(file)}
                title={file.type?.startsWith("image/") ? "Preview image" : "Open file"}
              >
                {file.name}
              </button>
            ))
          ) : (
            <span className="attachment-empty-text">
              {field.multiple ? "No files selected yet." : "No file selected yet."}
            </span>
          )}
        </div>
      </div>

      {previewFile && createPortal(
        <div className="builder-runtime" style={{ display: "contents" }}>
          <div className="modal-backdrop" onClick={() => setPreviewFile(null)}>
            <div className="attachment-preview-modal" onClick={(event) => event.stopPropagation()}>
              <div className="attachment-preview-header">
                <span className="attachment-preview-title">{previewFile.name}</span>
                <button
                  type="button"
                  className="builder-btn builder-btn-ghost"
                  onClick={() => setPreviewFile(null)}
                >
                  Close
                </button>
              </div>
              <div className="attachment-preview-body">
                <img src={previewUrl} alt={previewFile.name} className="attachment-preview-image" />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function TableControl({ field, register, errors }) {
  const rows = field.rowCount || 2;
  const cols = field.columnCount || 3;
  const headers = field.headers || [];
  const rowHeaders = field.rowHeaders || [];
  const headerType = field.headerType || (field.showHeader === false ? "none" : "column");
  const showHeader = headerType !== "none";
  const hasColumnHeader = headerType === "column" || headerType === "both";
  const hasRowHeader = headerType === "row" || headerType === "both";
  const totalCols = cols + (hasRowHeader ? 1 : 0);

  const numericWidths = Array.from({ length: totalCols }).map((_, index) => {
    const value = field.columnWidths?.[index];
    return typeof value === "number" && value > 0 ? value : 0;
  });
  const totalWidth = numericWidths.reduce((sum, value) => sum + value, 0);
  const colWidthPercents = totalWidth > 0
    ? numericWidths.map((value) => (value > 0 ? `${(value / totalWidth) * 100}%` : null))
    : null;

  const headerStyle = field.headerStyle || {};
  const cellStyle = field.cellStyle || {};

  const thBaseStyle = {
    padding: "8px",
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    fontSize: 13,
    fontWeight: headerStyle.fontWeight ?? 600,
    fontStyle: headerStyle.fontStyle || "normal",
    textAlign: headerStyle.textAlign || "left",
    position: "relative",
    userSelect: "none",
  };

  const inputStyle = {
    border: "none",
    borderRadius: 0,
    width: "100%",
    height: "100%",
    padding: "8px 12px",
    background: "transparent",
    textAlign: cellStyle.textAlign || "left",
    fontWeight: cellStyle.fontWeight ?? 400,
    fontStyle: cellStyle.fontStyle || "normal",
    boxShadow: "none",
  };

  return (
    <div style={{ ...field.styles, position: "relative", overflow: "visible" }}>
      <table
        className="builder-form-table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid var(--color-border)",
          tableLayout: "fixed",
          maxWidth: "100%",
        }}
      >
        <colgroup>
          {Array.from({ length: totalCols }).map((_, index) => (
            <col key={index} style={colWidthPercents?.[index] ? { width: colWidthPercents[index] } : {}} />
          ))}
        </colgroup>

        {showHeader && hasColumnHeader && (
          <thead>
            <tr>
              {Array.from({ length: totalCols }).map((_, colIndex) => {
                if (hasRowHeader && colIndex === 0) {
                  return <th key={colIndex} style={thBaseStyle} />;
                }
                const dataColIndex = hasRowHeader ? colIndex - 1 : colIndex;
                return (
                  <th key={colIndex} style={thBaseStyle}>
                    {headers[dataColIndex] || `Column ${dataColIndex + 1}`}
                  </th>
                );
              })}
            </tr>
          </thead>
        )}

        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {hasRowHeader && showHeader && (
                <th scope="row" style={{ ...thBaseStyle, fontSize: 12, background: "var(--color-surface)" }}>
                  {rowHeaders[rowIndex] || `Row ${rowIndex + 1}`}
                </th>
              )}
              {Array.from({ length: cols }).map((_, colIndex) => {
                const cellPath = `${field.name || field.id}[${rowIndex}][${colIndex}]`;
                const cellError = errors?.[field.name || field.id]?.[rowIndex]?.[colIndex];

                let activeCellRules;
                const cellRuleKey = `${rowIndex}:${colIndex}`;
                const cellValidation = field.validation?.cellRules?.[cellRuleKey];

                if (cellValidation) {
                  activeCellRules = buildRules({ validation: cellValidation, label: { text: "Cell" } });
                } else {
                  activeCellRules = buildRules(field);
                }

                return (
                  <td key={colIndex} style={{ padding: "4px", border: "1px solid var(--color-border)", verticalAlign: "top" }}>
                    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                      <input
                        type="text"
                        className={`builder-form-input builder-table-cell-input ${cellError ? "has-error" : ""}`}
                        style={{ ...inputStyle, flex: 1 }}
                        {...register(cellPath, activeCellRules)}
                      />
                      {cellError && (
                        <span className="validation-error-msg" style={{ marginTop: "2px", fontSize: "11px", lineHeight: "1.2", padding: "0 4px" }}>
                          {cellError.message}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InputControl({ field, register, errors }) {
  const rules = buildRules(field);
  const inputProps = register(field.name, field.type === "number"
    ? { ...rules, valueAsNumber: true }
    : rules);
  const headingHtml = typeof field.label === "object" ? field.label?.html : undefined;
  const safeHeadingHtml = useMemo(() => sanitizeRichText(headingHtml), [headingHtml]);

  const handleKeyDown = (e) => {
    const allowed = field.validation?.allowedCharacters;
    if (!allowed || !Array.isArray(allowed) || allowed.length === 0) return;

    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;

    const isAlphabet = /^[a-zA-Z\s]*$/.test(e.key);
    const isNumeric = /^[0-9]*$/.test(e.key);

    const labels = allowed.map((item) => typeof item === "string" ? item : item.label);

    let allow = false;
    if (labels.includes("Alphabet") && isAlphabet) allow = true;
    if (labels.includes("Numeric") && isNumeric) allow = true;
    if ((labels.includes("Alphanumeric/ Special Characters") || labels.includes("Alphanumeric")) && (isAlphabet || isNumeric)) allow = true;
    if (labels.includes("Different languages") || labels.includes("Languages")) allow = true;

    if (!allow) e.preventDefault();
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
      const Tag = field.styles?.fontSize >= 32 ? "h1" : field.styles?.fontSize >= 24 ? "h2" : "h3";
      const headingStyle = {
        margin: 0,
        fontSize: "inherit",
        fontWeight: field.styles?.fontWeight || 700,
        textAlign: field.styles?.textAlign || "left",
        color: field.styles?.color || "inherit",
      };

      if (safeHeadingHtml) {
        return (
          <div
            className="builder-heading-rich-text"
            style={headingStyle}
            dangerouslySetInnerHTML={{ __html: safeHeadingHtml }}
          />
        );
      }

      return (
        <Tag
          style={headingStyle}
        >
          {field.label?.text || "Heading"}
        </Tag>
      );
    }
    case "attachment":
    case "file":
      return <AttachmentControl field={field} register={register} />;
    case "multiselect":
      return (
        <select className="builder-form-input" multiple style={{ ...(field.styles || {}), minHeight: "80px" }} {...inputProps}>
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
        <div className="builder-choice-group builder-rating" style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "flex-end", gap: "4px" }}>
          {stars.map((star) => (
            <label key={star} className="builder-rating-item" style={{ cursor: "pointer" }}>
              <input type="radio" value={star} style={{ display: "none" }} {...inputProps} />
              <span className="star-icon" style={{ fontSize: "24px", opacity: 0.5 }}>?</span>
            </label>
          ))}
        </div>
      );
    }
    case "table":
      return <TableControl field={field} register={register} errors={errors} />;
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
      <InputControl field={field} register={register} errors={errors} />
      {field.helperText && (
        <p
          className="builder-form-sublabel"
          style={field.styles?.helperTextColor ? { color: field.styles.helperTextColor } : undefined}
        >
          {field.helperText}
        </p>
      )}
      {error && !Array.isArray(error) && <p className="builder-form-error">{error.message}</p>}
    </div>
  );
}
