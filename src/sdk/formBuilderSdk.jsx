import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import FormRenderer from "../FormRenderer";
import { normalizeBuilderSchema } from "../runtime/builderRuntimeSchema";

const mountedRoots = new Map();

function resolveTarget(target) {
  if (!target) return null;
  if (typeof target === "string") {
    return document.querySelector(target);
  }
  return target;
}

function ensureEndpoint(baseUrl, formId) {
  if (!baseUrl) return "";
  if (baseUrl.includes("{id}")) {
    return baseUrl.replace("{id}", formId);
  }
  if (baseUrl.endsWith("/submit")) {
    return baseUrl;
  }
  return `${baseUrl.replace(/\/$/, "")}/${formId}/submit`;
}

async function fetchSchema(schemaUrl, requestOptions = {}) {
  const response = await fetch(schemaUrl, {
    method: "GET",
    mode: "cors",
    credentials: requestOptions.credentials || "omit",
    headers: requestOptions.headers || {},
  });

  if (!response.ok) {
    throw new Error(`Failed to load schema: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Schema response was not valid JSON");
  }
}

function unwrapSchemaPayload(payload) {
  if (!payload) return payload;
  if (payload.schema) return payload.schema;
  if (payload.data?.schema) return payload.data.schema;
  if (payload.data) return payload.data;
  return payload;
}

function prepareSchema(schema, options) {
  const normalized = normalizeBuilderSchema(schema);
  const submitUrl =
    options.submitUrl ||
    normalized.settings?.submitUrl ||
    (options.submitBaseUrl ? ensureEndpoint(options.submitBaseUrl, normalized.id || schema?.id || "form") : "");

  return {
    ...normalized,
    theme: {
      ...(normalized.theme || {}),
      ...(options.theme || {}),
    },
    settings: {
      ...(normalized.settings || {}),
      ...(options.settings || {}),
      ...(submitUrl ? { submitUrl } : {}),
    },
    globalCss: options.globalCss || normalized.globalCss || "",
  };
}

function EmbeddedForm({
  schema,
  schemaUrl,
  submitUrl,
  submitBaseUrl,
  headers,
  credentials,
  theme,
  settings,
  globalCss,
  loadingFallback = "Loading form...",
  errorFallback = "Unable to load form.",
  onLoad,
  onError,
  onSuccess,
  onSubmitSuccess,
  onSubmitError,
}) {
  const [remoteSchema, setRemoteSchema] = useState(schema || null);
  const [loading, setLoading] = useState(!schema);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!schemaUrl && schema) {
      setRemoteSchema(schema);
      setLoading(false);
      setError(null);
    }
  }, [schemaUrl, schema]);

  useEffect(() => {
    let alive = true;

    if (!schemaUrl) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    fetchSchema(schemaUrl, { headers, credentials })
      .then((payload) => {
        if (!alive) return;
        setRemoteSchema(unwrapSchemaPayload(payload));
        onLoad?.(payload);
      })
      .catch((loadError) => {
        if (!alive) return;
        setError(loadError);
        onError?.(loadError);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [schemaUrl, headers, credentials, onLoad, onError]);

  const resolvedSchema = useMemo(() => {
    const source = remoteSchema || schema;
    if (!source) return null;

    return prepareSchema(source, {
      submitUrl,
      submitBaseUrl,
      theme,
      settings,
      globalCss,
    });
  }, [remoteSchema, schema, submitUrl, submitBaseUrl, theme, settings, globalCss]);

  if (loading) {
    return <div className="builder-runtime">{loadingFallback}</div>;
  }

  if (error) {
    return <div className="builder-runtime">{errorFallback}</div>;
  }

  if (!resolvedSchema) {
    return <div className="builder-runtime">{errorFallback}</div>;
  }

  return (
    <FormRenderer
      schema={resolvedSchema}
      theme={theme}
      onSubmitSuccess={onSubmitSuccess || onSuccess}
      onSubmitError={onSubmitError}
    />
  );
}

function mount(target, options = {}) {
  const element = resolveTarget(target);
  if (!element) {
    throw new Error("FormBuilderSDK.mount: target element was not found.");
  }

  const root = mountedRoots.get(element) || createRoot(element);
  const renderOptions = { ...options };

  root.render(<EmbeddedForm {...renderOptions} />);
  mountedRoots.set(element, root);

  return {
    update(nextOptions = {}) {
      root.render(<EmbeddedForm {...renderOptions} {...nextOptions} />);
    },
    destroy() {
      root.unmount();
      mountedRoots.delete(element);
    },
  };
}

function unmount(target) {
  const element = resolveTarget(target);
  if (!element) return;

  const root = mountedRoots.get(element);
  if (!root) return;

  root.unmount();
  mountedRoots.delete(element);
}

export function createFormBuilderSDK(defaultOptions = {}) {
  return {
    mount: (target, options = {}) => mount(target, { ...defaultOptions, ...options }),
    render: (target, options = {}) => mount(target, { ...defaultOptions, ...options }),
    unmount,
    loadSchema: (schemaUrl, requestOptions = {}) => fetchSchema(schemaUrl, requestOptions),
  };
}

const FormBuilderSDK = createFormBuilderSDK();

if (typeof window !== "undefined") {
  window.FormBuilderSDK = FormBuilderSDK;
}

export { EmbeddedForm, fetchSchema, prepareSchema, ensureEndpoint };
export default FormBuilderSDK;
