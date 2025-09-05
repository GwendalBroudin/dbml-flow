import {
  distributeMarkers,
  EdgesRelativeData,
  getMarkerType,
} from "@/lib/flow/edges.helpers";
import { getHandleCoords } from "@/lib/math/math.helper";
import { InternalGroupNode, InternalTableNode } from "@/types/nodes.types";
import { getSmoothStepPath, InternalNode } from "@xyflow/react";
import { ERMarkerTypes, markerWidth } from "./markers";
import { borderRadius } from "./table-edge";

export function getTableHandleData(
  tableNode: InternalTableNode,
  groupNode: InternalGroupNode | undefined,
  fieldId: string,
  marker: string
) {
  let handleId = fieldId;
  let folded = false;
  if (groupNode?.data.folded) {
    folded = true;
    marker = ERMarkerTypes.none;
    handleId = groupNode.id;
  }
  else if (tableNode?.data.folded){
    folded = true;
    marker = ERMarkerTypes.none;
    handleId = tableNode.id;
  } 
  return { handleId, marker, folded };
}

export function getEdgePath(
  edgesRelativeData: EdgesRelativeData,
  id: string,
  sourceHandleId: string,
  targetHandleId: string,
  markerStart: string,
  markerEnd: string,
  sourceNode: InternalNode | undefined,
  targetNode: InternalNode | undefined
) {
  if (!sourceNode || !targetNode) {
    return {};
  } else if (sourceHandleId === targetHandleId) {
    return {}; // If same handle, don't draw the edge
  }

  const positionData = edgesRelativeData?.positions?.[id];
  if (!positionData) return {};

  const { sourcePos, targetPos } = positionData;
  let [sx, sy] = getHandleCoords(sourceNode, sourceHandleId!, sourcePos);
  let [tx, ty] = getHandleCoords(targetNode, targetHandleId!, targetPos);
  const offsetH = markerWidth - 4;

  // calc y positions depending on number of different relation types per handle and their positions
  const sourceSibling = edgesRelativeData?.siblings?.[sourceHandleId!];
  if (sourceSibling) {
    const markerType = getMarkerType(markerStart!);
    sy = distributeMarkers(
      sy,
      markerType,
      sourceSibling[sourcePos as "right" | "left"]?.markerCountMap
    );
  }
  const targetSibling = edgesRelativeData?.siblings?.[targetHandleId!];
  if (targetSibling) {
    const markerType = getMarkerType(markerEnd!);
    ty = distributeMarkers(
      ty,
      markerType,
      targetSibling[targetPos as "right" | "left"]?.markerCountMap
    );
  }

  const [edgePath, labelX, labelY] = getSmoothStepPath({
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
  return { edgePath, labelX, labelY, sx, sy, tx, ty, sourcePos, targetPos };
}
