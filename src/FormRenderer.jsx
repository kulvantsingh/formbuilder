import React from "react";
import LegacyFormRenderer from "./legacy/LegacyFormRenderer";
import BuilderFormRenderer from "./runtime/BuilderFormRenderer";
import { isBuilderSchema } from "./runtime/builderRuntimeSchema";

const FormRenderer = (props) => {
  if (isBuilderSchema(props.schema)) {
    return <BuilderFormRenderer {...props} />;
  }

  return <LegacyFormRenderer {...props} />;
};

export default FormRenderer;
