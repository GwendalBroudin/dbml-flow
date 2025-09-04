import { NodeType } from "@/types/nodes.types";
import dagre from "@dagrejs/dagre";
import { Edge } from "@xyflow/react";
import { getNodeSize, getNodesBounds } from "../math/math.helper";

const dagreGraph = new dagre.graphlib.Graph({
  multigraph: true,
  compound: true,
}).setDefaultEdgeLabel(() => ({}));

const rankdir = "LR";

export const getLayoutedGraph = (
  nodes: NodeType[],
  edges: Edge[]
) => {
  dagreGraph.setGraph({ rankdir, compound: true, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      ...getNodeSize(node),
    });
    if (node.parentId) {
      dagreGraph.setParent(node.id, node.parentId as string);
    }
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  console.log(dagreGraph);

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);

    const newNode = <NodeType>{
      ...node,
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: dagreNode.x - (dagreNode.width) / 2,
        y: dagreNode.y - (dagreNode.height) / 2,
      },
    };

    return newNode;
  });

  return newNodes;
};
