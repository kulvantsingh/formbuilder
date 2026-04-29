const DEFAULT_GRID = {
  columns: ["1fr", "1fr"],
  gap: "16px",
};

const BUILDER_FIELD_TYPES = new Set([
  "heading",
  "text",
  "textarea",
  "number",
  "select",
  "checkbox",
  "radio",
  "date",
  "attachment",
  "file",
  "table",
  "multiselect",
  "rating",
]);

function createRow(fieldIds = []) {
  return {
    id: `row_${Math.random().toString(36).slice(2, 10)}`,
    grid: null,
    fieldIds,
  };
}

function normalizeField(field, index, seenIds) {
  if (!field || !BUILDER_FIELD_TYPES.has(field.type)) return null;

  let id = field.id || `field_${Math.random().toString(36).slice(2, 10)}`;
  while (seenIds.has(id)) id = `field_${Math.random().toString(36).slice(2, 10)}`;
  seenIds.add(id);

  const label =
    typeof field.label === "object" && field.label !== null
      ? {
          text: field.label.text || "Field",
          html: field.label.html || undefined,
          position: field.label.position || "top",
        }
      : { text: field.label || `Field ${index + 1}`, position: "top" };

  return {
    ...field,
    id,
    name: field.name || `${field.type}_${id.slice(6)}`,
    label,
    styles: { ...(field.styles || {}) },
    validation: {
      ...(field.validation || {}),
      messages: { ...(field.validation?.messages || {}) },
    },
  };
}

function buildRowsFromFields(fields, columnCount) {
  if (!fields.length) return [createRow()];

  const hasGridRows = fields.some((field) => field.gridPosition?.rowStart);
  if (hasGridRows) {
    const groups = new Map();
    fields.forEach((field) => {
      const rowKey = Number(field.gridPosition?.rowStart || 1);
      if (!groups.has(rowKey)) groups.set(rowKey, []);
      groups.get(rowKey).push(field);
    });

    return [...groups.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, rowFields]) =>
        createRow(
          rowFields
            .sort((a, b) => Number(a.gridPosition?.colStart || 0) - Number(b.gridPosition?.colStart || 0))
            .map((field) => field.id)
        )
      );
  }

  const perRow = Math.max(1, Number(columnCount) || 1);
  const rows = [];
  for (let i = 0; i < fields.length; i += perRow) {
    rows.push(createRow(fields.slice(i, i + perRow).map((field) => field.id)));
  }
  return rows;
}

function normalizeRowsFromNestedFields(rows, pageIndex, seenIds, collectedFields) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [createRow()];
  }

  return rows.map((row, rowIndex) => {
    const rowFields = (row.fields || [])
      .map((field, fieldIndex) => normalizeField(field, fieldIndex, seenIds))
      .filter(Boolean);

    collectedFields.push(...rowFields);

    return {
      id: row.id || `row_${pageIndex + 1}_${rowIndex + 1}`,
      grid: row.grid || null,
      fieldIds: rowFields.map((field) => field.id),
    };
  });
}

export function isBuilderSchema(payload) {
  const source = payload?.schema ?? payload;
  if (!source || !Array.isArray(source.pages)) return false;
  return source.pages.some((page) => Array.isArray(page.rows) || Array.isArray(page.fields));
}

export function resolveSchemaFormId(payload) {
  const outer = payload?.schema ? payload : { schema: payload };
  const source = outer.schema || {};
  const settings = source.settings || outer.settings || {};

  return (
    source.formId ||
    outer.formId ||
    settings.formId ||
    settings.formIdentifier ||
    source.id ||
    outer.id ||
    payload?.id ||
    "form"
  );
}

export function normalizeBuilderSchema(payload) {
  const outer = payload?.schema ? payload : { schema: payload };
  const source = outer.schema || {};
  const seenIds = new Set();

  const theme = source.theme || {};
  const settings = source.settings || outer.settings || {};
  const globalCss = source.globalCss || outer.globalCss || "";
  const grid = source.grid?.columns?.length ? source.grid : DEFAULT_GRID;
  const title = source.title || outer.name || payload?.name || "Untitled Form";
  const formId = resolveSchemaFormId(payload);

  if (Array.isArray(source.fields) && source.pages?.every((page) => Array.isArray(page.rows))) {
    const fields = source.fields
      .map((field, index) => normalizeField(field, index, seenIds))
      .filter(Boolean);
    const validFieldIds = new Set(fields.map((field) => field.id));

    return {
      id: outer.id || payload?.id || source.id || formId,
      formId,
      title,
      theme,
      settings,
      globalCss,
      grid,
      instructions: source.instructions,
      showInstructionsPopup: source.showInstructionsPopup,
      fields,
      pages: source.pages.map((page, pageIndex) => ({
        id: page.id || `page_${pageIndex + 1}`,
        title: page.title || `Page ${pageIndex + 1}`,
        grid: page.grid || null,
        instructions: page.instructions,
        showInstructionsPopup: page.showInstructionsPopup,
        rows: page.rows.length > 0
          ? page.rows.map((row) => ({
              id: row.id || `row_${pageIndex + 1}_${Math.random().toString(36).slice(2, 8)}`,
              grid: row.grid || null,
              fieldIds: (row.fieldIds || []).filter((fieldId) => validFieldIds.has(fieldId)),
            }))
          : [createRow()],
      })),
    };
  }

  if (source.pages?.some((page) => Array.isArray(page.rows))) {
    const fields = [];
    const pages = source.pages.map((page, pageIndex) => ({
      id: page.id || `page_${pageIndex + 1}`,
      title: page.title || `Page ${pageIndex + 1}`,
      grid: page.grid || null,
      instructions: page.instructions,
      showInstructionsPopup: page.showInstructionsPopup,
      rows: normalizeRowsFromNestedFields(page.rows, pageIndex, seenIds, fields),
    }));

    return {
      id: outer.id || payload?.id || source.id || formId,
      formId,
      title,
      theme,
      settings,
      globalCss,
      grid,
      instructions: source.instructions,
      showInstructionsPopup: source.showInstructionsPopup,
      fields,
      pages,
    };
  }

  const fields = [];
  const pages = (source.pages || []).map((page, pageIndex) => {
    const pageFields = (page.fields || [])
      .map((field, index) => normalizeField(field, index, seenIds))
      .filter(Boolean);

    fields.push(...pageFields);

    return {
      id: page.id || `page_${pageIndex + 1}`,
      title: page.title || `Page ${pageIndex + 1}`,
      grid: page.grid || null,
      instructions: page.instructions,
      showInstructionsPopup: page.showInstructionsPopup,
      rows: buildRowsFromFields(pageFields, grid.columns?.length),
    };
  });

  return {
    id: outer.id || payload?.id || source.id || formId,
    formId,
    title,
    theme,
    settings,
    globalCss,
    grid,
    instructions: source.instructions,
    showInstructionsPopup: source.showInstructionsPopup,
    fields,
    pages,
  };
}
