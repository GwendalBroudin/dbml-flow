import { initDbmlFetaures } from "@/lib/monaco/init-dbml-feature";
import { Editor, OnMount } from "@monaco-editor/react";
import * as _ from "lodash-es";
import React, { useCallback, useEffect } from "react";
import { EDITOR_CONFIG, EDITOR_OPTIONS } from "./editor.constant";

import { cn } from "@/lib/utils";
import useStore from "@/state/store";

const DBMLEditor: React.FC<{ className?: string }> = ({ className }) => {
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
    (editor, monaco) => {
      setEditorModel(editor.getModel());
      initDbmlFetaures(editor, monaco);
      editor.onDidFocusEditorText(() => setEditorTextFocus(true));
      editor.onDidBlurEditorText(() => setEditorTextFocus(false));
    },
    [setEditorModel, setEditorTextFocus],
  );

  // Code change handler with debounce
  const handleCodeChange = useCallback(
    _.debounce((newValue: string | undefined) => {
      const updatedCode = newValue || "";
      setCode(updatedCode);
      parseDBML(updatedCode);
    }, EDITOR_CONFIG.BUILD_DELAY),
    [parseDBML, setCode],
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      handleCodeChange.cancel();
    };
  }, [handleCodeChange]);

  return (
    <div className={cn("dbml-editor flex flex-col h-full", className)}>
      <GlobalErrorMessage error={globalError} />
      <div className="flex-1 min-h-0">
        <Editor
          onMount={handleEditorMount}
          onChange={handleCodeChange}
          defaultLanguage={EDITOR_CONFIG.LANGUAGE}
          value={code}
          theme={EDITOR_CONFIG.THEME}
          options={EDITOR_OPTIONS}
        />
      </div>
    </div>
  );
};

const GlobalErrorMessage: React.FC<{ error: any }> = ({ error }) => {
  const message = error?.message ?? error?.toString();
  return message ? (
    <div className="p-2 bg-red-400 text-white flex-auto shrink-0 max-h-16 overflow-y-auto break-words">
      <p>{message}</p>
    </div>
  ) : null;
};

export default DBMLEditor;
