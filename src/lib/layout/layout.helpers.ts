import { NodePositionIndex } from "@/types/nodes.types";
import { Edge, Node } from "@xyflow/react";
import { resourceUsage } from "process";

export function toNodeIndex<TNode extends Node>(nodes: TNode[]) {
  return nodes.reduce((acc, node) => {
    acc[node.id] = [node.position.x, node.position.y];
    return acc;
  }, {} as NodePositionIndex);
}

export function applySavedPositions<TNode extends Node>(
  nodes: TNode[],
  savedPositions: NodePositionIndex
) {
  return nodes.map(
    (node) =>
      <TNode>{
        ...node,
        position: {
          x: savedPositions[node.id]?.[0] ?? node.position.x,
          y: savedPositions[node.id]?.[1] ?? node.position.y,
        },
      }
  );
}

export function getEdgePositions(edges: Edge[], nodes: Node[]) {
  return edges;
//   const nodeMap = nodes.reduce((acc, node) => {
//     acc[node.id] = node;
//     return acc;
//   }, {} as Record<string, Node>);

//   const edgeMap = 

// return edges.map((edge) => {
//   const sourceNode = nodeMap[edge.source];
//   const targetNode = nodeMap[edge.target];


//   return {
//     sourcePosition: edge.sourceHandle ? "right" : "left",
//     targetPosition: edge.targetHandle ? "right" : "left",
//   };
}
