import { getFieldId } from "@/lib/dbml/nodes";
import { type TableNodeType } from "@/types/nodes.types";
import { type NodeProps, Position } from "@xyflow/react";
import { BaseNode } from "./base-node";
import { LabeledHandle } from "./labeled-handle";
import { TableBody, TableCell, TableRow } from "./ui/table";

export const TableNode = ({ selected, data }: NodeProps<TableNodeType>) => {
  return (
    <BaseNode className="p-0 flex flex-col" selected={selected}>
      <div className="rounded-tl-md rounded-tr-md p-2 bg-secondary" style={{ backgroundColor: data.table.headerColor }}>
        <h2 className="font-bold text-muted-foreground mix-blend-difference">
          {data.label}
        </h2>
      </div>

      {/* shadcn Table cannot be used because of hardcoded overflow-auto */}
      <table className="border-spacing-10 overflow-visible">
        <TableBody>
          {data.table.fields.map((field) => (
            <TableRow key={field.name} className="relative text-xs">
              <TableCell className="pl-0 pr-6 font-light">
                <LabeledHandle
                  id={getFieldId(field)}
                  title={field.name}
                  type="target"
                  position={Position.Left}
                />
              </TableCell>
              <TableCell className="pr-0 text-right font-thin">
                <LabeledHandle
                  id={getFieldId(field)}
                  title={field.type.type_name}
                  type="source"
                  position={Position.Right}
                  className="p-0"
                  handleClassName="p-0"
                  labelClassName="p-0 pr-2"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </table>
    </BaseNode>
  );
};
