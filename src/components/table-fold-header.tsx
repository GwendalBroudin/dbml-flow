import { cn } from "@/lib/utils";
import useStore from "@/state/store";
import { GroupNodeData, TableNodeData } from "@/types/nodes.types";
import { Position, useUpdateNodeInternals } from "@xyflow/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  HTMLAttributes,
  MouseEventHandler,
  Ref,
  useCallback,
} from "react";
import { BaseNodeHeader } from "./base-node";
import { HiddenHandle } from "./hidden-handle";

type TableFoldHeaderProps = HTMLAttributes<HTMLDivElement> & {
  selected?: boolean;
  headerColor?: string;
  label: string;
  id: string;
  folded?: boolean;
  headerClassName?: string;
  data: TableNodeData | GroupNodeData;
  afterTitle?: React.ReactNode;
  ref?: Ref<HTMLDivElement>;
};

export const TableFoldHeader = ({
  id,
  className,
  selected,
  headerColor,
  folded,
  label,
  headerClassName,
  data,
  afterTitle,
  ref,
  ...props
}: TableFoldHeaderProps) => {
  const { foldNode } = useStore();
  const updateNodeInternals = useUpdateNodeInternals();
  const callback: MouseEventHandler = useCallback(
    (evt) => {
      evt.stopPropagation();
      foldNode(id, !folded);
      updateNodeInternals(id);
    },
    [foldNode, id, folded],
  );

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
        headerColor={headerColor}
        label={label}
        selected={selected}
        className={cn("flex-auto pr-2", headerClassName)}
        beforeTitle={foldButton}
        afterTitle={afterTitle}
      />
      {props.children}
      <HiddenHandle id={id} type="source" position={Position.Right} />
    </div>
  );
};
