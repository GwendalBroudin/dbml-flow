import { Editor, OnMount } from "@monaco-editor/react";
import * as _ from "lodash-es";
import React, { useCallback, useEffect } from "react";
import { EDITOR_CONFIG, EDITOR_OPTIONS } from "./editor.constant";

import useStore from "@/state/store";

const DBMLEditor: React.FC = () => {
  const {
    code,
    globalError,
    setCode,
    setEditorModel,
    parseDBML,
    setEditorTextFocus,
  } = useStore();

  // Editor mount handler
  const handleEditorMount: OnMount = useCallback(
    (editor) => {
      setEditorModel(editor.getModel());
      editor.onDidFocusEditorText(() => setEditorTextFocus(true));
      editor.onDidBlurEditorText(() => setEditorTextFocus(false));
    },
    [setEditorModel]
  );

  // Code change handler with debounce
  const handleCodeChange = useCallback(
    _.debounce((newValue: string | undefined) => {
      const updatedCode = newValue || "";
      setCode(updatedCode);
      parseDBML(updatedCode);
    }, EDITOR_CONFIG.BUILD_DELAY),
    [parseDBML, setCode]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      handleCodeChange.cancel();
    };
  }, [handleCodeChange]);

  return (
    <div className="flex flex-col h-full">
      <GlobalErrorMessage error={globalError} />
      <Editor
        onMount={handleEditorMount}
        onChange={handleCodeChange}
        defaultLanguage={EDITOR_CONFIG.LANGUAGE}
        value={code}
        theme={EDITOR_CONFIG.THEME}
        className="flex-1"
        options={EDITOR_OPTIONS}
      />
    </div>
  );
};

const GlobalErrorMessage: React.FC<{ error: any }> = ({ error }) => {
  const message = error?.message ?? error?.toString();
  console.log("Rendering GlobalErrorMessage", error);
  return message ? (
    <div className="p-2 bg-red-400 text-white flex-auto shrink-0 max-h-16 overflow-y-auto break-words">
      <p>{message}</p>
    </div>
  ) : null;
};

export default DBMLEditor;
