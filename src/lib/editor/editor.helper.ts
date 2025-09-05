import type {
  CompilerDiagnostic,
  CompilerError,
} from "@dbml/core/types/parse/error";

import * as monaco from "monaco-editor";

// Format the error into a Monaco-compatible structure
export const formatDiagnosticsForMonaco = (e: CompilerError) => {
  return e.diags?.map(formatDiagnostic);
};

function formatDiagnostic(d: CompilerDiagnostic) {
  const errorLocationStart = d.location.start;
  const errorLocationEnd = d.location.end;

  return {
    startLineNumber: errorLocationStart.line,
    startColumn: errorLocationStart.column,
    endLineNumber: errorLocationEnd?.line ?? errorLocationStart.line,
    endColumn: errorLocationEnd?.column ?? errorLocationStart.column,
    message: d.message,
    severity: monaco.MarkerSeverity.Error,
  };
}
