import { Edge, Node, Position } from "@xyflow/react";
import {
  RelativePositionData,
  getNodesRelativePosition,
} from "../math/math.helper";

export type EdgesRelativeData = {
  positions: EdgePositionsIndex;
  siblings: EdgesSiblingsIndex;
};

export type EdgePositionsIndex = {
  [edgeId: string]: RelativePositionData;
};

export type EdgesSiblingsIndex = {
  [handleId: string]: {
    right: string[];
    left: string[];
  };
};

export function computeEdgesRelativeData<
  TNode extends Node,
  TEdge extends Edge
>(nodes: TNode[], edges: TEdge[]) {
  const nodeDic = nodes.reduce(
    (dic, n) => ({
      ...dic,
      [n.id]: n,
    }),
    {} as Record<string, TNode>
  );
  const data = {
    positions: {},
    siblings: {},
  } as EdgesRelativeData;

  edges.forEach((edge) => {
    //target left, source right
    const sourceNode = nodeDic[edge.source];
    const targetNode = nodeDic[edge.target];

    // if we dont find some of the nodes, we return edge as is;
    if (!sourceNode || !targetNode) return edge;

    const positions = getNodesRelativePosition(sourceNode, targetNode);

    data.positions[edge.id] = positions;

    const sourceKey = edge.sourceHandle + positions.sourcePos;
    const targetKey = edge.targetHandle + positions.targetPos;

    assignEdgesSiblingsIndexValue(
      edge.sourceHandle ?? edge.source,
      edge.id,
      positions.sourcePos,
      data.siblings
    );

    assignEdgesSiblingsIndexValue(
      edge.targetHandle ?? edge.target,
      edge.id,
      positions.targetPos,
      data.siblings
    );

    return {
      ...edge,
      data: {
        ...(edge.data ?? {}),
        relativeData: <EdgePositionsIndex>{
          positions,
        },
      },
    };
  });

  return data;
}

function assignEdgesSiblingsIndexValue(
  key: string,
  edgeId: string,
  position: Position,
  index: EdgesSiblingsIndex
) {
  index[key] ??= {
    right: [],
    left: [],
  };

  const indexValue = index[key];
  const positionKey = position as "right" | "left";
  indexValue[positionKey].push(edgeId);
}
