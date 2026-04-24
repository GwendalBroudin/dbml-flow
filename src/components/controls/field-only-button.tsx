import useStore from "@/state/store";
import { ControlButton, useUpdateNodeInternals } from "@xyflow/react";
import { ListChevronsDownUp } from "lucide-react";
import { useCallback } from "react";

function RelationOnlyButton() {
  const { relationOnly, setRelationOnly, nodes } = useStore();
  const updateNodeInternals = useUpdateNodeInternals();

  const title = relationOnly ? "Show all fields" : "Show only relations fields";
  const handleClick = useCallback(() => {
    setRelationOnly(!relationOnly);
    updateNodeInternals(nodes.map((node) => node.id));
  }, [relationOnly, setRelationOnly, updateNodeInternals, nodes]);

  return (
    <ControlButton onClick={handleClick} aria-label={title} title={title}>
      <ListChevronsDownUp fillOpacity={relationOnly ? 1 : 0.3} />
    </ControlButton>
  );
}

export default RelationOnlyButton;
