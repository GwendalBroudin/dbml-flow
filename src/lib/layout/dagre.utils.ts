import { TableNodeType } from "@/types/nodes.types";
import dagre from "@dagrejs/dagre";
import { Edge, Node } from "@xyflow/react";

const dagreGraph = new dagre.graphlib.Graph({
  multigraph: true,
  compound: true
}).setDefaultEdgeLabel(() => ({}));

const defaultNodeWidth = 172;
const defaultNodeHeight = 36;
const rankdir = "LR";

export const getLayoutedGraph = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir, compound: true, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {

      width: node.measured?.width ?? defaultNodeWidth,
      height: node.measured?.height ?? defaultNodeHeight,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  console.log(dagreGraph);

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = <TableNodeType>{
      ...node,
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - (node.width ?? defaultNodeWidth) / 2,
        y: nodeWithPosition.y - (node.height ?? defaultNodeHeight) / 2,
      },
    };

    return newNode;
  });

  return newNodes;
};
