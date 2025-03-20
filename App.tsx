
import "@xyflow/react/dist/style.css";

import React, { useEffect } from "react";
import Flow from "./src/pages/flow";
import { getNodesAndEdges } from "./src/lib/dbml/parser";
import useStore from "./src/state/store";
import RearrangeButton from "./src/components/controls/rearrange-button";

function App() {
  useEffect(() => {
    getNodesAndEdges().then((res) => {
      const {setEdges, setNodes} = useStore.getState();
      setNodes(res.nodes);
      setEdges(res.edges);
    });
  }, []);

  return (
    <Flow
      controls = {<RearrangeButton/>}
    />
  );
}

export default App;