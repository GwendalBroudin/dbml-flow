import { Edge, EdgeMarkerType, Node, Position } from "@xyflow/react";
import {
  RelativePositionData,
  distributeCenter,
  getNodesRelativePosition,
} from "../math/math.helper";
import { ERMarkerTypes } from "@/components/edges/markers";

export type EdgesRelativeData = {
  positions: EdgePositionsIndex;
  siblings: EdgesSiblingsIndex;
};

export type EdgePositionsIndex = {
  [edgeId: string]: RelativePositionData;
};

type SiblingEdgeSideData = {
  edgeIds: string[];
  markerCountMap: Record<string, number>;
};

export type EdgeSiblingData = {
  right: SiblingEdgeSideData;
  left: SiblingEdgeSideData;
};

export type EdgesSiblingsIndex = {
  [handleId: string]: EdgeSiblingData;
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

    assignEdgesSiblingsIndexValue(
      edge.sourceHandle ?? edge.source,
      edge.id,
      edge.markerStart,
      positions.sourcePos,
      data.siblings
    );

    assignEdgesSiblingsIndexValue(
      edge.targetHandle ?? edge.target,
      edge.id,
      edge.markerEnd,
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

  console.log("edgesRelativeData", data);

  return data;
}

export function distributeMarkers(value: number, markerType: string, siblings: SiblingEdgeSideData['markerCountMap'], range = 10) {
  const entries = Object.entries(siblings).filter(([_, value]) => value > 0);

  if(!entries.length || entries.length === 1) return value;

  const index = entries.findIndex(([key]) => key === markerType);
  console.log({length: entries.length, index, markerType, siblings})
  return distributeCenter(value, 10, entries.length, index);
}

//TODO: hanlde parameter by using regex
export function getMarkerType(marker: string){
  return marker.replace("url('#", "").replace("')", "");
}

function assignEdgesSiblingsIndexValue(
  key: string,
  edgeId: string,
  marker: EdgeMarkerType | undefined,
  position: Position,
  index: EdgesSiblingsIndex
) {
  index[key] ??= initSiblingIndex();

  const indexValue = index[key];
  const positionKey = position as "right" | "left";
  const data = indexValue[positionKey];
  data.edgeIds.push(edgeId);
  data.markerCountMap[getMarkerName(marker)] += 1;
}

function getMarkerName(marker: EdgeMarkerType | undefined) {
  if (!marker) return ERMarkerTypes.none;
  else if (typeof marker === "string") return marker;

  return marker.type;
}

/**
 * This ensure that those markers are sorted in the same order as the ERMarkerTypes
 */
export const sortedMarkerTypes = [
  ERMarkerTypes.none,
  ERMarkerTypes.oneOptionnal,
  ERMarkerTypes.one,
  ERMarkerTypes.many,
] as const;

function initSiblingIndex() {
  const markerCountMap = sortedMarkerTypes.reduce((acc, marker) => {
    acc[marker] = 0;
    return acc;
  }, {} as Record<string, number>);

  return <EdgeSiblingData>{
    right: {
      edgeIds: [],
      markerCountMap: { ...markerCountMap },
    },
    left: {
      edgeIds: [],
      markerCountMap: { ...markerCountMap },
    }
  };
}