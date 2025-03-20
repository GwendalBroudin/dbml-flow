import "@xyflow/react/dist/style.css";

import React, { useEffect } from "react";
import Flow from "./src/pages/flow";
import { getNodesAndEdges } from "./src/lib/dbml/parser";
import useStore from "./src/state/store";
import RearrangeButton from "./src/components/controls/rearrange-button";
import { ReactFlowProvider, useOnSelectionChange } from "@xyflow/react";

function App() {
  useEffect(() => {
    getNodesAndEdges().then((res) => {
      const { setEdges, setNodes } = useStore.getState();
      setNodes(res.nodes);
      setEdges(res.edges);
    });
  }, []);

  return (
    <ReactFlowProvider>
      <Flow controls={<RearrangeButton />} />
    </ReactFlowProvider>
  );
}

export default App;
