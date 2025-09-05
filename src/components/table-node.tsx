import { getFieldId } from "@/lib/dbml/node-dmbl.parser";
import { cn } from "@/lib/utils";
import { InternalGroupNode, type TableNodeType } from "@/types/nodes.types";
import Field from "@dbml/core/types/model_structure/field";
import Table from "@dbml/core/types/model_structure/table";
import { type NodeProps, Position, useInternalNode } from "@xyflow/react";
import { KeyRound } from "lucide-react";
import { BaseNode } from "./base-node";
import { LabeledHandle } from "./labeled-handle";
import {
  FIELD_HEIGHT,
  FIELD_SPACING,
  PRIMARY_KEY_WIDTH,
} from "./table-constants";
import { TableFoldHeader } from "./table-fold-header";
import { TableBody, TableCell, TableRow } from "./ui/table";

function TableField(field: Field, table: Table) {
  const indexes = table.indexes.filter((i) =>
    i.columns.some((c) => c.value === field.name)
  );
  const pk = field.pk || indexes.some((i) => i.pk);
  const unique = pk || field.unique || indexes.some((i) => i.unique);

  const attribute = pk ? <KeyRound size="0.7rem" /> : null;

  return (
    <TableRow
      key={field.name}
      className="relative text-sm"
      style={{
        height: FIELD_HEIGHT,
        // borderBottomWidth: FIELD_BORDER, // handled by TableRow
        overflow: "hidden",
      }}
    >
      <TableCell
        className={cn(
          "py-0.5 pl-0 flex items-center",
          unique ? "font-semibold" : "font-normal"
        )}
        style={{
          paddingRight: FIELD_SPACING,
        }}
      >
        <LabeledHandle
          id={getFieldId(field)}
          title={field.name}
          type="target"
          position={Position.Left}
          className="bold"
          labelClassName="p-0 pl-2"
        />
        <div style={{ width: PRIMARY_KEY_WIDTH }} className="flex justify-end">
          {attribute}
        </div>
      </TableCell>

      <TableCell className="py-0.5 px-0 text-right font-light">
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

export const TableNode = ({ selected, data, id }: NodeProps<TableNodeType>) => {
  const groupNode = data.groupId
    ? (useInternalNode(data.groupId) as InternalGroupNode)
    : null;
  const hidden = groupNode?.data.folded ?? false;

  return (
    <BaseNode
      id={id}
      className="p-0 flex flex-col"
      selected={selected}
      hidden={hidden}
    >
      <TableFoldHeader
        id={id}
        data={data}
        selected={selected}
        headerColor={data.color}
        label={data.label}
        folded={data.folded}
        color={data.color}
      />

      {/* shadcn Table cannot be used because of hardcoded overflow-auto */}

      <table
        className={cn(
          "border-spacing-10 overflow-visible",
          data.folded ? "hidden" : "" // avoid this warning
          // Couldn't create edge for source handle id: "f-ecommerce.product_tags.id", edge id: 7. Help: https://reactflow.dev/error#008
        )}
      >
        <TableBody>
          {data.table.fields.map((field) => TableField(field, data.table))}
        </TableBody>
      </table>
    </BaseNode>
  );
};
