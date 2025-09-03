import { NodeType, NodeWithGuessedSize } from "@/types/nodes.types";
import dagre from "@dagrejs/dagre";
import { Edge, getNodesBounds } from "@xyflow/react";

const dagreGraph = new dagre.graphlib.Graph({
  multigraph: true,
  compound: true,
}).setDefaultEdgeLabel(() => ({}));

const defaultNodeWidth = 172;
const defaultNodeHeight = 36;

const groupPadding = 20;

const rankdir = "LR";

export const getLayoutedGraph = (
  nodes: NodeWithGuessedSize[],
  edges: Edge[]
) => {
  dagreGraph.setGraph({ rankdir, compound: true, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.measured?.width ?? node.guessed?.width ?? defaultNodeWidth,
      height:
        node.measured?.height ?? node.guessed?.height ?? defaultNodeHeight,
    });
    if (node.data.parentId) {
      dagreGraph.setParent(node.id, node.data.parentId as string);
    }
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  console.log(dagreGraph);

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // if (node.type === "group") {
    //   node.width = 800;
    //   node.height = 300;
    //   console.log("group node", {
    //     id: node.id,
    //     width: node.width,
    //     height: node.height,
    //     position: {
    //       x: nodeWithPosition.x - node.width / 2,
    //       y: nodeWithPosition.y - node.height / 2,
    //     },
    //   });
    // }

    const newNode = <NodeType>{
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

  const nodesById = new Map<string, NodeType>();
  newNodes.forEach((n) => nodesById.set(n.id, n));

  newNodes
    .filter((n) => n.type === "group")
    .forEach((groupNode) => {
      const children = groupNode.data.nodeIds
        .map((id) => nodesById.get(id))
        .filter((n) => !!n);

      const bounds = getNodesBounds(children);

      groupNode.width = bounds.width + groupPadding * 2;
      groupNode.height = bounds.height + groupPadding * 2;

      groupNode.position = {
        x: bounds.x - groupPadding,
        y: bounds.y - groupPadding,
      };

      children.forEach((child) => {
        child.position = {
          x: child.position.x - groupNode.position.x,
          y: child.position.y - groupNode.position.y,
        };
      });
    });


  return newNodes;
};
