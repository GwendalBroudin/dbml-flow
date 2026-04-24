import { hasFieldDetails } from "@/lib/dbml/dbml.utils";
import { cn } from "@/lib/utils";
import useStore from "@/state/store";
import { InternalGroupNode, type TableNodeType } from "@/types/nodes.types";
import Field from "@dbml/core/types/model_structure/field";
import Table from "@dbml/core/types/model_structure/table";
import {
  type NodeProps,
  useInternalNode,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { StickyNote } from "lucide-react";
import { useCallback } from "react";
import { BaseNode } from "./base-node";
import { TableFoldHeader } from "./table-fold-header";
import { TableField } from "./table-node-field";
import { TableFieldTooltipView } from "./table-tooltip/table-field-tooltip-view";
import { TableHeaderTooltipView } from "./table-tooltip/table-header-tooltip-view";
import {
  TableTooltip,
  TableTooltipAnchor,
  TableTooltipContent,
  TableTooltipTrigger,
} from "./table-tooltip/table-tooltip";
import { TableBody } from "./ui/table";

function buildField(field: Field, table: Table, isRelationOnly: boolean) {
  const hasDetails = hasFieldDetails(field);
  if (!hasDetails)
    return (
      <TableField
        key={field.name}
        field={field}
        table={table}
        isRelationOnly={isRelationOnly}
      />
    );

  return (
    <TableTooltip key={field.name}>
      <TableTooltipTrigger>
        <TableField
          field={field}
          table={table}
          isRelationOnly={isRelationOnly}
        ></TableField>
      </TableTooltipTrigger>
      <TableTooltipContent>
        <TableFieldTooltipView field={field} />
      </TableTooltipContent>
    </TableTooltip>
  );
}

function Header({
  selected,
  data,
  id,
}: Pick<NodeProps<TableNodeType>, "selected" | "data" | "id">) {
  const hasNote = !!data.table.note;
  const sharedProps = {
    id,
    data,
    selected,
    headerColor: data.color,
    label: data.label,
    folded: data.folded,
  };
  if (!hasNote) {
    return <TableFoldHeader {...sharedProps} />;
  }

  const noteIcon = <StickyNote size="1rem" className="pl-1" />;

  return (
    <TableTooltip>
      <TableTooltipTrigger>
        <TableFoldHeader
          {...sharedProps}
          afterTitle={noteIcon}
        ></TableFoldHeader>
      </TableTooltipTrigger>
      <TableTooltipContent>
        <TableHeaderTooltipView table={data.table} />
      </TableTooltipContent>
    </TableTooltip>
  );
}

export const TableNode = ({ selected, data, id }: NodeProps<TableNodeType>) => {
  const { relationOnly, overrideRelationOnly, relationOnlyOverrides } =
    useStore();
  const updateNodeInternals = useUpdateNodeInternals();

  const groupNode = data.groupId
    ? (useInternalNode(data.groupId) as InternalGroupNode)
    : null;
  const hidden = groupNode?.data.folded ?? false;
  const isRelationOnly = relationOnly && !relationOnlyOverrides.has(id);

  const relationOnlyCallback = useCallback(() => {
    overrideRelationOnly(id, isRelationOnly);
    updateNodeInternals(id);
  }, [id, isRelationOnly, overrideRelationOnly]);

  return (
    <TableTooltipAnchor>
      <BaseNode
        id={id}
        className="p-0 flex flex-col overflow-hidden"
        selected={selected}
        hidden={hidden}
      >
        <Header selected={selected} data={data} id={id} />

        {/* shadcn Table cannot be used because of hardcoded overflow-auto */}

        <table
          className={cn(
            "border-spacing-10",
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
        {relationOnly && !data.folded && (
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
    </TableTooltipAnchor>
  );
};
