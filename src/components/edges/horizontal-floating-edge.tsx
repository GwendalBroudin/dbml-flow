import { BaseEdge, EdgeProps, useInternalNode } from "@xyflow/react";

import { getHandleCoords } from "@/lib/math/math.helper";
import useStore from "@/state/store";
import { getSmoothStepPath } from "@xyflow/react";
import { useMemo } from "react";
import { markerWidth } from "./markers";
import { distributeMarkers, getMarkerType } from "@/lib/flow/edges.helpers";

export const HorizontalFloatingEdgeTypeName = "horizontal-floating";

const borderRadius = 5;

function HorizontalFloatingEdge({
  id,
  source,
  target,
  style,
  targetHandleId,
  sourceHandleId,
  markerStart,
  markerEnd,
  animated,
  ...props
}: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const { edgesRelativeData } = useStore();

  const [edgePath] = useMemo(() => {
    if (!sourceNode || !targetNode) {
      return [null];
    }

    const positionData = edgesRelativeData?.positions?.[id];
    if (!positionData) return [null];

    const { sourcePos, targetPos } = positionData;
    let [sx, sy] = getHandleCoords(sourceNode, sourceHandleId!, sourcePos);
    let [tx, ty] = getHandleCoords(targetNode, targetHandleId!, targetPos);
    const offsetH = markerWidth - 4;


    // calc y positions depending on number of different relation types per handle and their positions
    const sourceSibling = edgesRelativeData?.siblings?.[sourceHandleId!];
    if (sourceSibling) {
      const markerType = getMarkerType(markerStart!);
      sy = distributeMarkers(sy, markerType, sourceSibling[sourcePos as "right" | "left"]?.markerCountMap)
    }
    const targetSibling = edgesRelativeData?.siblings?.[targetHandleId!];
    if (targetSibling) {
      const markerType = getMarkerType(markerEnd!);
      ty = distributeMarkers(ty, markerType, targetSibling[targetPos as "right" | "left"]?.markerCountMap)
    }

    return getSmoothStepPath({
      // offset to the left or right depending on the source position
      sourceX: sx + (sourcePos === "left" ? -offsetH : offsetH),
      sourceY: sy,
      // offset to the left or right depending on the target position
      targetX: tx + (targetPos === "left" ? -offsetH : offsetH),
      targetY: ty,
      sourcePosition: sourcePos,
      targetPosition: targetPos,
      offset: borderRadius,
      borderRadius: borderRadius,
    });
  }, [sourceNode, targetNode, edgesRelativeData]);

  if (!edgePath) {
    return null;
  }

  return (
    <BaseEdge
      path={edgePath}
      id={id}
      strokeWidth={5}
      style={style}
      markerStart={markerStart}
      markerEnd={markerEnd}

    //cause error React does not recognize the `pathOptions` prop etc...
    // {...props}
    />
  );
}

export default HorizontalFloatingEdge;
