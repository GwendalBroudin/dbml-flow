import { getFieldId } from "@/lib/dbml/parser";
import { cn } from "@/lib/utils";
import { type TableNodeType } from "@/types/nodes.types";
import Field from "@dbml/core/types/model_structure/field";
import Table from "@dbml/core/types/model_structure/table";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { ChevronDown, ChevronUp, KeyRound } from "lucide-react";
import { BaseNode, BaseNodeHeader } from "./base-node";
import {
  FIELD_HEIGHT,
  FIELD_SPACING,
  PRIMARY_KEY_WIDTH,
} from "./table-constants";
import { LabeledHandle } from "./labeled-handle";
import { TableBody, TableCell, TableRow } from "./ui/table";
import { HiddenHandle } from "./hidden-handle";
import { forwardRef, HTMLAttributes, useCallback } from "react";
import useStore from "@/state/store";
import { size } from "lodash-es";

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
  console.log("Render TableNode", id);
  return (
    <BaseNode id={id} className="p-0 flex flex-col" selected={selected}>
      <DBHeader
        id={id}
        selected={selected}
        headerColor={data.color}
        label={data.label}
        folded={data.folded}
        color={data.color}
      />

      {/* shadcn Table cannot be used because of hardcoded overflow-auto */}
      <table className="border-spacing-10 overflow-visible">
        <TableBody>
          {data.table.fields.map((field) => TableField(field, data.table))}
        </TableBody>
      </table>
    </BaseNode>
  );
};

export const DBHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    selected?: boolean;
    headerColor?: string;
    label: string;
    id: string;
    color?: string;
    folded?: boolean;
  }
>(
  (
    { id, className, selected, headerColor, folded, label, color, ...props },
    ref
  ) => {
    const { foldNode } = useStore();
    const callback = useCallback(() => {
      foldNode(id, !folded);
    }, [foldNode, id, folded]);

    const buttonProp = { onClick: callback, size: "0.7rem" };
    const foldButton = folded ? (
      <ChevronDown {...buttonProp} />
    ) : (
      <ChevronUp {...buttonProp} />
    );

    return (
      <div className="flex relative items-center">
        <HiddenHandle id={id} type="target" position={Position.Left} />
        <BaseNodeHeader
          headerColor={color}
          label={label}
          selected={selected}
          className="flex-auto"
          beforeTitle={foldButton}
        />
        <HiddenHandle id={id} type="source" position={Position.Right} />
      </div>
    );
  }
);
