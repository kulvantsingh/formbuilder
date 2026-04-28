import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import BuilderFieldRenderer from "./BuilderFieldRenderer";
import { normalizeBuilderSchema } from "./builderRuntimeSchema";
import "./builderRuntime.css";

function buildGridContainerStyle(gridConfig) {
  if (!gridConfig) {
    return { display: "grid", gridTemplateColumns: "1fr", gap: "16px" };
  }
  return {
    display: "grid",
    gridTemplateColumns: (gridConfig.columns || ["1fr"]).join(" "),
    gap: gridConfig.gap || "16px",
  };
}

export default function BuilderFormRenderer({
  schema,
  onSubmit,
  onSubmitSuccess,
  onSubmitError,
  theme,
}) {
  const runtimeSchema = useMemo(() => normalizeBuilderSchema(schema), [schema]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState("");
  const [seenPopups, setSeenPopups] = useState(new Set());

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
  });

  const pages = runtimeSchema.pages || [];
  const currentPage = pages[currentPageIndex];
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === pages.length - 1;

  useEffect(() => {
    if (!currentPage) return;

    if (runtimeSchema.showInstructionsPopup && !seenPopups.has("FORM_GLOBAL")) {
      setPopupText(runtimeSchema.instructions || "Please read instructions carefully.");
      setShowPopup(true);
      setSeenPopups((prev) => new Set(prev).add("FORM_GLOBAL"));
      return;
    }

    if (currentPage.showInstructionsPopup && !seenPopups.has(`PAGE_${currentPage.id}`)) {
      setPopupText(currentPage.instructions || "Please read instructions carefully.");
      setShowPopup(true);
      setSeenPopups((prev) => new Set(prev).add(`PAGE_${currentPage.id}`));
    }
  }, [currentPageIndex, runtimeSchema, currentPage, seenPopups]);

  const handleNext = async (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    const pageFieldIds = currentPage.rows.flatMap((row) => row.fieldIds);
    const pageFields = pageFieldIds
      .map((fieldId) => runtimeSchema.fields.find((field) => field.id === fieldId))
      .filter(Boolean);
    const pageFieldNames = pageFields.map((field) => field.name).filter(Boolean);
    const isValid = await trigger(pageFieldNames);

    if (isValid) setCurrentPageIndex((value) => value + 1);
  };

  const handlePrev = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    setCurrentPageIndex((value) => Math.max(0, value - 1));
  };

  const handleFormSubmit = async (data) => {
    console.log("Submitted payload:", data);

    if (onSubmit) {
      onSubmit(data);
      return;
    }

    const submitUrl = runtimeSchema.settings?.submitUrl;
    if (!submitUrl) {
      setSubmitted(true);
      onSubmitSuccess?.(data, null);
      return;
    }

    setIsSubmitting(true);
    try {
      const formId = runtimeSchema.id || schema?.id || "form";
      let endpoint;

      if (submitUrl.includes("{id}")) {
        endpoint = submitUrl.replace("{id}", formId);
      } else if (submitUrl.endsWith("/submit")) {
        endpoint = submitUrl;
      } else {
        endpoint = `${submitUrl.replace(/\/$/, "")}/${formId}/submit`;
      }

      const plainData = {};
      const files = [];

      for (const [key, value] of Object.entries(data)) {
        if (value instanceof File) {
          files.push({ fieldName: key, file: value });
        } else if (value instanceof FileList) {
          Array.from(value).forEach((file) => files.push({ fieldName: key, file }));
        } else if (value && typeof value === "object" && value[0] instanceof File) {
          Array.from(value).forEach((file) => files.push({ fieldName: key, file }));
        } else {
          plainData[key] = value;
        }
      }

      let response;

      if (files.length > 0) {
        const formData = new FormData();

        formData.append("data", JSON.stringify(plainData));

        files.forEach(({ fieldName, file }) => {
          formData.append(fieldName, file, file.name);
        });

        response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(plainData),
        });
      }

      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      setSubmitted(true);
      onSubmitSuccess?.(data, response);
    } catch (error) {
      console.error("Builder form submission failed:", error);
      onSubmitError?.(error);
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentPage) return null;

  if (submitted) {
    return (
      <div className="builder-runtime" data-theme={theme}>
        <style dangerouslySetInnerHTML={{ __html: runtimeSchema.globalCss || "" }} />
        <div className="canvas-area">
          <div className="canvas-inner builder-success-card">
            <h2>{runtimeSchema.settings?.successMessage || "Thanks! We will contact you."}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-runtime" data-theme={theme}>
      <style dangerouslySetInnerHTML={{ __html: runtimeSchema.globalCss || "" }} />
      {showPopup && (
        <div
          className="builder-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="builder-modal-content"
            style={{
              background: "var(--color-bg, white)",
              padding: "32px",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
              color: "var(--color-text, black)",
              whiteSpace: "pre-wrap",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px", fontWeight: "bold" }}>
              Instructions
            </h3>
            <div style={{ marginBottom: "24px", lineHeight: "1.6", fontSize: "15px" }}>
              {popupText}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="builder-btn builder-btn-primary"
                onClick={() => setShowPopup(false)}
              >
                Acknowledge and Continue
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="canvas-area">
        <div className="canvas-inner">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="builder-header">
              <h2 className="builder-title">{runtimeSchema.title}</h2>
              {pages.length > 1 && (
                <>
                  <div className="builder-progress-row">
                    <span>{currentPage.title || `Page ${currentPageIndex + 1}`}</span>
                    <span>
                      Page {currentPageIndex + 1} of {pages.length}
                    </span>
                  </div>
                  <div className="builder-progress-track">
                    <div
                      className="builder-progress-bar"
                      style={{ width: `${((currentPageIndex + 1) / pages.length) * 100}%` }}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="builder-body">
              {currentPage.rows.map((row) => {
                const effectiveGrid = row.grid || currentPage.grid || runtimeSchema.grid;
                const rowFields = row.fieldIds
                  .map((fieldId) => runtimeSchema.fields.find((field) => field.id === fieldId))
                  .filter(Boolean);

                return (
                  <div key={row.id} style={{ ...buildGridContainerStyle(effectiveGrid), marginBottom: 16 }}>
                    {rowFields.map((field) => (
                      <BuilderFieldRenderer key={field.id} field={field} register={register} errors={errors} />
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="builder-actions">
              <div>
                {!isFirstPage && (
                  <button
                    key={`prev-${currentPageIndex}`}
                    type="button"
                    className="builder-btn builder-btn-ghost"
                    onClick={handlePrev}
                  >
                    {runtimeSchema.settings?.previousText || "Previous"}
                  </button>
                )}
              </div>
              <div>
                {!isLastPage ? (
                  <button
                    key={`next-${currentPageIndex}`}
                    type="button"
                    className="builder-btn builder-btn-primary"
                    onClick={handleNext}
                  >
                    {runtimeSchema.settings?.nextText || "Next"}
                  </button>
                ) : (
                  <button
                    key={`submit-${currentPageIndex}`}
                    type="submit"
                    className="builder-btn builder-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="builder-spinner"></span>
                    ) : (
                      runtimeSchema.settings?.submitText || "Submit"
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
