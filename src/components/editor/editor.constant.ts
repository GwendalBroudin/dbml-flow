import { editor } from "monaco-editor";

export const EDITOR_CONFIG = {
  BUILD_DELAY: 1000,
  LANGUAGE: "dbml",
  THEME: "vs-dark",
};

export const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  selectOnLineNumbers: true,
  minimap: { enabled: false },
  bracketPairColorization: { enabled: true },
  automaticLayout: true,
  scrollBeyondLastLine: false,
  padding: { top: 10, bottom: 70 },
  suggest: {
    showFields: false,
    showFunctions: false,
  },
  wordWrap: "off",
  scrollbar: {
    vertical: "hidden",
    horizontal: "hidden",
  },
  colorDecorators: true,
};

export const StartupCode = `
  Table users {
    id int [pk, increment]
    name varchar
    age int
  }
  `;
