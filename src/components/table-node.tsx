import { getFieldId } from "@/lib/dbml/parser";
import { type TableNodeType } from "@/types/nodes.types";
import { type NodeProps, Position } from "@xyflow/react";
import { BaseNode } from "./base-node";
import { LabeledHandle } from "./labeled-handle";
import { TableBody, TableCell, TableRow } from "./ui/table";
import Field from "@dbml/core/types/model_structure/field";
import { KeyRound } from "lucide-react";
import Table from "@dbml/core/types/model_structure/table";
import { cn } from "@/lib/utils";

function TableField(field: Field, table: Table) {
  const indexes = table.indexes.filter((i) =>
    i.columns.some((c) => c.value === field.name)
  );
  const pk = field.pk || indexes.some((i) => i.pk);
  const unique = pk || field.unique || indexes.some((i) => i.unique);

  const attribute = pk ? <KeyRound size="0.7rem" /> : null;

  return (
    <TableRow key={field.name} className="relative text-sm">
      <TableCell
        className={cn(
          "pl-0 pr-6 flex items-center",
          unique ? "font-bold" : "font-light"
        )}
      >
        <LabeledHandle
          id={getFieldId(field)}
          title={field.name}
          type="target"
          position={Position.Left}
          className="bold"
        />
        {attribute}
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
  );
}

export const TableNode = ({ selected, data }: NodeProps<TableNodeType>) => {
  return (
    <BaseNode className="p-0 flex flex-col" selected={selected}>
      <div
        className="rounded-tl-md rounded-tr-md p-2 bg-secondary"
        style={{ backgroundColor: data.table.headerColor }}
      >
        <h2 className="font-bold text-muted-foreground mix-blend-difference">
          {data.label}
        </h2>
      </div>

      {/* shadcn Table cannot be used because of hardcoded overflow-auto */}
      <table className="border-spacing-10 overflow-visible">
        <TableBody>
          {data.table.fields.map((field) => TableField(field, data.table))}
        </TableBody>
      </table>
    </BaseNode>
  );
};
