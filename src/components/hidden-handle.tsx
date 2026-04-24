import { Ref } from "react";
import { Handle, HandleProps } from "@xyflow/react";

import { cn } from "@/lib/utils";

export type BaseHandleProps = HandleProps & { ref?: Ref<HTMLDivElement> };

export const HiddenHandle = ({ className, children, ref, ...props }: BaseHandleProps) => {
  return (
    <Handle
      ref={ref}
      {...props}
      className={cn(
        "opacity-0 h-[11px] w-[11px] rounded-full border border-slate-300 bg-slate-100 transition dark:border-secondary dark:bg-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </Handle>
  );
};
