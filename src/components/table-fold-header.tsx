import { cn } from "@/lib/utils";
import useStore from "@/state/store";
import { GroupNodeData, TableNodeData } from "@/types/nodes.types";
import { Position, useUpdateNodeInternals } from "@xyflow/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { forwardRef, HTMLAttributes, useCallback } from "react";
import { BaseNodeHeader } from "./base-node";
import { HiddenHandle } from "./hidden-handle";

export const TableFoldHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    selected?: boolean;
    headerColor?: string;
    label: string;
    id: string;
    color?: string;
    folded?: boolean;
    headerClassName?: string;
    data: TableNodeData | GroupNodeData;
  }
>(
  (
    {
      id,
      className,
      selected,
      headerColor,
      folded,
      label,
      color,
      headerClassName,
      data,
      ...props
    },
    ref
  ) => {
    const { foldNode } = useStore();
    const updateNodeInternals = useUpdateNodeInternals();
    const callback = useCallback(() => {
      foldNode(id, !folded);
      updateNodeInternals(id);
    }, [foldNode, id, folded]);

    const buttonProp = {
      onClick: callback,
      size: "0.7rem",
      className: "cursor-pointer",
    };
    const foldButton = folded ? (
      <ChevronDown {...buttonProp} />
    ) : (
      <ChevronUp {...buttonProp} />
    );

    return (
      <div
        className={cn("flex relative items-center", className)}
        ref={ref}
        {...props}
      >
        <HiddenHandle id={id} type="target" position={Position.Left} />
        <BaseNodeHeader
          headerColor={color}
          label={label}
          selected={selected}
          className={cn(
            "flex-auto pr-2",
            folded ? "rounded-sm" : "",
            headerClassName
          )}
          beforeTitle={foldButton}
        />
        <HiddenHandle id={id} type="source" position={Position.Right} />
      </div>
    );
  }
);
