import { NodeType } from "@/types/nodes.types";
import { getNodesBounds } from "../math/math.helper";

export function setGroupsSizes(
  nodesById: Map<string, NodeType>,
  moveChildren = true,
  groupPadding = 20
) {
  nodesById
    .values()
    .filter((n) => n.type === "group")
    .forEach((groupNode) => {
      const children = groupNode.data.nodeIds
        .map((id) => nodesById.get(id))
        .filter((n) => !!n);

      const bounds = getNodesBounds(children, nodesById);

      groupNode.width = bounds.width + groupPadding * 2;
      groupNode.height = bounds.height + groupPadding * 2;

      if (moveChildren) {
        groupNode.position = {
          x: bounds.xMin - groupPadding,
          y: bounds.yMin - groupPadding,
        };

        children.forEach((child) => {
          child.position = {
            x: child.position.x - groupNode.position.x,
            y: child.position.y - groupNode.position.y,
          };
        });
      }
    });

  console.log("setGroupsSizes", nodesById);
}
