import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  InternalNode,
  Position,
  useInternalNode,
} from "@xyflow/react";

import {
  distributeMarkers,
  EdgesRelativeData,
  getMarkerType,
} from "@/lib/flow/edges.helpers";
import { getHandleCoords } from "@/lib/math/math.helper";
import useStore from "@/state/store";
import { TableEdgeData } from "@/types/nodes.types";
import { getSmoothStepPath } from "@xyflow/react";
import { useMemo } from "react";
import { ERMakerLabels, markerWidth } from "./markers";

export const TableEdgeTypeName = "table-edge";

const borderRadius = 5;

function TableEdge({
  id,
  source,
  target,
  style,
  targetHandleId,
  sourceHandleId,
  markerStart,
  markerEnd,
  animated,
  data,
  ...props
}: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const { edgesRelativeData } = useStore();

  const { edgePath, labelX, labelY, sx, sy, tx, ty, sourcePos, targetPos } =
    useMemo(
      () =>
        getEdgePath(
          edgesRelativeData,
          id,
          targetHandleId || "",
          sourceHandleId || "",
          markerStart || "",
          markerEnd || "",
          sourceNode,
          targetNode
        ),
      [sourceNode, targetNode, edgesRelativeData]
    );

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
    >
      <EdgeLabels
        displayed={!!animated}
        data={data}
        labelX={labelX}
        labelY={labelY}
        sx={sx}
        sy={sy}
        tx={tx}
        ty={ty}
        sourcePos={sourcePos}
        targetPos={targetPos}
      />
    </BaseEdge>
  );
}

export type EdgeLabelsProps = {
  displayed: boolean;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  labelX: number;
  labelY: number;
  data: Record<string, unknown> | undefined;
  sourcePos: Position;
  targetPos: Position;
};

export function EdgeLabels({
  displayed,
  sx,
  sy,
  tx,
  ty,
  labelX,
  labelY,
  data,
  sourcePos,
  targetPos,
}: EdgeLabelsProps) {
  if (!displayed) return null;

  const tableEdgeData = data as TableEdgeData;
  const ref = tableEdgeData?.ref;
  const label = ref?.name ?? "";
  const sourceLabel =
    ERMakerLabels[tableEdgeData?.sourceRelationType ?? "none"];
  const targetLabel =
    ERMakerLabels[tableEdgeData?.targetRelationType ?? "none"];

  return (
    <EdgeLabelRenderer>
      <EdgeLabel label={label} labelX={labelX} labelY={labelY} />
      <EdgeMarkerLabel
        label={sourceLabel}
        labelX={sx}
        labelY={sy}
        transX={sourcePos === Position.Right ? 0 : -100}
      />
      <EdgeMarkerLabel
        label={targetLabel}
        labelX={tx}
        labelY={ty}
        transX={targetPos === Position.Right ? 0 : -100}
      />
    </EdgeLabelRenderer>
  );
}

export function EdgeMarkerLabel({
  label,
  labelX,
  labelY,
  transX,
}: {
  label: string;
  labelX: number;
  labelY: number;
  transX: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        transform: `translate(${transX}%, -100%)  translate(${labelX}px,${labelY}px)`,
        padding: 0,
      }}
      className="nodrag nopan text-[0.6rem]"
    >
      {label}
    </div>
  );
}

export function EdgeLabel({
  label,
  labelX,
  labelY,
}: {
  label: string;
  labelX: number;
  labelY: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        transform: `translate(-50%, -50%)  translate(${labelX}px,${labelY}px)`,
      }}
      className="nodrag nopan px-1 bg-gray-100 text-gray-800 text-xs rounded-xs border border-gray-300"
    >
      {label}
    </div>
  );
}

export function getEdgePath(
  edgesRelativeData: EdgesRelativeData,
  id: string,
  targetHandleId: string,
  sourceHandleId: string,
  markerStart: string,
  markerEnd: string,
  sourceNode: InternalNode | undefined,
  targetNode: InternalNode | undefined
) {
  if (!sourceNode || !targetNode) {
    return {};
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

export default TableEdge;
