import useStore from "@/state/store";
import { ControlButton, useReactFlow } from "@xyflow/react";
import { Map } from "lucide-react";
import { useCallback } from "react";

function MinimapButton() {
  const { minimap, setMinimap } = useStore();

  const title = minimap ?  "Hide minimap" : "Show minimap" ;
  const handleClick = useCallback(() => {
    setMinimap(!minimap);
  }, [minimap, setMinimap]);

  return (
    <ControlButton onClick={handleClick} aria-label={title} title={title}>
      <Map fillOpacity={minimap ? 1 : 0.6} />
    </ControlButton>
  );
}

export default MinimapButton;
