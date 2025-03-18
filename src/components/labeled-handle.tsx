import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { HandleProps } from "@xyflow/react";

import { HiddenHandle } from "./hidden-handle";

const flexDirections = {
  top: "flex-col",
  right: "flex-row-reverse",
  bottom: "flex-col-reverse justify-end",
  left: "flex-row",
};

export const LabeledHandle = forwardRef<
  HTMLDivElement,
  HandleProps &
    HTMLAttributes<HTMLDivElement> & {
      title: string;
      handleClassName?: string;
      labelClassName?: string;
    }
>(
  (
    { className, labelClassName, handleClassName, title, position, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      title={title}
      className={cn(
        "relative flex items-center",
        flexDirections[position],
        className,
      )}
    >
      <HiddenHandle position={position} className={handleClassName} {...props} />
      <label className={cn("px-3 text-foreground", labelClassName)}>
        {title}
      </label>
    </div>
  ),
);

LabeledHandle.displayName = "LabeledHandle";
