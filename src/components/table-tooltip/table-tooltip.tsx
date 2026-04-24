import { cn } from "@/lib/utils";
import React, {
  cloneElement,
  createContext,
  forwardRef,
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

/* TOOLTIP CONTEXT ---------------------------------------------------------- */
type TooltipContextType = {
  isVisible: boolean;
  showTooltip: () => void;
  hideTooltip: () => void;
  anchorElement: HTMLElement | null;
  setAnchorElement: (element: HTMLElement | null) => void;
  targetElement: HTMLElement | null;
};

const TooltipContext = createContext<TooltipContextType | null>(null);
const TooltipPortalContext = createContext<HTMLElement | null>(null);

export const TableTooltipAnchor = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(
    null,
  );

  const handleRef = useCallback(
    (element: HTMLDivElement | null) => {
      setPortalElement(element);

      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    },
    [ref],
  );

  return (
    <TooltipPortalContext.Provider value={portalElement}>
      <div
        data-tooltip-anchor
        ref={handleRef}
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </div>
    </TooltipPortalContext.Provider>
  );
});
TableTooltipAnchor.displayName = "TableTooltipAnchor";

export const TooltipAnchor = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <TableTooltipAnchor ref={ref} {...props}>
      {children}
    </TableTooltipAnchor>
  );
});
TooltipAnchor.displayName = "TooltipAnchor";

/* TOOLTIP NODE ------------------------------------------------------------- */

export const TableTooltip = forwardRef<
  HTMLElement,
  HTMLAttributes<HTMLElement> & {
    onFocus?: () => void;
    onBlur?: () => void;
    targetElement?: HTMLElement | null;
  }
>(({ children, onFocus, onBlur, targetElement }, _ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const portalElement = React.useContext(TooltipPortalContext);

  const showTooltip = useCallback(() => {
    setIsVisible(true);
    onFocus?.();
  }, [onFocus]);
  const hideTooltip = useCallback(() => {
    setIsVisible(false);
    onBlur?.();
  }, [onBlur]);

  const resolvedTarget = useMemo(() => {
    if (targetElement) {
      return targetElement;
    }

    if (portalElement) {
      return portalElement;
    }

    const candidate = anchorElement?.closest("[data-tooltip-anchor]");
    return candidate instanceof HTMLElement ? candidate : null;
  }, [anchorElement, portalElement, targetElement]);

  useEffect(() => {
    if (!resolvedTarget) {
      return;
    }

    const initialPosition = resolvedTarget.style.position;
    if (!initialPosition) {
      resolvedTarget.style.position = "relative";
    }

    return () => {
      if (!initialPosition) {
        resolvedTarget.style.position = "";
      }
    };
  }, [resolvedTarget]);

  return (
    <TooltipContext.Provider
      value={{
        isVisible,
        showTooltip,
        hideTooltip,
        anchorElement,
        setAnchorElement,
        targetElement: resolvedTarget,
      }}
    >
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

  const child = React.Children.only(children) as React.ReactElement<
    Pick<
      React.HTMLProps<HTMLElement>,
      "onFocus" | "onBlur" | "onMouseEnter" | "onMouseLeave" | "className"
    >
  >;

  const { showTooltip, hideTooltip, setAnchorElement } = tooltipContext;

  const handleMouseEnter: React.MouseEventHandler<HTMLElement> = (event) => {
    setAnchorElement(event.currentTarget);
    child.props.onMouseEnter?.(event);
    props.onMouseEnter?.(event);
    showTooltip();
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLElement> = (event) => {
    child.props.onMouseLeave?.(event);
    props.onMouseLeave?.(event);
    hideTooltip();
  };

  const handleFocus: React.FocusEventHandler<HTMLElement> = (event) => {
    setAnchorElement(event.currentTarget);
    child.props.onFocus?.(event);
    props.onFocus?.(event);
    showTooltip();
  };

  const handleBlur: React.FocusEventHandler<HTMLElement> = (event) => {
    child.props.onBlur?.(event);
    props.onBlur?.(event);
    hideTooltip();
  };

  return cloneElement(child, {
    onFocus: handleFocus,
    onBlur: handleBlur,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    className: cn(child.props.className, "relative"),
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
  const { isVisible, anchorElement, targetElement, showTooltip, hideTooltip } =
    tooltipContext;

  const [position, setPosition] = useState({ top: 0, left: 0, height: 0 });

  useEffect(() => {
    if (!anchorElement || !targetElement) {
      return;
    }

    const updatePosition = () => {
      const triggerRect = anchorElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const scaleX =
        targetElement.offsetWidth > 0
          ? targetRect.width / targetElement.offsetWidth
          : 1;
      const scaleY =
        targetElement.offsetHeight > 0
          ? targetRect.height / targetElement.offsetHeight
          : 1;

      setPosition({
        top:
          (triggerRect.top - targetRect.top + targetElement.scrollTop) /
          (scaleY || 1),
        left:
          (triggerRect.right - targetRect.left + targetElement.scrollLeft) /
          (scaleX || 1),
        height: triggerRect.height / (scaleY || 1),
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorElement, targetElement]);

  if (!isVisible && !forceVisible) {
    return null;
  }

  if (!anchorElement || !targetElement) {
    return null;
  }

  return createPortal(
    <>
      {/* this avoid hidding the popup when user tries to hover the popup */}
      <div
        className="absolute -translate-x-1 bg-transparent w-3 z-5000"
        style={{
          top: position.top,
          left: position.left,
          height: Math.max(position.height, 16),
        }}
      />
      <div
        className="absolute size-1.5 rotate-45 z-5000 bg-gray-900"
        style={{
          top: position.top + 10,
          left: position.left + 6,
        }}
      />
      <div
        className={cn(
          "absolute z-5000 bg-gray-900 rounded-xs shadow-lg",
          className,
        )}
        style={{
          top: position.top,
          left: position.left + 8,
        }}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        {...props}
      >
        <div>{children}</div>
      </div>
    </>,
    targetElement,
  );
}
