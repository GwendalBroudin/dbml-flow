import { forwardRef, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { HEADER_HEIGHT } from "./constants";

export const BaseNode = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-md border bg-card p-5 text-card-foreground",
      className,
      selected ? "border-muted-foreground shadow-lg" : "",
      "hover:ring-1"
    )}
    tabIndex={0}
    {...props}
  />
));

BaseNode.displayName = "BaseNode";

export const BaseNodeHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    selected?: boolean;
    headerColor?: string;
    label: string;
  }
>(({ className, selected, headerColor, label, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-tl-sm rounded-tr-sm bg-secondary", className)}
    style={{
      backgroundColor: headerColor,
      opacity: selected ? 0.7 : 0.5,
      height: HEADER_HEIGHT,
    }}
    {...props}
  >
    <div className="p-2">
      <h2 className="font-bold text-muted-foreground mix-blend-difference ">
        {label}
      </h2>
    </div>
  </div>
));

BaseNodeHeader.displayName = "BaseNodeHeader";
