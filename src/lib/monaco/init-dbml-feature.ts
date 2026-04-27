import { Monaco } from "@monaco-editor/react";
import { editor, languages } from "monaco-editor";
import { parser } from "../dbml/node-dmbl.parser";

let hasRegisteredDbmlFeatures = false;

const toHexByte = (value: number) => {
  const clamped = Math.max(0, Math.min(255, Math.round(value * 255)));
  return clamped.toString(16).padStart(2, "0").toUpperCase();
};

export const initDbmlFetaures = (
  _editor: editor.IStandaloneCodeEditor,
  monaco: Monaco
) => {
  if (hasRegisteredDbmlFeatures) {
    return;
  }

  const { definitionProvider, referenceProvider, autocompletionProvider } =
    parser.DBMLCompiler.initMonacoServices();

  monaco.languages.registerCompletionItemProvider(
    "dbml",
    autocompletionProvider
  );

  monaco.languages.registerDefinitionProvider("dbml", definitionProvider);
  monaco.languages.registerReferenceProvider("dbml", referenceProvider);

  monaco.languages.registerColorProvider("dbml", {
    provideDocumentColors(model: editor.ITextModel) {
      const colorMatches = [
        ...model.getValue().matchAll(/#[A-Fa-f0-9]{6}(?:[A-Fa-f0-9]{2})?/g),
      ] as RegExpMatchArray[];

      return colorMatches.map((match) => {
        const matchText = match[0];
        const rgbHex = matchText.slice(1, 7);
        const red = Number.parseInt(rgbHex.slice(0, 2), 16) / 255;
        const green = Number.parseInt(rgbHex.slice(2, 4), 16) / 255;
        const blue = Number.parseInt(rgbHex.slice(4, 6), 16) / 255;
        const startOffset = match.index ?? 0;
        const endOffset = startOffset + matchText.length;
        const startPosition = model.getPositionAt(startOffset);
        const endPosition = model.getPositionAt(endOffset);

        return {
          color: { red, green, blue, alpha: 1 },
          range: new monaco.Range(
            startPosition.lineNumber,
            startPosition.column,
            endPosition.lineNumber,
            endPosition.column
          ),
        };
      });
    },
    provideColorPresentations(
      _model: editor.ITextModel,
      colorInfo: languages.IColorInformation
    ) {
      const { red, green, blue } = colorInfo.color;
      const hexColor = `#${toHexByte(red)}${toHexByte(green)}${toHexByte(blue)}`;

      return [
        {
          label: hexColor,
          textEdit: {
            range: colorInfo.range,
            text: hexColor,
          },
        },
      ];
    },
  });

  hasRegisteredDbmlFeatures = true;
};
