import { forwardRef, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { HEADER_HEIGHT } from "./table-constants";

export const BaseNode = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-xs outline outline-transparent bg-card p-5 text-card-foreground",
      className,
      selected && "outline-muted-foreground shadow-lg" ,
      "hover:outline-card-foreground",
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
    beforeTitle?: React.ReactNode;
    afterTitle?: React.ReactNode;
  }
>(
  (
    {
      className,
      selected,
      headerColor,
      label,
      beforeTitle,
      afterTitle,
      ...props
    },
    ref,
  ) => {
    headerColor = headerColor || "var(--color-primary)";
    return (
      <div
        ref={ref}
        className={cn(
          className,
          selected ? "opacity-100" : "opacity-80",
        )}
        style={{
          backgroundColor: headerColor,
          height: HEADER_HEIGHT,
        }}
        {...props}
      >
        <div className="p-1 pl-2 flex items-center gap-1 mix-blend-luminosity filter-invert">
          {beforeTitle}
          <h2 className="font-semibold text-[15px] ">{label}</h2>
          {afterTitle}
        </div>
      </div>
    );
  },
);

BaseNodeHeader.displayName = "BaseNodeHeader";
