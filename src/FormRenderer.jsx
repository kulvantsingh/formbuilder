import React, { useState } from "react";
import { useForm } from "react-hook-form";
import FieldRenderer from "./FieldRenderer";

const FormRenderer = ({ schema }) => {
  const { register, handleSubmit, watch, setValue, trigger, formState: { errors, isValid } } = useForm({
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

      // Dynamically extract the email from the form data
      let extractedEmail = "";
      innerSchema.pages?.forEach(p => p.fields?.forEach(f => {
        const labelText = typeof f.label === 'object' ? f.label.text : f.label;
        const isEmailField = f.type === "email" || (labelText && labelText.toLowerCase().includes("email"));

        if (isEmailField && payload[f.id] && !extractedEmail) {
          extractedEmail = payload[f.id];
        }
      }));

      // Ensure 'email' is literally the first mapped property in the JSON object
      // Place the explicit email key inside the data block as the first element
      const finalPayload = {
        data: {
          email: extractedEmail || "unknown@example.com",
          ...payload
        }
      };

      console.log("Preparing to submit payload:", finalPayload);

      // Dynamically map runtime ID onto the configured base URL
      let endpoint;
      if (settings.submitUrl && settings.submitUrl.includes("{id}")) {
        endpoint = settings.submitUrl.replace("{id}", schema.id || schema.formId || "123");
      } else if (settings.submitUrl && settings.submitUrl.endsWith("/submit")) {
        endpoint = settings.submitUrl;
      } else {
        const baseUrl = settings.submitUrl || "http://10.208.22.169:8086/forms";
        endpoint = `${baseUrl.replace(/\/$/, "")}/${schema.id || schema.formId || "123"}/submit`;
      }

      console.log("Submitting to endpoint:", endpoint);
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
    // Intercept native form submit (e.g. from pressing Enter)
    if (pageIndex < totalPages - 1) {
      await handleNextClick();
    } else {
      await onFinalSubmit(data);
    }
  };

  const handleNextClick = async () => {
    const visibleFields = currentPage.fields.filter(isVisible).map((f) => f.id);
    console.log("Validating fields:", visibleFields);
    const isPageValid = await trigger(visibleFields);
    console.log("isPageValid:", isPageValid, "errors:", errors);

    if (isPageValid) {
      setPageIndex((i) => i + 1);
    }
  };

  const toggleMultiSelect = (fieldId, option) => {
    setMultiSelects((prev) => {
      const current = prev[fieldId] || [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
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
              <div className="form-success-icon">🎉</div>
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
      {/* Inject global styles from JSON */}
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
              {pages.map((_, i) => (
                <div key={i} className={`form-step-dot ${i === pageIndex ? "active" : ""}`} />
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
                  <button type="button" className="btn btn-secondary" onClick={() => setPageIndex((i) => i - 1)}>
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
                    ✓ {settings.submitText || "Submit"}
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

export default FormRenderer;
