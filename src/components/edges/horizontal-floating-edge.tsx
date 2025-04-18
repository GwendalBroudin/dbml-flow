import { BaseEdge, EdgeProps, useInternalNode } from "@xyflow/react";

import { getSmoothStepPath } from "@xyflow/react";
import useStore from "@/state/store";
import { useMemo } from "react";
import { getEdgeParams, getHandleCoords } from "@/lib/math/math.helper";

export const HorizontalFloatingEdgeTypeName = "horizontal-floating";

function HorizontalFloatingEdge({
  id,
  source,
  target,
  style,
  targetHandleId,
  sourceHandleId,
  ...props
}: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { edgesRelativeData } = useStore();
  const positionData = edgesRelativeData?.positions?.[id];
  if (!positionData) return null;

  const { sourcePos, targetPos } = positionData;
  const [sx, sy] = getHandleCoords(sourceNode, sourceHandleId!, sourcePos);
  const [tx, ty] = getHandleCoords(targetNode, targetHandleId!, targetPos);

  // return useMemo(() => {
  const [edgePath] = getSmoothStepPath({
    sourceX: sx,
    // calc number depending on number of different relation types per handle
    // sourceY: distributeCenter(sy, 10, 3, props.data.index),
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
    offset: 5,
  });

  return (
    <BaseEdge
      path={edgePath}
      id={id}
      // d={edgePath}
      strokeWidth={5}
      style={style}
      //cause error React does not recognize the `pathOptions` prop
      // {...props}
    />
  );
  // }, [sourcePos, targetPos, sx, sy, tx, ty]);
}

export default HorizontalFloatingEdge;
