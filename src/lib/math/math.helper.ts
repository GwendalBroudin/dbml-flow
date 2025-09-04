import { Position, Node, InternalNode, Edge } from "@xyflow/react";
import { max, min } from "lodash-es";

export type NodesRelativePosition = "center" | "right" | "left";
export type RelativePositionData = {
  nodesRelativePosition: NodesRelativePosition;
  sourcePos: Position;
  targetPos: Position;
};

export function getNodesRelativePosition(
  source: Node,
  target: Node,
  nodesByIds: Map<string, Node>
): RelativePositionData {
  const boundsTarget = getNodeBounds(source, nodesByIds);
  const boundsSource = getNodeBounds(target, nodesByIds);
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

export function getNodesBounds(nodes: Node[], nodesByIds: Map<string, Node>) {
  const bounds = nodes.map((n) => getNodeBounds(n, nodesByIds));
  let xMin = min(bounds.map((e) => e.xMin))!;
  let xMax = max(bounds.map((e) => e.xMax))!;
  let yMin = min(bounds.map((e) => e.yMin))!;
  let yMax = max(bounds.map((e) => e.yMax))!;

  return {
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

function getNodeBounds(node: Node, nodesByIds: Map<string, Node>) {
  const position = getNodeAbsPosition(node, nodesByIds);
  const size = getNodeSize(node);

  return {
    xMin: position.x,
    xMax: position.x + size.width!,

    yMin: position.y,
    yMax: position.y + size.height!,
  };
}

function getNodeAbsPosition(
  node: Node,
  nodesByIds: Map<string, Node>
): { x: number; y: number } {
  const parent = node.parentId ? nodesByIds.get(node.parentId) : null;
  if (!parent) return node.position;

  const parentAbsPosition = getNodeAbsPosition(parent, nodesByIds);
  return {
    x: parentAbsPosition.x + node.position.x,
    y: parentAbsPosition.y + node.position.y,
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
