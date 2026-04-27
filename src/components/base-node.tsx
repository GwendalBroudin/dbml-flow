import { HTMLAttributes, Ref } from "react";

import { cn } from "@/lib/utils";
import { HEADER_HEIGHT } from "./table-constants";

type BaseNodeProps = HTMLAttributes<HTMLDivElement> & {
  selected?: boolean;
  ref?: Ref<HTMLDivElement>;
};

export const BaseNode = ({ className, selected, ref, ...props }: BaseNodeProps) => (
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
);

type BaseNodeHeaderProps = HTMLAttributes<HTMLDivElement> & {
  selected?: boolean;
  headerColor?: string;
  label: string;
  beforeTitle?: React.ReactNode;
  afterTitle?: React.ReactNode;
  ref?: Ref<HTMLDivElement>;
};

export const BaseNodeHeader = ({
  className,
  selected,
  headerColor,
  label,
  beforeTitle,
  afterTitle,
  ref,
  ...props
}: BaseNodeHeaderProps) => {
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
};
