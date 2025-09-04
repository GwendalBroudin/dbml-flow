import { Position, Node, InternalNode, Edge } from "@xyflow/react";
import { max, min } from "lodash-es";

export type NodesRelativePosition = "center" | "right" | "left";
export type RelativePositionData = {
  nodesRelativePosition: NodesRelativePosition;
  sourcePos: Position;
  targetPos: Position;
};
export type NodeBounds = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  width: number;
  height: number;
};

export function getNodesRelativePosition(
  source: Node,
  target: Node
): RelativePositionData {
  const boundsTarget = getNodeBounds(source);
  const boundsSource = getNodeBounds(target);
  // Source on the Right of Target
  if (boundsTarget.xMax < boundsSource.xMin) {
    return {
      nodesRelativePosition: "right",
      sourcePos: Position.Right,
      targetPos: Position.Left,
    };
  }

  // Source on the Right of Target
  else if (boundsTarget.xMin > boundsSource.xMax) {
    return {
      nodesRelativePosition: "left",
      sourcePos: Position.Left,
      targetPos: Position.Right,
    };
  }

  // Source aligned with Target
  else {
    return {
      nodesRelativePosition: "center",
      sourcePos: Position.Right,
      targetPos: Position.Right,
    };
  }
}

export function getNodesBounds(nodes: Node[]) {
  const bounds = nodes.map((n) => getNodeBounds(n));
  let xMin = min(bounds.map((e) => e.xMin))!;
  let xMax = max(bounds.map((e) => e.xMax))!;
  let yMin = min(bounds.map((e) => e.yMin))!;
  let yMax = max(bounds.map((e) => e.yMax))!;

  return <NodeBounds>{
    xMin,
    xMax,
    yMin,
    yMax,
    width: xMax - xMin,
    height: yMax - yMin,
  };
}

const defaultNodeWidth = 172;
const defaultNodeHeight = 36;

export function getNodeSize(node: Node) {
  return {
    width: node.measured?.width ?? node.initialWidth ?? defaultNodeWidth,
    height: node.measured?.height ?? node.initialHeight ?? defaultNodeHeight,
  };
}

function getNodeBounds(node: Node) {
  const size = getNodeSize(node);

  return {
    xMin: node.position.x,
    xMax: node.position.x + size.width!,

    yMin: node.position.y,
    yMax: node.position.y + size.height!,
  };
}

export function distributeCenter(
  center: number,
  range: number,
  length: number,
  index: number
) {
  const divider = (length % 2 === 0 ? length : length - 1) ?? 1;

  const step = (range * 2) / divider;

  let min = center - range;
  if (length % 2 === 0) {
    min += step / 2;
  }

  const res = min + step * index;
  // console.log({ divider, center, range, number, index, step, min, res });
  return res;
}

export function getHandleCoords(
  node: InternalNode,
  handleId: string,
  handlePosition: Position
) {
  // all handles are from type source, that's why we use handleBounds.source here
  const handleBounds = node.internals?.handleBounds;

  const handle = [
    ...(handleBounds!.source ?? []),
    ...(handleBounds!.target ?? []),
  ].find((h) => h.position === handlePosition && h.id === handleId);

  if (!handle) {
    throw new Error(`Handle not found for position: ${handlePosition}`);
  }

  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;

  // this is a tiny detail to make the markerEnd of an edge visible.
  // The handle position that gets calculated has the origin top-left, so depending which side we are using, we add a little offset
  // when the handlePosition is Position.Right for example, we need to add an offset as big as the handle itself in order to get the correct position
  switch (handlePosition) {
    case Position.Left:
      offsetX = 0;
      break;
    case Position.Right:
      offsetX = handle.width;
      break;
  }

  const x = node.internals.positionAbsolute.x + handle.x + offsetX;
  const y = node.internals.positionAbsolute.y + handle.y + offsetY;

  return [x, y];
}

