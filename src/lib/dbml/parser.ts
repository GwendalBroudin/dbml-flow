import { HorizontalFloatingEdgeTypeName } from "@/components/edges/horizontal-floating-edge";
import {
  ERRelationTypes,
  GroupNodeType,
  NodePositionIndex,
  TableEdgeType,
  TableNodeType,
} from "@/types/nodes.types";
import { Parser } from "@dbml/core";
import Database from "@dbml/core/types/model_structure/database";
import Endpoint from "@dbml/core/types/model_structure/endpoint";
import Field from "@dbml/core/types/model_structure/field";
import Ref from "@dbml/core/types/model_structure/ref";
import Table from "@dbml/core/types/model_structure/table";
import TableGroup from "@dbml/core/types/model_structure/tableGroup";

//#region DBML to Nodes and Edges
export type RefDic = { [k: string]: Ref[] };

export const parser = new Parser();

export function getNodeAndEdgesFromDbml(dbml: string) {
  try {
    const database = parser.parse(dbml, "dbmlv2");
    console.log("database", database);

    return parseDatabaseToGraph(database);
  } catch (e) {
    return { error: e };
  }
}
export function parseDatabaseToGraph(database: Database) {
  const tables = database.schemas.flatMap((s) => s.tables);
  const refs = database.schemas.flatMap((s) => s.refs);
  const groups = database.schemas.flatMap((s) => s.tableGroups);

  const tableNodes = tables.map((t) => mapTableToNode(t));

  const tableNodesById = new Map(tableNodes.map((n) => [n.id, n]));
  const groupNodes = groups.map((g) => mapToGroupNode(g, tableNodesById));

  return {
    tableNodes,
    edges: refs.map((r) => mapToEdge(r)),
    groupNodes,
  };
}

export const paddingX = 20;
export const paddingY = 20;

function mapToGroupNode(g: TableGroup, nodes: Map<string, TableNodeType>) {
  const childNodes = g.tables
    .map(getTableOrGroupId)
    .map((id) => nodes.get(id)!);
  const initialWidth =
    childNodes.reduce((acc, n) => acc + (n.initialWidth ?? 0), 0) +
    (childNodes.length - 1) * paddingX;
  const initialHeight =
    childNodes.reduce((acc, n) => acc + (n.initialHeight ?? 0), 0) + 20;

  return <GroupNodeType>{
    id: getTableOrGroupId(g),
    type: "group",
    zIndex: 5,
    data: {
      label: g.name,
      nodeIds: g.tables.map(getTableOrGroupId),
    },
    initialWidth,
    initialHeight,
  };
}

export function mapTableToNode(table: Table) {
  const tableId = getTableOrGroupId(table);

  const guessed = guessSize(table);
  return <TableNodeType>{
    id: tableId,
    type: "table",
    zIndex: 10,
    data: {
      table,
      label: table.name,
      parentId: table.group ? getTableOrGroupId(table.group) : undefined,
    },
    initialWidth: guessed.width,
    initialHeight: guessed.height,
    position: { x: 0, y: 0 },
  };
}

export function mapToEdge(ref: Ref) {
  const sourceEndPoint = ref.endpoints[0];
  const targetEndPoint = ref.endpoints[1];

  const sourceField = sourceEndPoint.fields[0];
  const sourcefieldId = getFieldId(sourceField);
  const targetField = targetEndPoint.fields[0];
  const targetfieldId = getFieldId(targetField);

  const sourceRelationType = getRelationType(sourceEndPoint, targetField);
  const targetRelationType = getRelationType(targetEndPoint, sourceField);
  return <TableEdgeType>{
    id: ref.id.toString(),
    source: getTableOrGroupId(sourceEndPoint.fields[0].table),
    target: getTableOrGroupId(targetEndPoint.fields[0].table),
    type: HorizontalFloatingEdgeTypeName,
    sourceHandle: sourcefieldId,
    targetHandle: targetfieldId,
    markerStart: sourceRelationType,
    markerEnd: targetRelationType,
    data: {
      sourcefieldId,
      targetfieldId,
      ref,
      sourceRelationType,
      targetRelationType,
    },
  };
}
// #endregion

//#region helpers
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
export function getTableOrGroupId(table: Table | TableGroup) {
  return `${table.schema.name}.${table.name}`;
}
export function getFieldId(e: Field) {
  return `${getTableOrGroupId(e.table)}.${e.name}`;
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
// #endregion

// #region size guesser

// Guess size function for nodes
const headerHeight = 40;
const fieldHeight = 30;

const fontSize = 11; // should be 14 but gets better approximations

const inlinePadding = 12;

export function guessSize(table: Table) {
  const longestField = table.fields
    .map((f) => f.name + f.type.type_name)
    .reduce((longest, e) => {
      return e.length > longest.length ? e : longest;
    }, "");
  return {
    width: longestField.length * fontSize + inlinePadding * 2,
    height: table.fields.length * fieldHeight + headerHeight,
  };
}
// #endregion

//#region Position Store

const positionStoreRegex = /\n?\/\*\s*<posistions>(.*)<\/positions>\s*\*\//m;

export function extractPositions(code: string) {
  const positionMatch = positionStoreRegex.exec(code);
  if (!positionMatch) return {};

  return JSON.parse(positionMatch[1]) as NodePositionIndex;
}

export function setPositionsInCode(
  code: string,
  savedPositions: NodePositionIndex
) {
  const positionMatch = positionStoreRegex.exec(code);
  console.log("setPositionsInCode");
  const start = positionMatch?.index ?? code.length;
  const end = start + (positionMatch?.[0].length ?? 0);

  const hasValue = savedPositions && Object.keys(savedPositions).length;
  const positionsString = hasValue
    ? `${start > 0 ? "\n" : ""}/*<posistions>${JSON.stringify(
        savedPositions
      )}</positions>*/`
    : "";

  return code.substring(0, start) + positionsString + code.substring(end);
}

// #endregion
