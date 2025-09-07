import useStore from "@/state/store";
import { ControlButton } from "@xyflow/react";
import { ListChevronsDownUp } from "lucide-react";
import { useCallback } from "react";

function RelationOnlyButton() {
  const { relationOnly, setRelationOnly } = useStore();

  const title = relationOnly ? "Show all fields" : "Show only relations fields";
  const handleClick = useCallback(() => {
    setRelationOnly(!relationOnly);
  }, [relationOnly, setRelationOnly]);

  return (
    <ControlButton onClick={handleClick} aria-label={title} title={title}>
      <ListChevronsDownUp fillOpacity={relationOnly ? 1 : 0.3} />
    </ControlButton>
  );
}

export default RelationOnlyButton;
