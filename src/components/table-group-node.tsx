import type { GroupNodeType, TableNodeType } from "@/types/nodes.types";
import type { NodeProps } from "@xyflow/react";
import { BaseNode, BaseNodeHeader } from "./base-node";
import { TableFoldHeader } from "./table-fold-header";
import { cn } from "@/lib/utils";

export const TableGroupNode = ({
  selected,
  data,
  id,
  width,
}: NodeProps<GroupNodeType>) => {
  return (
    <BaseNode
      id={id}
      className={cn("p-0", data.folded ? "" : "flex flex-col h-full")}
      selected={selected}
      style={{
        borderColor: data.color,
      }}
    >
      <TableFoldHeader
        id={id}
        headerColor={data.color}
        label={data.label}
        selected={selected}
        data={data}
        folded={data.folded}
      />
      <div
        hidden={data.folded}
        className="flex-auto overflow-visible"
        style={{
          backgroundColor: data.color,
          opacity: selected ? 0.4 : 0.25,
          width: data.dimensions.width,
          height: data.dimensions.height,
        }}
      ></div>
    </BaseNode>
  );
};
