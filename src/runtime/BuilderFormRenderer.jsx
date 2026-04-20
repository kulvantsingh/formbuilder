import React, { useMemo, useState } from "react";
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

export default function BuilderFormRenderer({ schema, onSubmit }) {
  const runtimeSchema = useMemo(() => normalizeBuilderSchema(schema), [schema]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

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
    if (onSubmit) {
      onSubmit(data);
      console.log("Form submitted with data:", data);
      return;
    }

    const submitUrl = runtimeSchema.settings?.submitUrl;
    if (!submitUrl) {
      setSubmitted(true);
      return;
    }

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

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      setSubmitted(true);
    } catch (error) {
      console.error("Builder form submission failed:", error);
      alert("Submission failed. Please try again.");
    }
  };

  if (!currentPage) return null;

  if (submitted) {
    return (
      <div className="builder-runtime">
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
    <div className="builder-runtime">
      <style dangerouslySetInnerHTML={{ __html: runtimeSchema.globalCss || "" }} />
      <div className="canvas-area">
        <div className="canvas-inner">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="builder-header">
              <h2 className="builder-title">{runtimeSchema.title}</h2>
              {pages.length > 1 && (
                <>
                  <div className="builder-progress-row">
                    <span>{currentPage.title || `Step ${currentPageIndex + 1}`}</span>
                    <span>Step {currentPageIndex + 1} of {pages.length}</span>
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
                const effectiveGrid = row.grid || runtimeSchema.grid;
                const rowFields = row.fieldIds
                  .map((fieldId) => runtimeSchema.fields.find((field) => field.id === fieldId))
                  .filter(Boolean);

                return (
                  <div key={row.id} style={{ ...buildGridContainerStyle(effectiveGrid), marginBottom: 16 }}>
                    {rowFields.map((field) => (
                      <BuilderFieldRenderer
                        key={field.id}
                        field={field}
                        register={register}
                        errors={errors}
                      />
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
                  >
                    {runtimeSchema.settings?.submitText || "Submit"}
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
