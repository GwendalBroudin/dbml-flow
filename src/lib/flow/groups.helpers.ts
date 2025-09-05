import { GroupNodeType, NodeType, NodeTypes } from "@/types/nodes.types";
import { getNodesBounds, NodeBounds } from "../math/math.helper";
import { NodeChange, NodePositionChange } from "@xyflow/react";
import { vectorAdd, vectorSub } from "../math/vector.helper";
import { GROUP_PADDING, HEADER_HEIGHT } from "@/components/constants";

/**
 * Calculate and update group nodes parameters (width, height, position) based on their children nodes bounds.
 * @param groupNodes
 * @param childrenNodesById
 * @param moveChildren
 * @param groupPadding
 * @returns
 */
export function getBoundedGroups(
  groupNodes: GroupNodeType[],
  childrenNodesById: Map<string, NodeType>,
  groupPadding = GROUP_PADDING
) {
  return groupNodes.map((groupNode) => {
    const children = groupNode.data.nodeIds
      .map((id) => childrenNodesById.get(id))
      .filter((n) => !!n);

    const bounds = getNodesBounds(children);
    const dimensions = getGroupDimensionsAndPosition(bounds, groupPadding);
    return {
      ...groupNode,
      ...dimensions,
    };
  });
}

export function computeRelatedGroupChanges(
  changes: NodeChange<NodeType>[],
  oldNodesById: Map<string, NodeType>,
  groupPadding = GROUP_PADDING
) {
  const computedChanges = [] as NodeChange<NodeType>[];
  for (const change of changes) {
    if (change.type !== "position") continue;

    const oldNode = oldNodesById.get(change.id);
    if (!oldNode) continue;

    if (oldNode.type === NodeTypes.TableGroup) {
      if (oldNode.data.nodeIds.length === 0) continue; // no children, no need to update anything

      const drag = vectorSub(change.position!, oldNode.position);

      oldNode.data.nodeIds.forEach((nodeId) => {
        const childNode = oldNodesById.get(nodeId);
        if (!childNode) return null;

        computedChanges.push(<NodePositionChange>{
          id: nodeId,
          type: "position",
          position: vectorAdd(childNode.position, drag),
          dragging: true,
        });
      });

    } else if (oldNode.type === NodeTypes.Table && oldNode.data.parentId) {
      const groupParent = oldNodesById.get(oldNode.data.parentId) as
        | GroupNodeType
        | undefined;
      if (!groupParent) continue;

      const children = groupParent.data.nodeIds
        .map((id) => {
          const node = oldNodesById.get(id);
          if (!node) return null;

          return {
            ...node,
            position: id === change.id ? change.position! : node.position,
          };
        })
        .filter((n) => !!n);

      const bounds = getNodesBounds(children);
      const dimensions = getGroupDimensionsAndPosition(bounds, groupPadding);

      computedChanges.push({
        id: groupParent.id,
        type: "dimensions" as const,
        dimensions: {
          width: dimensions.width,
          height: dimensions.height,
        },
      });
      computedChanges.push({
        id: groupParent.id,
        type: "position" as const,
        position: dimensions.position,
        dragging: true,
      });
    }
  }
  return computedChanges;
}

export function getGroupDimensionsAndPosition(
  bounds: NodeBounds,
  padding: number
) {
  return {
    width: bounds.width + padding * 2,
    height: bounds.height + padding * 2 + HEADER_HEIGHT,
    position: {
      x: bounds.xMin - padding,
      y: bounds.yMin - padding - HEADER_HEIGHT,
    },
  };
}
