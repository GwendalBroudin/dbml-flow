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

export const TableTooltip = forwardRef<
  HTMLElement,
  HTMLAttributes<HTMLElement> & { onFocus?: () => void; onBlur?: () => void }
>(({ children, onFocus, onBlur }, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = useCallback(() => {
    setIsVisible(true);
    onFocus?.();
  }, [onFocus]);
  const hideTooltip = useCallback(() => {
    setIsVisible(false);
    onBlur?.();
  }, [onBlur]);

  return (
    <TooltipContext.Provider value={{ isVisible, showTooltip, hideTooltip }}>
      {children}
    </TooltipContext.Provider>
  );
});
TableTooltip.displayName = "TableTooltip";

/* TOOLTIP TRIGGER ---------------------------------------------------------- */
export function TableTooltipTrigger({
  children,
  ...props
}: React.HTMLProps<HTMLElement>) {
  if (!React.isValidElement(children)) {
    throw new Error(
      "TableTooltipTrigger children must be a single React element",
    );
  }

  const tooltipContext = React.useContext(TooltipContext);
  if (!tooltipContext) {
    throw new Error("TableTooltipTrigger must be used within TableTooltip");
  }

  const child = React.Children.only(children);

  const { showTooltip, hideTooltip } = tooltipContext;
  return React.cloneElement(child, {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    ...props,
  });
}

export function TableTooltipContent({
  children,
  className,
  forceVisible,
  ...props
}: React.HTMLProps<HTMLDivElement> & { forceVisible?: boolean }) {
  const tooltipContext = React.useContext(TooltipContext);
  if (!tooltipContext) {
    throw new Error("TableTooltipContent must be used within TableTooltip");
  }
  const { isVisible } = tooltipContext;
  if (!isVisible && !forceVisible) {
    return null;
  }

  return (
    <>
      {/* this avoid hidding the popup when user tries to hover the popup */}
      <div className="absolute top-0 left-full -translate-x-1 bg-transparent h-full w-3" />
      <div className="ml-1.5 absolute left-full top-1/2 size-1.5 rotate-45 z-5000 bg-gray-900" />
      <div
        className={cn(
          "absolute left-full top-0 ml-2 z-5000 bg-gray-900 rounded shadow-lg",
          className,
        )}
        {...props}
      >
        <div>{children}</div>
      </div>
    </>
  );
}
