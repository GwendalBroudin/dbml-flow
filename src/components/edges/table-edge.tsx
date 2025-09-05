import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  Position,
  useInternalNode,
} from "@xyflow/react";

import useStore from "@/state/store";
import {
  InternalGroupNode,
  InternalTableNode,
  TableEdgeData,
} from "@/types/nodes.types";
import { useMemo } from "react";
import { ERMakerLabels } from "./markers";
import { getEdgePath, getTableHandleData } from "./table-edge.helpers";

export const TableEdgeTypeName = "table-edge";

export const borderRadius = 5;

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
  const sourceTableNode = useInternalNode(source) as InternalTableNode;
  const targetTableNode = useInternalNode(target) as InternalTableNode;
  const sourceGroupNode = useInternalNode(
    sourceTableNode?.data.groupId || ""
  ) as InternalGroupNode;
  const targetGroupNode = useInternalNode(
    targetTableNode?.data.groupId || ""
  ) as InternalGroupNode;

  const { edgesRelativeData } = useStore();
  const {
    handleId: calcSourceHandleId,
    marker: calcMarkerStart,
    folded: sourceFolded,
  } = getTableHandleData(
    sourceTableNode,
    sourceGroupNode,
    sourceHandleId || "",
    markerStart || ""
  );
  const {
    handleId: calcTargetHandleId,
    marker: calcMarkerEnd,
    folded: targetFolded,
  } = getTableHandleData(
    targetTableNode,
    targetGroupNode,
    targetHandleId || "",
    markerEnd || ""
  );

  console.log("Render TableEdge", id, calcSourceHandleId, calcTargetHandleId);

  const { edgePath, labelX, labelY, sx, sy, tx, ty, sourcePos, targetPos } =
    useMemo(
      () =>
        getEdgePath(
          edgesRelativeData,
          id,
          calcSourceHandleId || "",
          calcTargetHandleId || "",
          calcMarkerStart || "",
          calcMarkerEnd || "",
          sourceTableNode,
          targetTableNode
        ),
      [sourceTableNode, targetTableNode, edgesRelativeData]
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
      markerStart={calcMarkerStart}
      markerEnd={calcMarkerEnd}
      //cause error React does not recognize the `pathOptions` prop etc...
      // {...props}
    >
      <EdgeLabels
        displayed={!!animated}
        displaySource={!sourceFolded}
        displayTarget={!targetFolded}
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
  displaySource: boolean;
  displayTarget: boolean;
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
  displaySource,
  displayTarget,
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
      {displaySource && (
        <EdgeMarkerLabel
          label={sourceLabel}
          labelX={sx}
          labelY={sy}
          transX={sourcePos === Position.Right ? 0 : -100}
        />
      )}
      {displayTarget && (
        <EdgeMarkerLabel
          label={targetLabel}
          labelX={tx}
          labelY={ty}
          transX={targetPos === Position.Right ? 0 : -100}
        />
      )}
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

export default TableEdge;
