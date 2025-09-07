import { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { parser } from "../dbml/node-dmbl.parser";

export const initDbmlFetaures = (
  editor: editor.IStandaloneCodeEditor,
  monaco: Monaco
) => {
  const { definitionProvider, referenceProvider, autocompletionProvider } =
    parser.DBMLCompiler.initMonacoServices();

  monaco.languages.registerCompletionItemProvider(
    "dbml",
    autocompletionProvider
  );

  monaco.languages.registerDefinitionProvider("dbml", definitionProvider);
  monaco.languages.registerReferenceProvider("dbml", referenceProvider);
};
