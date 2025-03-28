import { Position, Node, InternalNode } from "@xyflow/react";

// returns the position (top,right,bottom or right) passed node compared to
function getParams(nodeA: InternalNode, nodeB: InternalNode) {
  const boundsA = getNodeBounds(nodeA);
  const boundsB = getNodeBounds(nodeB);

  let position;

  // A on the Right of B
  if (boundsA.xMax < boundsB.xMin) {
    position = Position.Right;
  }
  // A on the Right of B
  else if (boundsA.xMin > boundsB.xMax) {
    position = Position.Left;
  }
  //A aligned with B
  else {
    position = Position.Left;
  }

  const [x, y] = getHandleCoordsByPosition(nodeA, position);
  return [x, y, position];
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

function getNodeCenter(node) {
  return {
    x: node.internals.positionAbsolute.x + node.measured.width / 2,
    y: node.internals.positionAbsolute.y + node.measured.height / 2,
  };
}

function getNodeBounds(node) {
  return {
    xMin: node.internals.positionAbsolute.x,
    xMax: node.internals.positionAbsolute.x + node.measured.width,

    yMin: node.internals.positionAbsolute.y,
    yamx: node.internals.positionAbsolute.y + node.measured.height,
  };
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source, target) {
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

export function distributeCenter(center, range, number, index) {
  const divider = (number % 2 === 0 ? number : number - 1) ?? 1;

  const step = (range * 2) / divider;

  let min = center - range;
  if (number % 2 === 0) {
    min += step / 2;
  }

  const res = min + step * index;
  console.log({ divider, center, range, number, index, step, min, res });
  return res;
}
