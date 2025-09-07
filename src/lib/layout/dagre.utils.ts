import { GroupNodeType, NodeType, TableNodeType } from "@/types/nodes.types";
import dagre from "@dagrejs/dagre";
import { Edge } from "@xyflow/react";
import { getNodeSize, getNodesBounds } from "../math/math.helper";

const rankdir = "LR";

const dagreGraph = new dagre.graphlib.Graph({
  multigraph: true,
  compound: true,
})
  .setDefaultEdgeLabel(() => ({}))
  .setGraph({ rankdir, compound: true, ranksep: 30 });

function clearDagreGraph() {
  dagreGraph.nodes().forEach((node) => {
    dagreGraph.removeNode(node);
  });
  dagreGraph.edges().forEach((edge) => {
    dagreGraph.removeEdge(edge.v, edge.w, edge.name);
  });
}

export function getLayoutedGraph(
  tableNodes: TableNodeType[],
  groupNodes: GroupNodeType[],
  edges: Edge[]
) {
  dagreGraph.setGraph({ rankdir, compound: true, ranksep: 30 });
  clearDagreGraph();

  // Set nodes with their width and height
  tableNodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      ...getNodeSize(node),
    });
  });

  groupNodes.forEach((group) => {
    dagreGraph.setNode(group.id, {});
    if (group.data.nodeIds.length === 0) return;

    if (!group.data.folded)
      group.data.nodeIds.forEach((id) => {
        dagreGraph.setParent(id, group.id);
      });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  console.log(dagreGraph);

  dagre.layout(dagreGraph);

  const newNodes = tableNodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);

    const newNode = <TableNodeType>{
      ...node,
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: dagreNode.x - dagreNode.width / 2,
        y: dagreNode.y - dagreNode.height / 2,
      },
    };

    return newNode;
  });

  return newNodes;
}
