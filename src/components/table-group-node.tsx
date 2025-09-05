import type { TableNodeType } from "@/types/nodes.types";
import type { NodeProps } from "@xyflow/react";
import { BaseNode, BaseNodeHeader } from "./base-node";

export const TableGroupNode = ({
  selected,
  data,
  id,
  width,
  height,
}: NodeProps<TableNodeType>) => {
  return (
    <BaseNode
      id={`group-${id}`}
      className="p-0 flex flex-col h-full"
      selected={selected}
      style={{
        borderColor: data.color,
      }}
    >
      <BaseNodeHeader
        headerColor={data.color}
        label={data.label}
        selected={selected}
      />
      <div
        className="flex-auto overflow-visible"

        style={{ backgroundColor: data.color, opacity: selected ? 0.4 : 0.25 }}
      ></div>
    </BaseNode>
  );
};
