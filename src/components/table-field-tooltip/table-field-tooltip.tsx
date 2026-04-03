import { cn } from "@/lib/utils";
import React, {
  createContext,
  forwardRef,
  HTMLAttributes,
  useCallback,
  useState,
} from "react";

/* TOOLTIP CONTEXT ---------------------------------------------------------- */
type TooltipContextType = {
  isVisible: boolean;
  showTooltip: () => void;
  hideTooltip: () => void;
};

const TooltipContext = createContext<TooltipContextType | null>(null);

/* TOOLTIP NODE ------------------------------------------------------------- */

export const TableFieldTooltip = forwardRef<
  HTMLElement,
  HTMLAttributes<HTMLElement>
>(({ children }, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = useCallback(() => setIsVisible(true), []);
  const hideTooltip = useCallback(() => setIsVisible(false), []);

  return (
    <TooltipContext.Provider value={{ isVisible, showTooltip, hideTooltip }}>
      {children}
    </TooltipContext.Provider>
  );
});
TableFieldTooltip.displayName = "TableFieldTooltip";

/* TOOLTIP TRIGGER ---------------------------------------------------------- */
export function TableFieldTooltipTrigger({
  children,
  ...props
}: React.HTMLProps<HTMLElement>) {
  if (!React.isValidElement(children)) {
    throw new Error(
      "TableFieldTooltipTrigger children must be a single React element",
    );
  }

  const tooltipContext = React.useContext(TooltipContext);
  if (!tooltipContext) {
    throw new Error(
      "TableFieldTooltipTrigger must be used within TableFieldTooltip",
    );
  }

  const child = React.Children.only(children);

  const { showTooltip, hideTooltip } = tooltipContext;
  return React.cloneElement(child, {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    ...props,
  });
}

export function TableFieldTooltipContent({
  children,
  className,
  ...props
}: React.HTMLProps<HTMLDivElement>) {
  const tooltipContext = React.useContext(TooltipContext);
  if (!tooltipContext) {
    throw new Error(
      "TableFieldTooltipContent must be used within TableFieldTooltip",
    );
  }
  const { isVisible } = tooltipContext;
  if (!isVisible) {
    return null;
  }

  console.log("Rendering tooltip content");
  return (
    <>
      <div className="ml-1.5 absolute left-full top-1/2 size-1.5 rotate-45 z-49 bg-gray-900" />
      <div
        className={cn(
          "absolute left-full top-0 ml-2 z-50 bg-gray-900 rounded shadow-lg",
          className,
        )}
        {...props}
      >
        <div>{children}</div>
      </div>
    </>
  );
}
