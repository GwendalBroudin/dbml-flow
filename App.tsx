import "@xyflow/react/dist/style.css";

import Editor, { Monaco } from "@monaco-editor/react";
import { ReactFlowProvider } from "@xyflow/react";
import { editor } from "monaco-editor";
import React, { useCallback } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import RearrangeButton from "./src/components/controls/rearrange-button";
import { initDbmlFetaures } from "./src/lib/monaco/init-dbml-feature"; // Import the function from the appropriate file
import { getTestDbml } from "./src/lib/dbml/parser";
import Viewer from "./src/components/viewer/viewer";
import useStore from "./src/state/store";
import DBMLEditor from "./src/components/editor/editor";

function App() {

  return (
      <div className="flex flex-col h-screen">
        <nav className="bg-primary">nav</nav>
        <PanelGroup direction="horizontal">
          <Panel defaultSize={30} minSize={20}>
            <DBMLEditor/>
          </Panel>
          <PanelResizeHandle />

          <Panel minSize={40}>
            <Viewer />
          </Panel>
        </PanelGroup>
      </div>
  );
}

export default App;
