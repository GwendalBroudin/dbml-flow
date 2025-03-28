import { ControlButton, useReactFlow } from "@xyflow/react";
import { WandSparkles } from "lucide-react";
import { useCallback } from "react";
import useStore from "@/state/store";
import { getLayoutedGraph } from "@/lib/layout/dagre.utils";

const title = "rearrange nodes";

function RearrangeButton() {
  const { nodes, setNodes, edges } = useStore();
  const { fitView } = useReactFlow();

  const handleClick = useCallback(() => {
    const newNodes = getLayoutedGraph(nodes, edges);
    setNodes(newNodes);
    setTimeout(() => fitView(), 0);
  }, [nodes, edges]);

  return (
    <ControlButton onClick={handleClick} aria-label={title} title={title}>
      <WandSparkles />
    </ControlButton>
  );
}

export default RearrangeButton;
