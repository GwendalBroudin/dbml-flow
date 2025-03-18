import dagre from "@dagrejs/dagre";
import { Edge, Node, useNodesInitialized, useReactFlow } from "@xyflow/react";
import { useEffect } from "react";

const dagreGraph = new dagre.graphlib.Graph({
  multigraph: true,
  compound: true
}).setDefaultEdgeLabel(() => ({}));

const defaultNodeWidth = 172;
const defaultNodeHeight = 36;
const rankdir = "LR";

const getLayoutedGraph = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir, compound: true });

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
    const newNode = <Node>{
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

  return { nodes: newNodes, edges };
};

export default function useDagre() {
  const nodesInitialized = useNodesInitialized();
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow();

  useEffect(() => {
    if (nodesInitialized) {
      const graph = getLayoutedGraph(getNodes(), getEdges());
      setNodes(graph.nodes);

      setTimeout(() => fitView(), 10);
    }
  }, [nodesInitialized, getNodes, getEdges, setNodes, fitView]);
}
