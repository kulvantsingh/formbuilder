(function (global) {
  if (global.FormBuilderSDK) {
    return;
  }

  var BASE_CSS = `
    :host, .fbsdk-root {
      all: initial;
      display: block;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #0f172a;
    }

    .fbsdk-shell {
      --fbsdk-primary: #6366f1;
      --fbsdk-bg: #f5f6fa;
      --fbsdk-surface: #ffffff;
      --fbsdk-border: #e2e4eb;
      --fbsdk-text: #1e293b;
      --fbsdk-muted: #64748b;
      --fbsdk-danger: #ef4444;
      --fbsdk-radius: 14px;
      --fbsdk-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      background: var(--fbsdk-bg);
      color: var(--fbsdk-text);
      min-height: 100%;
      width: 100%;
      transition: background 0.25s ease, color 0.25s ease;
    }

    .fbsdk-card {
      max-width: 960px;
      margin: 0 auto;
      background: var(--fbsdk-surface);
      border: 1px solid var(--fbsdk-border);
      border-radius: var(--fbsdk-radius);
      box-shadow: var(--fbsdk-shadow);
      overflow: hidden;
    }

    .fbsdk-header {
      padding: 28px 28px 0;
    }

    .fbsdk-title {
      margin: 0;
      font-size: 22px;
      line-height: 1.2;
      font-weight: 700;
      letter-spacing: -0.03em;
    }

    .fbsdk-subtitle {
      margin-top: 8px;
      font-size: 12px;
      color: var(--fbsdk-muted);
    }

    .fbsdk-progress {
      margin-top: 12px;
      height: 4px;
      border-radius: 999px;
      background: var(--fbsdk-border);
      overflow: hidden;
    }

    .fbsdk-progress-bar {
      height: 100%;
      background: var(--fbsdk-primary);
      width: 0%;
      transition: width 180ms ease;
    }

    .fbsdk-body {
      padding: 0 28px 28px;
    }

    .fbsdk-page-title {
      margin: 0 0 18px;
      font-size: 18px;
      font-weight: 600;
    }

    .fbsdk-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .fbsdk-grid[data-cols="2"] {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .fbsdk-grid[data-cols="3"] {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (max-width: 760px) {
      .fbsdk-grid[data-cols="2"],
      .fbsdk-grid[data-cols="3"] {
        grid-template-columns: 1fr;
      }
    }

    .fbsdk-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .fbsdk-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--fbsdk-text);
    }

    .fbsdk-required {
      color: var(--fbsdk-danger);
      margin-left: 4px;
    }

    .fbsdk-input,
    .fbsdk-select,
    .fbsdk-textarea {
      width: 100%;
      border: 1.5px solid var(--fbsdk-border);
      border-radius: 8px;
      background: var(--fbsdk-bg);
      color: var(--fbsdk-text);
      padding: 8px 12px;
      font: inherit;
      outline: none;
      transition: border-color 150ms ease, box-shadow 150ms ease;
    }

    .fbsdk-textarea {
      min-height: 90px;
      resize: vertical;
    }

    .fbsdk-input:focus,
    .fbsdk-select:focus,
    .fbsdk-textarea:focus {
      border-color: var(--fbsdk-primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .fbsdk-help,
    .fbsdk-error,
    .fbsdk-note {
      font-size: 13px;
      line-height: 1.45;
    }

    .fbsdk-help,
    .fbsdk-note {
      color: var(--fbsdk-muted);
    }

    .fbsdk-error {
      color: var(--fbsdk-danger);
    }

    .fbsdk-choice-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .fbsdk-choice {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--fbsdk-border);
      background: var(--fbsdk-surface);
      border-radius: 999px;
      padding: 8px 14px;
      cursor: pointer;
      font-size: 13px;
      user-select: none;
    }

    .fbsdk-choice input {
      margin: 0;
    }

    .fbsdk-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid var(--fbsdk-border);
    }

    .fbsdk-btn {
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .fbsdk-btn:active {
      transform: translateY(1px);
    }

    .fbsdk-btn-primary {
      background: var(--fbsdk-primary);
      color: white;
    }

    .fbsdk-btn-ghost {
      background: transparent;
      border: 1px solid var(--fbsdk-border);
      color: var(--fbsdk-text);
    }

    .fbsdk-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .fbsdk-submit-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(245, 246, 250, 0.7);
      backdrop-filter: blur(2px);
      z-index: 10;
    }

    .fbsdk-submit-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-radius: 999px;
      background: var(--fbsdk-surface);
      border: 1px solid var(--fbsdk-border);
      color: var(--fbsdk-text);
      box-shadow: var(--fbsdk-shadow);
      font-size: 13px;
      font-weight: 600;
    }

    .fbsdk-spinner {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid var(--fbsdk-border);
      border-top-color: var(--fbsdk-primary);
      animation: fbsdk-spin 0.8s linear infinite;
    }

    @keyframes fbsdk-spin {
      to { transform: rotate(360deg); }
    }

    .fbsdk-success {
      padding: 40px 24px;
      text-align: center;
    }

    .fbsdk-success h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: var(--fbsdk-text);
    }

    .fbsdk-loading,
    .fbsdk-error-panel {
      padding: 24px;
      border: 1px solid var(--fbsdk-border);
      border-radius: 14px;
      background: #fff;
      max-width: 960px;
      margin: 0 auto;
    }

    .fbsdk-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      z-index: 999999;
    }

    .fbsdk-modal {
      width: min(560px, 100%);
      background: white;
      border-radius: 16px;
      box-shadow: 0 30px 70px rgba(15, 23, 42, 0.25);
      padding: 24px;
    }

    .fbsdk-modal h3 {
      margin: 0 0 12px;
      font-size: 20px;
    }

    .fbsdk-modal p {
      margin: 0 0 18px;
      color: var(--fbsdk-muted);
      white-space: pre-wrap;
    }

    .fbsdk-modal-actions {
      display: flex;
      justify-content: flex-end;
    }
  `;

  var OVERRIDE_CSS = `
    .fbsdk-shell {
      --color-bg: #f5f6fa;
      --color-surface: #ffffff;
      --color-surface-hover: #f0f1f5;
      --color-border: #e2e4eb;
      --color-border-focus: #6366f1;
      --color-primary: #6366f1;
      --color-primary-hover: #818cf8;
      --color-primary-muted: rgba(99, 102, 241, 0.1);
      --color-text: #1e293b;
      --color-text-muted: #64748b;
      --color-danger: #ef4444;
      --panel-radius: 14px;
      --transition-fast: 150ms ease;
      --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.06);
      background: var(--color-bg);
      color: var(--color-text);
      min-height: 100%;
    }

    .fbsdk-shell * ,
    .fbsdk-shell *::before,
    .fbsdk-shell *::after {
      box-sizing: border-box;
    }

    .fbsdk-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--panel-radius);
      box-shadow: var(--shadow-md);
      max-width: 960px;
      width: 100%;
      min-height: 500px;
      padding: 0;
      overflow: hidden;
    }

    .fbsdk-header {
      margin-bottom: 24px;
      padding: 28px 28px 0;
    }

    .fbsdk-body {
      padding: 0 28px 28px;
    }

    .fbsdk-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 8px;
    }

    .fbsdk-subtitle,
    .fbsdk-page-title,
    .fbsdk-help,
    .fbsdk-note,
    .fbsdk-error {
      color: var(--color-text-muted);
    }

    .fbsdk-progress {
      height: 4px;
      background: var(--color-border);
      border-radius: 999px;
      overflow: hidden;
      margin-top: 12px;
    }

    .fbsdk-progress-bar {
      background: var(--color-primary);
      height: 100%;
      transition: width 0.3s ease;
    }

    .fbsdk-field {
      min-width: 0;
    }

    .fbsdk-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 4px;
    }

    .fbsdk-input,
    .fbsdk-select,
    .fbsdk-textarea {
      width: 100%;
      padding: 8px 12px;
      background: var(--color-bg);
      border: 1.5px solid var(--color-border);
      border-radius: 8px;
      color: var(--color-text);
      font-size: 13px;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .fbsdk-input:focus,
    .fbsdk-select:focus,
    .fbsdk-textarea:focus {
      outline: none;
      border-color: var(--color-border-focus);
      box-shadow: 0 0 0 3px var(--color-primary-muted);
    }

    .fbsdk-choice-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .fbsdk-choice {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      cursor: pointer;
      color: var(--color-text);
    }

    .fbsdk-choice input[type="checkbox"],
    .fbsdk-choice input[type="radio"] {
      accent-color: var(--color-primary);
    }

    .fbsdk-actions {
      margin-top: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--color-border);
      padding-top: 16px;
    }

    .fbsdk-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .fbsdk-btn-primary {
      background: var(--color-primary);
      color: #fff;
    }

    .fbsdk-btn-primary:hover {
      background: var(--color-primary-hover);
    }

    .fbsdk-btn-ghost {
      background: transparent;
      color: var(--color-text-muted);
      border: 1.5px solid var(--color-border);
    }

    .fbsdk-btn-ghost:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }

    .fbsdk-success {
      padding: 40px 24px;
      text-align: center;
    }

    .fbsdk-success h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: var(--color-text);
    }

    .fbsdk-table {
      table-layout: fixed;
      max-width: 100%;
      border: 1px solid var(--color-border);
      width: 100%;
      border-collapse: collapse;
    }

    .fbsdk-table th,
    .fbsdk-table td {
      border-color: var(--color-border);
    }

    .fbsdk-attachment-shell {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .fbsdk-attachment-box {
      border: 1.5px dashed var(--color-border);
      background: linear-gradient(180deg, var(--color-bg), transparent);
      border-radius: 12px;
      padding: 12px;
    }

    .fbsdk-attachment-input {
      width: 100%;
      color: var(--color-text);
      font-size: 13px;
    }

    .fbsdk-attachment-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .fbsdk-attachment-chip {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--color-primary-muted);
      color: var(--color-primary);
      font-size: 11px;
      font-weight: 600;
      border: 1px solid transparent;
      cursor: pointer;
    }

    @media (max-width: 720px) {
      .fbsdk-body,
      .fbsdk-header {
        padding-left: 20px;
        padding-right: 20px;
      }
    }
  `;

  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function resolveTarget(target) {
    if (!target) return null;
    if (typeof target === "string") return document.querySelector(target);
    return target;
  }

  function ensureEndpoint(baseUrl, formId) {
    if (!baseUrl) return "";
    if (baseUrl.indexOf("{id}") !== -1) return baseUrl.replace("{id}", formId);
    if (baseUrl.slice(-7) === "/submit") return baseUrl;
    return baseUrl.replace(/\/$/, "") + "/" + formId + "/submit";
  }

  function normalizeOption(option) {
    if (typeof option === "string" || typeof option === "number") {
      var label = String(option);
      return { label: label, value: label };
    }
    if (!option || typeof option !== "object") {
      return { label: "", value: "" };
    }
    var labelText = option.label || option.text || option.value || "";
    return {
      label: labelText,
      value: option.value || slugify(labelText),
    };
  }

  function normalizeField(field, index) {
    if (!field || typeof field !== "object") return null;
    var labelValue = field.label;
    var labelText = typeof labelValue === "object" && labelValue ? (labelValue.text || "") : (labelValue || "");
    var type = (field.type || "text").toLowerCase();
    var name = field.name || field.id || slugify(labelText) || "field_" + (index + 1);
    var validation = field.validation || {};

    return {
      id: field.id || name,
      name: name,
      type: type === "dropdown" ? "select" : type,
      label: typeof labelValue === "object" ? (labelValue.text || "") : labelText,
      labelPosition: typeof labelValue === "object" ? (labelValue.position || "top") : "top",
      placeholder: field.placeholder || "",
      helperText: field.helperText || "",
      subLabel: field.subLabel || "",
      options: Array.isArray(field.options) ? field.options.map(normalizeOption) : [],
      multiple: !!field.multiple,
      required: !!(field.required || validation.required),
      validation: validation,
      styles: field.styles || {},
      rows: field.rows || 4,
      max: field.max || validation.max || 5,
      accept: Array.isArray(field.accept) ? field.accept.join(",") : (Array.isArray(validation.fileTypes) ? validation.fileTypes.join(",") : ""),
      rowCount: field.rowCount || validation.rowCount || 2,
      columnCount: field.columnCount || validation.columnCount || 3,
      headers: Array.isArray(field.headers) ? field.headers : [],
      rowHeaders: Array.isArray(field.rowHeaders) ? field.rowHeaders : [],
      headerType: field.headerType || (field.showHeader === false ? "none" : "column"),
      showHeader: field.showHeader !== false,
      columnWidths: Array.isArray(field.columnWidths) ? field.columnWidths : [],
      headerStyle: field.headerStyle || {},
      cellStyle: field.cellStyle || {},
      maxSizeMB: field.maxSizeMB || validation.maxSizeMB,
      field: field,
    };
  }

  function chunkFields(fields, columns) {
    var out = [];
    var size = Math.max(1, Number(columns) || 1);
    for (var i = 0; i < fields.length; i += size) {
      out.push(fields.slice(i, i + size));
    }
    return out;
  }

  function normalizePage(page, index, outerGridColumns, fieldMap) {
    var fields = [];
    var rows = [];
    var sourceRows = Array.isArray(page.rows) ? page.rows : [];

    if (sourceRows.length && (sourceRows[0].fields || sourceRows[0].fieldIds)) {
      rows = sourceRows.map(function (row, rowIndex) {
        var rowFields = [];
        if (Array.isArray(row.fieldIds) && fieldMap) {
          rowFields = row.fieldIds.map(function (fieldId) {
            return fieldMap[fieldId] || null;
          }).filter(Boolean);
        } else if (Array.isArray(row.fields)) {
          rowFields = row.fields.map(function (field, fieldIndex) {
            return normalizeField(field, fieldIndex);
          }).filter(Boolean);
        }
        return {
          id: row.id || "row_" + (index + 1) + "_" + (rowIndex + 1),
          fields: rowFields,
        };
      });
    } else if (Array.isArray(page.fields)) {
      fields = page.fields.map(normalizeField).filter(Boolean);
      rows = chunkFields(fields, (page.grid && page.grid.columns && page.grid.columns.length) || outerGridColumns || 1).map(function (rowFields, rowIndex) {
        return {
          id: "row_" + (index + 1) + "_" + (rowIndex + 1),
          fields: rowFields,
        };
      });
    }

    if (!rows.length) {
      rows = [{ id: "row_" + (index + 1) + "_1", fields: [] }];
    }

    if (!fields.length) {
      rows.forEach(function (row) {
        fields = fields.concat(row.fields);
      });
    }

    return {
      id: page.id || "page_" + (index + 1),
      title: page.title || ("Page " + (index + 1)),
      instructions: page.instructions || "",
      showInstructionsPopup: !!page.showInstructionsPopup,
      gridColumns: (page.grid && page.grid.columns && page.grid.columns.length) || outerGridColumns || 1,
      rows: rows,
      fields: fields,
    };
  }

  function normalizeSchema(payload) {
    var source = payload && payload.schema ? payload.schema : payload || {};
    var outer = payload && payload.schema ? payload : { schema: source };
    var theme = source.theme || {};
    var settings = source.settings || outer.settings || {};
    var gridColumns = source.grid && source.grid.columns && source.grid.columns.length ? source.grid.columns.length : 1;
    var fieldMap = {};

    if (Array.isArray(source.fields)) {
      source.fields.forEach(function (field, index) {
        var normalized = normalizeField(field, index);
        if (normalized) {
          fieldMap[normalized.id] = normalized;
        }
      });
    }

    var pages = Array.isArray(source.pages) ? source.pages.map(function (page, index) {
      return normalizePage(page, index, gridColumns, fieldMap);
    }) : [];

    if (!pages.length && Array.isArray(source.fields)) {
      pages = [normalizePage({ id: "page_1", title: source.title || source.name || "Page 1", fields: source.fields }, 0, gridColumns, fieldMap)];
    }

    return {
      id: outer.id || source.id || source.formId || "form",
      title: source.title || source.name || outer.name || "Untitled Form",
      theme: theme,
      settings: settings,
      globalCss: source.globalCss || outer.globalCss || "",
      instructions: source.instructions || "",
      showInstructionsPopup: !!source.showInstructionsPopup,
      pages: pages,
    };
  }

  async function fetchSchema(schemaUrl, requestOptions) {
    var options = requestOptions || {};
    var response = await fetch(schemaUrl, {
      method: "GET",
      mode: "cors",
      credentials: options.credentials || "omit",
      headers: options.headers || {},
    });

    if (!response.ok) {
      throw new Error("Failed to load schema: " + response.status);
    }

    var contentType = response.headers.get("content-type") || "";
    if (contentType.indexOf("application/json") !== -1) {
      return response.json();
    }

    var text = await response.text();
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error("Schema response was not valid JSON");
    }
  }

  function getFieldValue(state, field) {
    return Object.prototype.hasOwnProperty.call(state.values, field.name) ? state.values[field.name] : "";
  }

  function setFieldValue(state, field, value) {
    state.values[field.name] = value;
    state.errors[field.name] = "";
  }

  function validateField(field, value) {
    var validation = field.validation || {};
    var label = field.label || field.name || "This field";

    if (field.required) {
      var emptyArray = Array.isArray(value) && value.length === 0;
      var emptyString = value === "" || value === null || value === undefined;
      var emptyFile = value && value instanceof FileList && value.length === 0;
      var unchecked = field.type === "checkbox" && value === false;
      if (emptyArray || emptyString || emptyFile || unchecked) {
        return label + " is required";
      }
    }

    if ((field.type === "number" || field.type === "rating") && value !== "" && value !== null && value !== undefined) {
      var num = Number(value);
      if (validation.min !== undefined && num < Number(validation.min)) return "Minimum value is " + validation.min;
      if (validation.max !== undefined && num > Number(validation.max)) return "Maximum value is " + validation.max;
    }

    if (typeof value === "string") {
      if (validation.minLength !== undefined && value.length < Number(validation.minLength)) {
        return "Minimum length is " + validation.minLength;
      }
      if (validation.maxLength !== undefined && value.length > Number(validation.maxLength)) {
        return "Maximum length is " + validation.maxLength;
      }
      if (validation.pattern) {
        var pattern = validation.pattern;
        if (pattern === "email") {
          pattern = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
        }
        if (pattern.charAt(0) === "/" && pattern.charAt(pattern.length - 1) === "/") {
          pattern = pattern.slice(1, -1);
        }
        var regex = new RegExp(pattern);
        if (!regex.test(value)) return "Invalid format";
      }
    }

    if (Array.isArray(value)) {
      if (validation.minLength !== undefined && value.length < Number(validation.minLength)) {
        return "Select at least " + validation.minLength + " options";
      }
      if (validation.maxLength !== undefined && value.length > Number(validation.maxLength)) {
        return "Select no more than " + validation.maxLength + " options";
      }
    }

    return "";
  }

  function validateFields(fields, state) {
    var isValid = true;
    fields.forEach(function (field) {
      var error = validateField(field, getFieldValue(state, field));
      state.errors[field.name] = error;
      if (error) {
        isValid = false;
      }
    });
    return isValid;
  }

  function buildSubmitUrl(schema, options) {
    var submitUrl = options.submitUrl || (schema.settings && schema.settings.submitUrl) || "";
    var submitBaseUrl = options.submitBaseUrl || "";
    var formId = schema.id || "form";
    if (submitUrl) return ensureEndpoint(submitUrl, formId);
    if (submitBaseUrl) return ensureEndpoint(submitBaseUrl, formId);
    return "";
  }

  function createInstance(host, options) {
    var state = {
      schema: null,
      pageIndex: 0,
      values: {},
      errors: {},
      loading: true,
      error: null,
      isSubmitting: false,
      submitted: false,
      popupDismissed: {},
    };

    var root = host.shadowRoot || host;
    var app = document.createElement("div");
    var style = document.createElement("style");
    var schemaStyle = document.createElement("style");
    style.textContent = BASE_CSS + OVERRIDE_CSS;
    app.className = "fbsdk-root";
    root.appendChild(style);
    root.appendChild(schemaStyle);
    root.appendChild(app);

    function themeVars(schema) {
      var theme = (schema && schema.theme) || {};
      return [
        "--fbsdk-primary:" + (theme.primaryColor || options.theme && options.theme.primaryColor || "#2563eb"),
        "--fbsdk-bg:" + (theme.backgroundColor || options.theme && options.theme.backgroundColor || "#f8fafc"),
        "--fbsdk-text:" + (theme.textColor || options.theme && options.theme.textColor || "#0f172a"),
        "--fbsdk-surface:" + (theme.surfaceColor || "#ffffff"),
      ].join(";");
    }

    function normalizeChoiceOptions(field) {
      return (field.options || []).map(function (option) {
        if (option && typeof option === "object") return option;
        var label = String(option);
        return { label: label, value: label };
      });
    }

    function renderAttachmentField(field, currentValue) {
      var selected = [];
      if (currentValue instanceof FileList) {
        selected = Array.prototype.slice.call(currentValue);
      } else if (Array.isArray(currentValue)) {
        selected = currentValue;
      } else if (currentValue instanceof File) {
        selected = [currentValue];
      }

      var accepted = Array.isArray(field.validation && field.validation.fileTypes)
        ? field.validation.fileTypes.join(",")
        : field.accept || "";

      return [
        '<div class="fbsdk-field fbsdk-attachment-shell">',
        field.label ? '<label class="fbsdk-label">' + escapeHtml(field.label) + (field.required ? '<span class="fbsdk-required">*</span>' : "") + "</label>" : "",
        '<div class="fbsdk-attachment-box">',
        '<input class="fbsdk-attachment-input" type="file" data-field="' + escapeAttr(field.name) + '"' + (field.multiple ? " multiple" : "") + (accepted ? ' accept="' + escapeAttr(accepted) + '"' : "") + ">",
        "</div>",
        selected.length ? '<div class="fbsdk-note" style="margin-top:8px;">Selected: ' + escapeHtml(selected.map(function (file) { return file.name; }).join(", ")) + "</div>" : "",
        field.subLabel ? '<div class="fbsdk-help">' + escapeHtml(field.subLabel) + "</div>" : "",
        field.helperText ? '<div class="fbsdk-help">' + escapeHtml(field.helperText) + "</div>" : "",
        "</div>",
      ].join("");
    }

    function renderTableField(field, currentValue) {
      var rowCount = Number(field.rowCount || 2);
      var columnCount = Number(field.columnCount || 3);
      var rowHeaders = field.rowHeaders || [];
      var headers = field.headers || [];
      var headerType = field.headerType || "column";
      var showHeader = field.showHeader !== false && headerType !== "none";
      var hasColumnHeader = headerType === "column" || headerType === "both";
      var hasRowHeader = headerType === "row" || headerType === "both";
      var totalCols = columnCount + (hasRowHeader ? 1 : 0);
      var widths = (field.columnWidths || []).slice(0, totalCols);
      var widthSum = widths.reduce(function (sum, value) {
        var num = Number(value);
        return sum + (num > 0 ? num : 0);
      }, 0);
      var widthPercent = widthSum > 0 ? widths.map(function (value) {
        var num = Number(value);
        return num > 0 ? (num / widthSum) * 100 + "%" : "";
      }) : [];
      var cellStyle = [];
      Object.keys(field.cellStyle || {}).forEach(function (key) {
        cellStyle.push(key + ":" + field.cellStyle[key]);
      });
      var headerStyle = [];
      Object.keys(field.headerStyle || {}).forEach(function (key) {
        headerStyle.push(key + ":" + field.headerStyle[key]);
      });

      var tableHtml = [];
      tableHtml.push('<div class="fbsdk-field">');
      if (field.label) {
        tableHtml.push('<label class="fbsdk-label">' + escapeHtml(field.label) + (field.required ? '<span class="fbsdk-required">*</span>' : "") + "</label>");
      }
      tableHtml.push('<div class="fbsdk-note" style="margin-bottom:10px;">' + escapeHtml(field.subLabel || field.helperText || "") + "</div>");
      tableHtml.push('<div style="overflow-x:auto;">');
      tableHtml.push('<table class="fbsdk-table" style="background:#fff;">');

      if (totalCols > 0) {
        tableHtml.push("<colgroup>");
        for (var c = 0; c < totalCols; c++) {
          tableHtml.push('<col' + (widthPercent[c] ? ' style="width:' + widthPercent[c] + '"' : "") + ">");
        }
        tableHtml.push("</colgroup>");
      }

      if (showHeader && hasColumnHeader) {
        tableHtml.push("<thead><tr>");
        for (var h = 0; h < totalCols; h++) {
          if (hasRowHeader && h === 0) {
            tableHtml.push('<th style="padding:8px;border:1px solid var(--color-border);background:rgba(99,102,241,0.06);"></th>');
          } else {
            var dataIndex = hasRowHeader ? h - 1 : h;
            tableHtml.push('<th style="padding:8px;border:1px solid var(--color-border);background:rgba(99,102,241,0.06);' + headerStyle.join(";") + '">' + escapeHtml(headers[dataIndex] || ("Column " + (dataIndex + 1))) + "</th>");
          }
        }
        tableHtml.push("</tr></thead>");
      }

      tableHtml.push("<tbody>");
      for (var r = 0; r < rowCount; r++) {
        tableHtml.push("<tr>");
        if (hasRowHeader && showHeader) {
          tableHtml.push('<th style="padding:8px;border:1px solid var(--color-border);background:rgba(99,102,241,0.04);text-align:left;">' + escapeHtml(rowHeaders[r] || ("Row " + (r + 1))) + "</th>");
        }
        for (var cc = 0; cc < columnCount; cc++) {
          var cellName = field.name + "[" + r + "][" + cc + "]";
          var current = currentValue && currentValue[r] ? currentValue[r][cc] : "";
          tableHtml.push('<td style="padding:0;border:1px solid var(--color-border);">');
          tableHtml.push('<input class="fbsdk-input fbsdk-table-cell-input" style="border:0;border-radius:0;box-shadow:none;' + cellStyle.join(";") + '" type="text" data-table-field="' + escapeAttr(cellName) + '" data-field="' + escapeAttr(field.name) + '" value="' + escapeAttr(current || "") + '">');
          tableHtml.push("</td>");
        }
        tableHtml.push("</tr>");
      }
      tableHtml.push("</tbody>");
      tableHtml.push("</table>");
      tableHtml.push("</div>");
      tableHtml.push("</div>");

      return tableHtml.join("");
    }

    function renderField(field, currentValue) {
      var error = state.errors[field.name] || "";
      var helpText = field.helperText || field.subLabel || "";
      var attrs = [];
      var commonStyle = field.styles && typeof field.styles === "object" ? field.styles : {};
      Object.keys(commonStyle).forEach(function (key) {
        attrs.push(key + ":" + commonStyle[key]);
      });

      var labelHtml = field.label ? '<label class="fbsdk-label">' + escapeHtml(field.label) + (field.required ? '<span class="fbsdk-required">*</span>' : "") + '</label>' : "";
      var styleAttr = attrs.length ? ' style="' + attrs.join(";") + '"' : "";
      var type = field.type;

      if (type === "heading") {
        return '<div class="fbsdk-field"' + styleAttr + '><div class="fbsdk-page-title">' + escapeHtml(field.label || "Heading") + '</div></div>';
      }

      if (type === "textarea") {
        return [
          '<div class="fbsdk-field"' + styleAttr + '>',
          labelHtml,
          '<textarea class="fbsdk-textarea" data-field="' + escapeAttr(field.name) + '" rows="' + (field.rows || 4) + '" placeholder="' + escapeAttr(field.placeholder || "") + '">' + escapeHtml(currentValue || "") + '</textarea>',
          helpText ? '<div class="fbsdk-help">' + escapeHtml(helpText) + "</div>" : "",
          error ? '<div class="fbsdk-error">' + escapeHtml(error) + "</div>" : "",
          "</div>",
        ].join("");
      }

      if (type === "select") {
        var optionsHtml = ['<option value="">' + escapeHtml(field.placeholder || "Select...") + "</option>"]
          .concat((field.options || []).map(function (option) {
            var selected = String(currentValue || "") === String(option.value) ? ' selected' : "";
            return '<option value="' + escapeAttr(option.value) + '"' + selected + '>' + escapeHtml(option.label) + "</option>";
          }))
          .join("");
        return [
          '<div class="fbsdk-field"' + styleAttr + '>',
          labelHtml,
          '<select class="fbsdk-select" data-field="' + escapeAttr(field.name) + '">' + optionsHtml + "</select>",
          helpText ? '<div class="fbsdk-help">' + escapeHtml(helpText) + "</div>" : "",
          error ? '<div class="fbsdk-error">' + escapeHtml(error) + "</div>" : "",
          "</div>",
        ].join("");
      }

      if (type === "radio") {
        var radioOptions = (field.options || []).map(function (option) {
          var checked = String(currentValue || "") === String(option.value) ? " checked" : "";
          return '<label class="fbsdk-choice"><input type="radio" name="' + escapeAttr(field.name) + '" value="' + escapeAttr(option.value) + '"' + checked + ' data-field="' + escapeAttr(field.name) + '">' + escapeHtml(option.label) + "</label>";
        }).join("");
        return [
          '<div class="fbsdk-field"' + styleAttr + '>',
          labelHtml,
          '<div class="fbsdk-choice-group">' + radioOptions + "</div>",
          helpText ? '<div class="fbsdk-help">' + escapeHtml(helpText) + "</div>" : "",
          error ? '<div class="fbsdk-error">' + escapeHtml(error) + "</div>" : "",
          "</div>",
        ].join("");
      }

      if (type === "checkbox" && field.options && field.options.length) {
        var selectedValues = Array.isArray(currentValue) ? currentValue : [];
        var checkboxOptions = (field.options || []).map(function (option) {
          var checked = selectedValues.indexOf(option.value) !== -1 ? " checked" : "";
          return '<label class="fbsdk-choice"><input type="checkbox" data-field="' + escapeAttr(field.name) + '" value="' + escapeAttr(option.value) + '"' + checked + '>' + escapeHtml(option.label) + "</label>";
        }).join("");
        return [
          '<div class="fbsdk-field"' + styleAttr + '>',
          labelHtml,
          '<div class="fbsdk-choice-group">' + checkboxOptions + "</div>",
          helpText ? '<div class="fbsdk-help">' + escapeHtml(helpText) + "</div>" : "",
          error ? '<div class="fbsdk-error">' + escapeHtml(error) + "</div>" : "",
          "</div>",
        ].join("");
      }

      if (type === "checkbox") {
        var checkedSingle = currentValue ? " checked" : "";
        return [
          '<div class="fbsdk-field"' + styleAttr + '>',
          '<label class="fbsdk-choice"><input type="checkbox" data-field="' + escapeAttr(field.name) + '"' + checkedSingle + ">" + escapeHtml(field.label || "Checkbox") + "</label>",
          helpText ? '<div class="fbsdk-help">' + escapeHtml(helpText) + "</div>" : "",
          error ? '<div class="fbsdk-error">' + escapeHtml(error) + "</div>" : "",
          "</div>",
        ].join("");
      }

      if (type === "attachment" || type === "file") {
        return renderAttachmentField(field, currentValue);
      }

      if (type === "table") {
        return renderTableField(field, currentValue);
      }

      if (type === "file") {
        return [
          '<div class="fbsdk-field"' + styleAttr + '>',
          labelHtml,
          '<input class="fbsdk-input" type="file" data-field="' + escapeAttr(field.name) + '"' + (field.multiple ? ' multiple' : "") + (field.accept ? ' accept="' + escapeAttr(field.accept) + '"' : "") + ">",
          currentValue && (currentValue.name || (currentValue.length && currentValue[0] && currentValue[0].name)) ? '<div class="fbsdk-note">Selected: ' + escapeHtml(field.multiple && currentValue.length ? currentValue.length + " files" : (currentValue.name || currentValue[0].name)) + "</div>" : "",
          helpText ? '<div class="fbsdk-help">' + escapeHtml(helpText) + "</div>" : "",
          error ? '<div class="fbsdk-error">' + escapeHtml(error) + "</div>" : "",
          "</div>",
        ].join("");
      }

      if (type === "multiselect") {
        var selectedMulti = Array.isArray(currentValue) ? currentValue : [];
        var multiOptions = ['<select class="fbsdk-select" multiple data-field="' + escapeAttr(field.name) + '">']
          .concat((field.options || []).map(function (option) {
            var selected = selectedMulti.indexOf(option.value) !== -1 ? " selected" : "";
            return '<option value="' + escapeAttr(option.value) + '"' + selected + '>' + escapeHtml(option.label) + "</option>";
          }))
          .concat(["</select>"])
          .join("");
        return [
          '<div class="fbsdk-field"' + styleAttr + '>',
          labelHtml,
          multiOptions,
          helpText ? '<div class="fbsdk-help">' + escapeHtml(helpText) + "</div>" : "",
          error ? '<div class="fbsdk-error">' + escapeHtml(error) + "</div>" : "",
          "</div>",
        ].join("");
      }

      if (type === "rating") {
        var max = Number(field.max || 5);
        var stars = [];
        for (var i = 1; i <= max; i++) {
          var checkedStar = String(currentValue || "") === String(i) ? " checked" : "";
          stars.push('<label class="fbsdk-choice"><input type="radio" name="' + escapeAttr(field.name) + '" value="' + i + '"' + checkedStar + ' data-field="' + escapeAttr(field.name) + '">*</label>');
        }
        return [
          '<div class="fbsdk-field"' + styleAttr + '>',
          labelHtml,
          '<div class="fbsdk-choice-group">' + stars.join("") + "</div>",
          helpText ? '<div class="fbsdk-help">' + escapeHtml(helpText) + "</div>" : "",
          error ? '<div class="fbsdk-error">' + escapeHtml(error) + "</div>" : "",
          "</div>",
        ].join("");
      }

      var inputType = type === "email" || type === "number" || type === "date" ? type : "text";
      var valueAttr = currentValue !== undefined && currentValue !== null ? ' value="' + escapeAttr(currentValue) + '"' : "";
      return [
        '<div class="fbsdk-field"' + styleAttr + '>',
        labelHtml,
        '<input class="fbsdk-input" type="' + inputType + '" data-field="' + escapeAttr(field.name) + '" placeholder="' + escapeAttr(field.placeholder || "") + '"' + valueAttr + ">",
        helpText ? '<div class="fbsdk-help">' + escapeHtml(helpText) + "</div>" : "",
        error ? '<div class="fbsdk-error">' + escapeHtml(error) + "</div>" : "",
        "</div>",
      ].join("");
    }

    function renderPopup(schema, page) {
      var popupKey = page && page.id ? "PAGE_" + page.id : "FORM_GLOBAL";
      if (state.popupDismissed[popupKey]) return "";
      var shouldShow = (schema.showInstructionsPopup && schema.instructions) || (page && page.showInstructionsPopup && page.instructions);
      if (!shouldShow) return "";
      var text = (page && page.showInstructionsPopup && page.instructions) || schema.instructions || "Please read instructions carefully.";
      return [
        '<div class="fbsdk-overlay" data-action="dismiss-popup" data-popup-key="' + escapeAttr(popupKey) + '">',
        '<div class="fbsdk-modal" role="dialog" aria-modal="true">',
        "<h3>Instructions</h3>",
        "<p>" + escapeHtml(text) + "</p>",
        '<div class="fbsdk-modal-actions"><button type="button" class="fbsdk-btn fbsdk-btn-primary" data-action="dismiss-popup-button" data-popup-key="' + escapeAttr(popupKey) + '">Continue</button></div>',
        "</div>",
        "</div>",
      ].join("");
    }

    function render() {
      if (state.loading) {
        app.innerHTML = '<div class="fbsdk-loading">' + escapeHtml(options.loadingText || "Loading form...") + "</div>";
        schemaStyle.textContent = "";
        return;
      }

      if (state.error) {
        app.innerHTML = '<div class="fbsdk-error-panel">' + escapeHtml(options.errorText || state.error.message || "Unable to load form.") + "</div>";
        schemaStyle.textContent = "";
        return;
      }

      var schema = state.schema;
      if (!schema || !schema.pages || !schema.pages.length) {
        app.innerHTML = '<div class="fbsdk-error-panel">No form pages were found in the schema.</div>';
        schemaStyle.textContent = "";
        return;
      }

      schemaStyle.textContent = schema.globalCss || "";

      if (state.submitted) {
        app.innerHTML = [
          '<div class="fbsdk-card" style="' + themeVars(schema) + '">',
          '<div class="fbsdk-success">',
          "<h2>" + escapeHtml(schema.settings && schema.settings.successMessage ? schema.settings.successMessage : "Thanks! We will contact you.") + "</h2>",
          "</div>",
          "</div>",
        ].join("");
        return;
      }

      var page = schema.pages[state.pageIndex] || schema.pages[0];
      var progress = Math.round(((state.pageIndex + 1) / schema.pages.length) * 100);
      var groups = page.rows.map(function (row) {
        var colCount = Math.min(3, Math.max(1, row.fields.length));
        return '<div class="fbsdk-grid" data-cols="' + colCount + '">' + row.fields.map(function (field) {
          return renderField(field, getFieldValue(state, field));
        }).join("") + "</div>";
      }).join("");

      app.innerHTML = [
        '<div class="fbsdk-shell" style="' + themeVars(schema) + '">',
        '<div class="fbsdk-card" style="position:relative;">',
        '<form data-action="submit-form">',
        '<div class="fbsdk-header">',
        '<h2 class="fbsdk-title">' + escapeHtml(schema.title) + "</h2>",
        schema.pages.length > 1 ? '<div class="fbsdk-subtitle">Page ' + (state.pageIndex + 1) + " of " + schema.pages.length + "</div>" : "",
        '<div class="fbsdk-progress"><div class="fbsdk-progress-bar" style="width:' + progress + '%"></div></div>',
        "</div>",
        '<div class="fbsdk-body">',
        page.title ? '<div class="fbsdk-page-title">' + escapeHtml(page.title) + "</div>" : "",
        groups,
        '<div class="fbsdk-actions">',
        '<div>',
        state.pageIndex > 0 ? '<button type="button" class="fbsdk-btn fbsdk-btn-ghost" data-action="prev-page">' + escapeHtml(schema.settings && schema.settings.previousText ? schema.settings.previousText : "Previous") + "</button>" : "",
        "</div>",
        '<div>',
        state.pageIndex < schema.pages.length - 1 ? '<button type="button" class="fbsdk-btn fbsdk-btn-primary" data-action="next-page">' + escapeHtml(schema.settings && schema.settings.nextText ? schema.settings.nextText : "Next") + "</button>" : '<button type="submit" class="fbsdk-btn fbsdk-btn-primary">' + escapeHtml(schema.settings && schema.settings.submitText ? schema.settings.submitText : "Submit") + "</button>",
        "</div>",
        "</div>",
        "</div>",
        "</form>",
        state.isSubmitting ? '<div class="fbsdk-submit-overlay"><div class="fbsdk-submit-badge"><span class="fbsdk-spinner"></span><span>Submitting...</span></div></div>' : "",
        "</div>",
        renderPopup(schema, page),
        "</div>",
      ].join("");
    }

    function collectPageFields() {
      var schema = state.schema;
      var page = schema.pages[state.pageIndex] || schema.pages[0];
      return page.rows.reduce(function (acc, row) {
        return acc.concat(row.fields);
      }, []);
    }

    async function submitForm() {
      var schema = state.schema;
      var submitUrl = buildSubmitUrl(schema, options);
      var payload = {};
      var fileEntries = [];

      Object.keys(state.values).forEach(function (key) {
        var value = state.values[key];
        if (value instanceof FileList) {
          if (value.length === 1) {
            fileEntries.push({ fieldName: key, file: value[0] });
          } else {
            Array.prototype.forEach.call(value, function (file) {
              fileEntries.push({ fieldName: key, file: file });
            });
          }
        } else if (value instanceof File) {
          fileEntries.push({ fieldName: key, file: value });
        } else if (Array.isArray(value) && value.length && value[0] instanceof File) {
          value.forEach(function (file) {
            fileEntries.push({ fieldName: key, file: file });
          });
        } else {
          payload[key] = value;
        }
      });

      if (!submitUrl) {
        state.submitted = true;
        render();
        if (typeof options.onSubmitSuccess === "function") options.onSubmitSuccess(payload, null);
        if (typeof options.onSuccess === "function") options.onSuccess(payload, null);
        return;
      }

      state.isSubmitting = true;
      render();

      try {
        var response;
        if (fileEntries.length) {
          var formData = new FormData();
          formData.append("data", JSON.stringify({
            data: payload,
            fileFields: fileEntries.map(function (entry) { return entry.fieldName; }),
          }));
          fileEntries.forEach(function (entry) {
            formData.append(entry.fieldName, entry.file, entry.file.name);
          });
          response = await fetch(submitUrl, {
            method: "POST",
            body: formData,
          });
        } else {
          response = await fetch(submitUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: payload }),
          });
        }

        if (!response.ok) {
          throw new Error("Server returned " + response.status);
        }

        state.submitted = true;
        render();
        if (typeof options.onSubmitSuccess === "function") options.onSubmitSuccess(payload, response);
        if (typeof options.onSuccess === "function") options.onSuccess(payload, response);
      } finally {
        state.isSubmitting = false;
      }
    }

    function handleInput(event) {
      var target = event.target;
      if (!target || !target.getAttribute) return;
      var fieldName = target.getAttribute("data-field");
      if (!fieldName || !state.schema) return;
      var field = collectPageFields().filter(function (item) { return item.name === fieldName; })[0];
      if (!field) return;

      var tableCellPath = target.getAttribute("data-table-field");
      if (tableCellPath) {
        var match = tableCellPath.match(/^(.+)\[(\d+)\]\[(\d+)\]$/);
        if (match) {
          var rowIndex = Number(match[2]);
          var colIndex = Number(match[3]);
          var existing = state.values[field.name];
          var matrix = Array.isArray(existing) ? existing.map(function (row) {
            return Array.isArray(row) ? row.slice() : [];
          }) : [];
          while (matrix.length <= rowIndex) matrix.push([]);
          while (matrix[rowIndex].length <= colIndex) matrix[rowIndex].push("");
          matrix[rowIndex][colIndex] = target.value;
          setFieldValue(state, field, matrix);
          return;
        }
      }

      if (target.type === "checkbox" && field.options && field.options.length) {
        var checkedValues = [];
        var checkboxes = app.querySelectorAll('input[data-field="' + cssEscape(fieldName) + '"][type="checkbox"]');
        Array.prototype.forEach.call(checkboxes, function (checkbox) {
          if (checkbox.checked) checkedValues.push(checkbox.value);
        });
        setFieldValue(state, field, checkedValues);
        return;
      }

      if (target.type === "checkbox") {
        setFieldValue(state, field, !!target.checked);
        return;
      }

      if (target.type === "file") {
        setFieldValue(state, field, target.multiple ? Array.prototype.slice.call(target.files || []) : (target.files && target.files[0] ? target.files[0] : null));
        return;
      }

      if (target.tagName === "SELECT" && target.multiple) {
        var selected = Array.prototype.filter.call(target.options, function (opt) { return opt.selected; }).map(function (opt) { return opt.value; });
        setFieldValue(state, field, selected);
        return;
      }

      if (target.type === "radio") {
        setFieldValue(state, field, target.value);
        return;
      }

      if (target.tagName === "SELECT") {
        setFieldValue(state, field, target.value);
        return;
      }

      if (target.type === "number") {
        setFieldValue(state, field, target.value === "" ? "" : Number(target.value));
        return;
      }

      setFieldValue(state, field, target.value);
    }

    function handleSubmit(event) {
      event.preventDefault();
      var fields = collectPageFields();
      if (!validateFields(fields, state)) {
        render();
        return;
      }
      state.loading = false;
      submitForm().catch(function (error) {
        state.error = error;
        render();
        if (typeof options.onSubmitError === "function") options.onSubmitError(error);
        if (typeof options.onError === "function") options.onError(error);
      });
    }

    function handleClick(event) {
      var target = event.target;
      if (!target || !target.getAttribute) return;
      var action = target.getAttribute("data-action");
      if (!action) return;

      if (action === "next-page") {
        var fields = collectPageFields();
        if (!validateFields(fields, state)) {
          render();
          return;
        }
        if (state.pageIndex < state.schema.pages.length - 1) {
          state.pageIndex += 1;
          render();
        }
      }

      if (action === "prev-page") {
        state.pageIndex = Math.max(0, state.pageIndex - 1);
        render();
      }

      if (action === "dismiss-popup" || action === "dismiss-popup-button") {
        var key = target.getAttribute("data-popup-key");
        if (key) state.popupDismissed[key] = true;
        render();
      }
    }

    app.addEventListener("input", handleInput);
    app.addEventListener("change", handleInput);
    app.addEventListener("click", handleClick);
    app.addEventListener("submit", handleSubmit);

    function load(initial) {
      state.loading = true;
      render();
      Promise.resolve(initial)
        .then(function (schemaPayload) {
          state.schema = normalizeSchema(schemaPayload);
          state.loading = false;
          render();
          if (typeof options.onLoad === "function") {
            options.onLoad(schemaPayload);
          }
        })
        .catch(function (error) {
          state.error = error;
          state.loading = false;
          render();
          if (typeof options.onError === "function") {
            options.onError(error);
          }
        });
    }

    return {
      state: state,
      render: render,
      load: load,
      update: function (nextOptions) {
        options = Object.assign({}, options, nextOptions || {});
        render();
      },
      destroy: function () {
        app.removeEventListener("input", handleInput);
        app.removeEventListener("change", handleInput);
        app.removeEventListener("click", handleClick);
        app.removeEventListener("submit", handleSubmit);
        if (root.contains(schemaStyle)) root.removeChild(schemaStyle);
        if (root.contains(style)) root.removeChild(style);
        if (root.contains(app)) root.removeChild(app);
      },
    };
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function cssEscape(value) {
    if (global.CSS && typeof global.CSS.escape === "function") {
      return global.CSS.escape(value);
    }
    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function mount(target, options) {
    var element = resolveTarget(target);
    if (!element) {
      throw new Error("FormBuilderSDK.mount: target element was not found.");
    }

    var shadow = element.shadowRoot || (element.attachShadow ? element.attachShadow({ mode: "open" }) : element);
    var instance = createInstance(shadow, options || {});
    var schemaPromise = options && options.schemaUrl ? fetchSchema(options.schemaUrl, options) : Promise.resolve(options && options.schema ? options.schema : {});

    instance.load(schemaPromise);
    return instance;
  }

  function createFormBuilderSDK(defaultOptions) {
    var baseOptions = defaultOptions || {};
    return {
      mount: function (target, options) {
        return mount(target, Object.assign({}, baseOptions, options || {}));
      },
      render: function (target, options) {
        return mount(target, Object.assign({}, baseOptions, options || {}));
      },
      loadSchema: function (schemaUrl, requestOptions) {
        return fetchSchema(schemaUrl, requestOptions || {});
      },
      unmount: function (target) {
        var element = resolveTarget(target);
        if (!element) return;
        if (element.shadowRoot) {
          element.shadowRoot.innerHTML = "";
        } else {
          element.innerHTML = "";
        }
      },
    };
  }

  var FormBuilderSDK = createFormBuilderSDK();
  global.FormBuilderSDK = FormBuilderSDK;
})(window);
