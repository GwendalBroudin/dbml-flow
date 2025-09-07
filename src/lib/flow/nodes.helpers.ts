import { applyNodeChanges, Node } from "@xyflow/react";

export function replaceNodeData<TNode extends Node>(
  nodes: TNode[],
  node: TNode,
  nodeId: string,
  data: Partial<TNode["data"]>
) {
  return applyNodeChanges<TNode>(
    [
      {
        id: nodeId,
        type: "replace" as const,
        //@ts-ignore
        item: {
          ...node,
          data: {
            ...node.data,
            ...data,
          },
        },
      },
    ],
    nodes
  );
}
