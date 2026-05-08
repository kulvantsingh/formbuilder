const apiProtocol = process.env.REACT_APP_FORMBUILDER_API_PROTOCOL || "https";
const apiHost =
  process.env.REACT_APP_FORMBUILDER_SERVER_IP ||
  process.env.REACT_APP_FORMBUILDER_API_HOST ||
  "10.208.22.169";
const apiPort = process.env.REACT_APP_FORMBUILDER_API_PORT || "8086";

const sdkProtocol = process.env.REACT_APP_FORMBUILDER_SDK_PROTOCOL || "http";
const sdkHost =
  process.env.REACT_APP_FORMBUILDER_SDK_HOST ||
  process.env.REACT_APP_FORMBUILDER_SDK_IP ||
  "10.208.22.183";
const sdkPort = process.env.REACT_APP_FORMBUILDER_SDK_PORT || "3001";

export const API_ORIGIN =
  process.env.REACT_APP_FORMBUILDER_API_BASE_URL ||
  `${apiProtocol}://${apiHost}:${apiPort}`;

export const SDK_ORIGIN =
  process.env.REACT_APP_FORMBUILDER_SDK_URL ||
  `${sdkProtocol}://${sdkHost}:${sdkPort}`;

export const FORMS_BASE_URL = `${API_ORIGIN.replace(/\/$/, "")}/forms`;
export const SUBMISSIONS_BASE_URL = `${API_ORIGIN.replace(/\/$/, "")}/submissions`;
export const SDK_SCRIPT_URL = `${SDK_ORIGIN.replace(/\/$/, "")}/formbuilder-sdk.js`;

export function buildFormSchemaUrl(formId) {
  if (formId === undefined || formId === null || formId === "") return "";
  return `${FORMS_BASE_URL}/${encodeURIComponent(String(formId))}`;
}

export function buildFormSubmitUrl(formId) {
  if (formId === undefined || formId === null || formId === "") return "";
  return `${FORMS_BASE_URL}/${encodeURIComponent(String(formId))}/submit`;
}

export function buildSubmissionListUrl(formId = "") {
  if (!formId) return SUBMISSIONS_BASE_URL;
  return `${SUBMISSIONS_BASE_URL}/form/${encodeURIComponent(String(formId))}`;
}
