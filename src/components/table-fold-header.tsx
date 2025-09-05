import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { forwardRef, HTMLAttributes, useCallback } from "react";
import { BaseNodeHeader } from "./base-node";
import { HiddenHandle } from "./hidden-handle";
import useStore from "@/state/store";
import { Position } from "@xyflow/react";

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
      ...props
    },
    ref
  ) => {
    const { foldNode } = useStore();
    const callback = useCallback(() => {
      foldNode(id, !folded);
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
