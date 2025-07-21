import { Position, Node, InternalNode, Edge } from "@xyflow/react";

// returns the position (top,right,bottom or right) passed node compared to
function getParams(nodeA: InternalNode, nodeB: InternalNode) {
  let data = getNodesRelativePosition(nodeA, nodeB);

  const [x, y] = getHandleCoordsByPosition(nodeA, data.sourcePos);
  return [x, y, data];
}
export type NodesRelativePosition = "center" | "right" | "left";
export type RelativePositionData = {
  nodesRelativePosition: NodesRelativePosition;
  sourcePos: Position;
  targetPos: Position;
};

export function getNodesRelativePosition(
  source: Node | InternalNode,
  target: Node | InternalNode
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

function getHandleCoordsByPosition(
  node: InternalNode,
  handlePosition: Position
) {
  // all handles are from type source, that's why we use handleBounds.source here
  const handle = node.internals?.handleBounds?.source?.find(
    (h) => h.position === handlePosition
  );
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

function getNodeCenter(node: InternalNode) {
  return {
    x: node.internals.positionAbsolute.x + node.measured.width! / 2,
    y: node.internals.positionAbsolute.y + node.measured.height! / 2,
  };
}

function getNodeBounds(node: Node | InternalNode) {
  const position =
    (node as InternalNode).internals?.positionAbsolute ?? node.position;
  const size = node.measured ?? { width: node.width, height: node.height };

  return {
    xMin: position.x,
    xMax: position.x + size.width!,

    yMin: position.y,
    yamx: position.y + size.height!,
  };
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: InternalNode, target: InternalNode) {
  const [sx, sy, sourcePos] = getParams(source, target);
  const [tx, ty, targetPos] = getParams(target, source);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos,
  };
}

export function getEdgePositions(source: InternalNode, target: InternalNode) {
  const [sx, sy, sourcePos] = getParams(source, target);
  const [tx, ty, targetPos] = getParams(target, source);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos,
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
