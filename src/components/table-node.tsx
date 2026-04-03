import { getFieldId } from "@/lib/dbml/node-dmbl.parser";
import { cn } from "@/lib/utils";
import useStore from "@/state/store";
import { InternalGroupNode, type TableNodeType } from "@/types/nodes.types";
import Field from "@dbml/core/types/model_structure/field";
import Table from "@dbml/core/types/model_structure/table";
import { type NodeProps, Position, useInternalNode } from "@xyflow/react";
import { KeyRound } from "lucide-react";
import React, { useCallback } from "react";
import { BaseNode } from "./base-node";
import { LabeledHandle } from "./labeled-handle";
import {
  FIELD_HEIGHT,
  FIELD_SPACING,
  PRIMARY_KEY_WIDTH,
} from "./table-constants";
import { TableFoldHeader } from "./table-fold-header";
import { TableBody, TableCell, TableRow } from "./ui/table";
import {
  TableFieldTooltipTrigger,
  TableFieldTooltip,
  TableFieldTooltipContent,
} from "./table-field-tooltip/table-field-tooltip";

export type TableFieldProps = {
  field: Field;
  table: Table;
  fieldOnly: boolean;
} & React.HTMLProps<HTMLTableRowElement>;

export const TableField = ({
  field,
  table,
  fieldOnly,
  children,
  ...props
}: TableFieldProps) => {
  const indexes = table.indexes.filter((i) =>
    i.columns.some((c) => c.value === field.name),
  );
  const pk = field.pk || indexes.some((i) => i.pk);
  const unique = pk || field.unique || indexes.some((i) => i.unique);

  const attribute = pk ? <KeyRound size="0.7rem" /> : null;
  const hidden = fieldOnly && !field.endpoints.some((e) => e.ref);

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
          "py-0.5 pl-0 flex items-center",
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
      <td>{children}</td>
    </TableRow>
  );
};

function buildField(field: Field, table: Table, isRelationOnly: boolean) {
  const enumData = field._enum;
  const note = field.note;

  if (!enumData && !note)
    return (
      <TableField
        key={field.name}
        field={field}
        table={table}
        fieldOnly={isRelationOnly}
      />
    );

  return (
    <TableFieldTooltip key={field.name}>
      <TableFieldTooltipTrigger>
        <TableField field={field} table={table} fieldOnly={isRelationOnly}>
          <TableFieldTooltipContent>
            <div className="flex flex-col gap-1 px-2 py-1 text-gray-100 text-xs">
              <div className=" text-xs pb-0.5 whitespace-nowrap border-b-2 border-b-muted-foreground">
                <span className="">{field.name} </span>
                <span className="text-blue-500">{field.type.type_name}</span>
              </div>
              {note && <div className="text-muted-foreground">{note}</div>}
              {enumData && (
                <div>
                  <p>
                    <span className="text-amber-800">ENUM </span>
                    {enumData.name}:
                  </p>
                  <div className="ml-2 ">
                    {enumData.values.map((v) => (
                      <p key={v.name}>
                        {v.name}
                        {v.note && (
                          <span className="text-muted-foreground">
                            {" "}
                            ({v.note})
                          </span>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TableFieldTooltipContent>
        </TableField>
      </TableFieldTooltipTrigger>
    </TableFieldTooltip>
  );
}

export const TableNode = ({ selected, data, id }: NodeProps<TableNodeType>) => {
  const { relationOnly, overrideRelationOnly, relationOnlyOverrides } =
    useStore();

  const groupNode = data.groupId
    ? (useInternalNode(data.groupId) as InternalGroupNode)
    : null;
  const hidden = groupNode?.data.folded ?? false;
  const isRelationOnly = relationOnly && !relationOnlyOverrides.has(id);

  const relationOnlyCallback = useCallback(() => {
    overrideRelationOnly(id, isRelationOnly);
  }, [id, isRelationOnly, overrideRelationOnly]);

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
          data.folded ? "hidden" : "", // avoid this warning
          // Couldn't create edge for source handle id: "f-ecommerce.product_tags.id", edge id: 7. Help: https://reactflow.dev/error#008
        )}
      >
        <TableBody>
          {data.table.fields.map((field) =>
            buildField(field, data.table, isRelationOnly),
          )}
        </TableBody>
      </table>
      {relationOnly && (
        <div
          className="hover:bg-accent flex items-center justify-center cursor-pointer"
          onClick={relationOnlyCallback}
          title={
            isRelationOnly ? "Show all fields" : "Show only relations fields"
          }
        >
          <p>...</p>
        </div>
      )}
    </BaseNode>
  );
};
