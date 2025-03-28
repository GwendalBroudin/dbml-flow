import { ControlButton, useReactFlow } from "@xyflow/react";
import { WandSparkles } from "lucide-react";
import { useCallback } from "react";
import useStore from "@/state/store";
import { getLayoutedGraph } from "@/lib/layout/dagre.utils";
import { on } from "events";

const title = "rearrange nodes";

function RearrangeButton() {
  const { onLayout } = useStore();
  const { fitView } = useReactFlow();

  const handleClick = useCallback(() => {
    onLayout("LR", fitView);
  }, [onLayout, fitView]);

  return (
    <ControlButton onClick={handleClick} aria-label={title} title={title}>
      <WandSparkles />
    </ControlButton>
  );
}

export default RearrangeButton;
