import { hasFieldDetails, isUniqueFieldOrPK } from "@/lib/dbml/dbml.utils";
import { getFieldId } from "@/lib/dbml/node-dmbl.parser";
import { cn } from "@/lib/utils";
import type { Field, Table } from "@dbml/core";
import { KeyRound, StickyNote } from "lucide-react";
import { LabeledHandle } from "./labeled-handle";
import { ICON_SIZE, FIELD_HEIGHT, FIELD_SPACING } from "./table-constants";
import { TableRow, TableCell } from "./ui/table";
import { Position } from "@xyflow/react";

export type TableFieldProps = {
  field: Field;
  table: Table;
  isRelationOnly: boolean;
} & React.HTMLProps<HTMLTableRowElement>;

export const TableField = ({
  field,
  table,
  isRelationOnly,
  children,
  ...props
}: TableFieldProps) => {
  const { unique, pk } = isUniqueFieldOrPK(field);
  const icons = getFieldIcons(field);

  const hidden = isRelationOnly && !field.endpoints.some((e) => e.ref);

  return (
    <TableRow
      {...props}
      hidden={hidden}
      className="relative text-sm whitespace-nowrap"
      style={{
        height: FIELD_HEIGHT,
      }}
    >
      <TableCell
        className={cn(
          "py-0.5 pl-0 flex items-center gap-1",
          unique ? "font-semibold" : "font-normal",
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
        <div className="flex justify-end gap-0.5">
          {icons}
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
      {children && <td>{children}</td>}
    </TableRow>
  );
};

function getFieldIcons(field: Field) {
  const { pk } = isUniqueFieldOrPK(field);
  const hasDetails = hasFieldDetails(field);
  
  const pkAttribute = pk ? <KeyRound size={ICON_SIZE} /> : null;
  const detailAttribute = hasDetails ? <StickyNote size={ICON_SIZE} /> : null;
  return (
    <>
      {pkAttribute}
      {detailAttribute}
    </>
  );
}
