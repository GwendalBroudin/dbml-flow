import React, { HTMLAttributes, Ref } from "react";
import { cn } from "@/lib/utils";
import { HandleProps } from "@xyflow/react";

import { HiddenHandle } from "./hidden-handle";

const flexDirections = {
  top: "flex-col",
  right: "flex-row-reverse",
  bottom: "flex-col-reverse justify-end",
  left: "flex-row",
};

type LabeledHandleProps = HandleProps &
  HTMLAttributes<HTMLDivElement> & {
    title: string;
    handleClassName?: string;
    labelClassName?: string;
    ref?: Ref<HTMLDivElement>;
  };

export const LabeledHandle = ({
  className,
  labelClassName,
  handleClassName,
  title,
  position,
  ref,
  ...props
}: LabeledHandleProps) => (
  <div
    ref={ref}
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
);
