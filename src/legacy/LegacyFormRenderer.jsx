import React, { useState } from "react";
import { useForm } from "react-hook-form";
import FieldRenderer from "../FieldRenderer";

const LegacyFormRenderer = ({ schema }) => {
  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
    mode: "all"
  });
  const values = watch();
  const [pageIndex, setPageIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [multiSelects, setMultiSelects] = useState({});

  const innerSchema = schema?.schema ? schema.schema : schema;
  const { theme = {}, layout = {}, settings = {}, pages = [] } = innerSchema;
  const globalCss =
    innerSchema?.globalCss ||
    innerSchema?.globalCSS ||
    innerSchema?.css ||
    innerSchema?.customCss ||
    schema?.globalCss ||
    schema?.globalCSS ||
    schema?.css ||
    schema?.customCss ||
    "";
  const totalPages = pages.length;
  const currentPage = pages[pageIndex] || { fields: [] };
  const progress = totalPages > 0 ? Math.round(((pageIndex + 1) / totalPages) * 100) : 0;

  const themeStyle = {
    "--primary": theme.primaryColor || "#4F46E5",
    "--bg": theme.backgroundColor || "#F3F4F8",
    fontFamily: theme.fontFamily ? `'${theme.fontFamily}', Inter, sans-serif` : undefined,
  };

  const isVisible = (field) => {
    if (!field.conditions || field.conditions.length === 0) return true;
    return field.conditions.every((c) => values[c.field] === c.value);
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  const onFinalSubmit = async (data) => {
    const payload = { ...data, ...multiSelects };

    try {
      for (const [key, value] of Object.entries(payload)) {
        if (value instanceof File) {
          payload[key] = {
            filename: value.name,
            type: value.type,
            size: value.size,
            data: await fileToBase64(value)
          };
        }
      }

      let extractedEmail = "";
      innerSchema.pages?.forEach((page) => page.fields?.forEach((field) => {
        const labelText = typeof field.label === "object" ? field.label.text : field.label;
        const isEmailField = field.type === "email" || (labelText && labelText.toLowerCase().includes("email"));

        if (isEmailField && payload[field.id] && !extractedEmail) {
          extractedEmail = payload[field.id];
        }
      }));

      const finalPayload = {
        data: {
          email: extractedEmail || "unknown@example.com",
          ...payload
        }
      };

      let endpoint;
      if (settings.submitUrl && settings.submitUrl.includes("{id}")) {
        endpoint = settings.submitUrl.replace("{id}", schema.id || schema.formId || "123");
      } else if (settings.submitUrl && settings.submitUrl.endsWith("/submit")) {
        endpoint = settings.submitUrl;
      } else {
        const baseUrl = settings.submitUrl || "http://10.208.22.169:8086/forms";
        endpoint = `${baseUrl.replace(/\/$/, "")}/${schema.id || schema.formId || "123"}/submit`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Submission failed. Ensure the backend is running.");
    }
  };

  const processFormAction = async (data) => {
    if (pageIndex < totalPages - 1) {
      await handleNextClick();
    } else {
      await onFinalSubmit(data);
    }
  };

  const handleNextClick = async () => {
    const visibleFields = currentPage.fields.filter(isVisible).map((field) => field.id);
    const isPageValid = await trigger(visibleFields);

    if (isPageValid) {
      setPageIndex((value) => value + 1);
    }
  };

  const toggleMultiSelect = (fieldId, option) => {
    setMultiSelects((prev) => {
      const current = prev[fieldId] || [];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [fieldId]: next };
    });
  };

  if (submitted) {
    return (
      <div className="form-page-wrapper" style={themeStyle}>
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
        <div className="form-page canvas-area">
          <div className="form-card">
            <div className="form-success">
              <div className="form-success-icon">Success</div>
              <h3>{settings.successMessage || "Thank you!"}</h3>
              <p>Your response has been recorded successfully.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page-wrapper" style={themeStyle}>
      <style dangerouslySetInnerHTML={{ __html: globalCss }} />

      <div className="form-page canvas-area">
        <div className="form-card">
          <div className="form-header">
            <div className="form-title">{schema.name}</div>
            <div className="form-page-title">
              Step {pageIndex + 1} of {totalPages} · {currentPage.title}
            </div>
          </div>

          <div className="form-progress">
            <div className="form-steps">
              {pages.map((_, index) => (
                <div key={index} className={`form-step-dot ${index === pageIndex ? "active" : ""}`} />
              ))}
            </div>
            <div className="form-progress-label">{progress}% complete</div>
            <div className="form-progress-bar-wrap">
              <div className="form-progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="form-body">
            <form onSubmit={handleSubmit(processFormAction)}>
              <div className={layout.type === "2-column" ? "form-grid" : ""}>
                {currentPage.fields.map((field) =>
                  isVisible(field) ? (
                    <FieldRenderer
                      key={field.id}
                      field={field}
                      register={register}
                      setValue={setValue}
                      error={errors[field.id]}
                      currentValue={values[field.id]}
                      multiSelects={multiSelects}
                      onToggleMultiSelect={toggleMultiSelect}
                    />
                  ) : null
                )}
              </div>

              <div className="form-actions">
                {pageIndex > 0 ? (
                  <button type="button" className="btn btn-secondary" onClick={() => setPageIndex((value) => value - 1)}>
                    ← {settings.previousText || "Previous"}
                  </button>
                ) : (
                  <span className="btn-spacer" />
                )}

                {pageIndex < totalPages - 1 ? (
                  <button type="button" className="btn btn-primary" onClick={handleNextClick}>
                    {settings.nextText || "Next"} →
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary">
                    {settings.submitText || "Submit"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegacyFormRenderer;
