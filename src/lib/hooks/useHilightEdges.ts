import {
  Node,
  OnNodesChange,
  useNodesInitialized,
  useReactFlow,
} from "@xyflow/react";
import { useEffect } from "react";

export default function useHilightEdges(onNodesChange: OnNodesChange<Node>) {
  const nodesInitialized = useNodesInitialized();
  const { getNodes, getEdges, setNodes, setEdges, fitView } = useReactFlow();

  useEffect(() => {
    console.log("useHilightEdges");

    const selecteds = getNodes().filter((n) => n.selected);
    if (!selecteds.length) return;

    console.log(selecteds);

    setEdges(
      getEdges().map((e) => ({
        ...e,
        animated: selecteds.some((s) => s.id === e.source || s.id === e.target),
      }))
    );
  }, [nodesInitialized, getNodes, getEdges, setNodes, fitView]);
}
