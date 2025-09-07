import {
  GroupNodeData,
  GroupNodeType,
  NodeType,
  NodeTypes,
} from "@/types/nodes.types";
import { getNodesBounds, NodeBounds } from "../math/math.helper";
import { NodeChange, NodePositionChange } from "@xyflow/react";
import { vectorAdd, vectorSub } from "../math/vector.helper";
import { GROUP_PADDING, HEADER_HEIGHT } from "@/components/table-constants";

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
    const position = getGroupPosition(bounds, groupPadding);
    const dimensions = getGroupDimensions(bounds, groupPadding);
    return {
      ...groupNode,
      position,
      initialHeight: dimensions.heightWithHeader,
      initialWidth: dimensions.width,
      data: {
        ...groupNode.data,
        dimensions,
        bounds,
      },
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
    } else if (oldNode.type === NodeTypes.Table && oldNode.data.groupId) {
      const groupParent = oldNodesById.get(oldNode.data.groupId) as
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

      computedChanges.push(
        computeGroupDimentionsChange(groupParent, bounds, groupPadding)
      );
      computedChanges.push({
        id: groupParent.id,
        type: "position" as const,
        position: getGroupPosition(bounds, groupPadding),
        dragging: true,
      });
    }
  }
  return computedChanges;
}

export function computeGroupDimentionsChange(
  groupParent: GroupNodeType,
  bounds: NodeBounds,
  groupPadding: number
) {
  const dimensions = getGroupDimensions(bounds, groupPadding);

  return {
    id: groupParent.id,
    type: "replace" as const,
    item: {
      ...groupParent,
      initialHeight: dimensions.heightWithHeader,
      initialWidth: dimensions.width,
      data: <GroupNodeData>{
        ...groupParent.data,
        bounds,
        dimensions,
      },
    },
  };
}

export function getGroupPosition(bounds: NodeBounds, padding: number) {
  return {
    x: bounds.xMin - padding,
    y: bounds.yMin - padding - HEADER_HEIGHT,
  };
}

export function getGroupDimensions(bounds: NodeBounds, padding: number) {
  const height = bounds.height + padding * 2;
  return {
    width: bounds.width + padding * 2,
    heightWithHeader: height + HEADER_HEIGHT,
    height,
  };
}
