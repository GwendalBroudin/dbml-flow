import { ERMarkerTypes } from "@/components/edges/markers";
import {
  ERRelationTypes,
  TableEdgeType,
  TableEdgeTypeName,
} from "@/types/nodes.types";
import Database from "@dbml/core/types/model_structure/database";
import Endpoint from "@dbml/core/types/model_structure/endpoint";
import Field from "@dbml/core/types/model_structure/field";
import Ref from "@dbml/core/types/model_structure/ref";
import { uniqBy } from "lodash-es";
import { getFieldId, getGroupId, getTableId } from "./node-dmbl.parser";

export function mapDatabaseToEdges(
  database: Database,
  foldedIds: Set<string>
): TableEdgeType[] {
  const edges = database.schemas
    .flatMap((s) => s.refs)
    .map((r) => mapToEdge(r, foldedIds))
    .filter((e) => e.source !== e.target && e.sourceHandle !== e.targetHandle); // remove self loop edges

  return uniqBy(
    edges,
    (e) => `${e.source}-${e.target}-${e.sourceHandle}-${e.targetHandle}`
  ); // remove duplicate edges (can happen folding groups)
}

export function mapToEdge(ref: Ref, foldedIds: Set<string>) {
  const sourceEndPoint = ref.endpoints[0];
  const targetEndPoint = ref.endpoints[1];

  const sourceField = sourceEndPoint.fields[0];
  const sourcefieldId = getFieldId(sourceField);
  const targetField = targetEndPoint.fields[0];
  const targetfieldId = getFieldId(targetField);

  const {
    handleId: sourceHandle,
    marker: markerStart,
    folded: sourceFolded,
    relationType: sourceRelationType,
    nodeId: source,
  } = getHandleData(sourceField, sourceEndPoint, foldedIds);

  const {
    handleId: targetHandle,
    marker: markerEnd,
    folded: targetFolded,
    relationType: targetRelationType,
    nodeId: target,
  } = getHandleData(targetField, targetEndPoint, foldedIds);

  return <TableEdgeType>{
    id: ref.id.toString(),
    source,
    target,
    type: TableEdgeTypeName,
    sourceHandle,
    targetHandle,
    markerStart,
    markerEnd,
    data: {
      sourcefieldId,
      targetfieldId,
      ref,
      sourceRelationType,
      targetRelationType,
      sourceFolded,
      targetFolded,
    },
  };
}

function getHandleData(
  field: Field,
  endPoint: Endpoint,
  foldedIds: Set<string>
) {
  const tableNodeId = getTableId(field.table)!;
  const groupNodeId = getGroupId(field.table.group);
  const fieldId = getFieldId(field);
  let handleId = fieldId;
  let nodeId = tableNodeId;

  let folded = false;
  if (groupNodeId && foldedIds.has(groupNodeId)) {
    folded = true;
    handleId = groupNodeId;
    nodeId = groupNodeId;
  } else if (foldedIds.has(tableNodeId)) {
    folded = true;
    handleId = tableNodeId;
  }
  const relationType = getRelationType(endPoint, field);
  return {
    nodeId,
    handleId,
    marker: folded ? ERMarkerTypes.none : relationType,
    relationType,
    folded,
  };
}

export function getRelationType(
  endPoint: Endpoint,
  targetfield: Field
): ERRelationTypes {
  if (endPoint.relation === "1" && isNotNull(targetfield)) {
    return "one";
  } else if (endPoint.relation === "1") {
    return "oneOptionnal";
  } else if (endPoint.relation === "*") {
    return "many";
  }

  throw new Error("Unknown relation type");
}

export function isNotNull(field: Field): boolean {
  const table = field.table;
  return (
    field.not_null ||
    field.pk ||
    (table.indexes?.find((i) => i.columns.some((c) => c.value === field.name))
      ?.pk as unknown as boolean)
  );
}
