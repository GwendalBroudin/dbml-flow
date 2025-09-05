import { TableEdgeTypeName } from "@/components/edges/table-edge";
import {
  FIELD_BORDER,
  FIELD_HEIGHT_TOTAL,
  FIELD_SPACING,
  HEADER_HEIGHT,
  PRIMARY_KEY_WIDTH,
} from "@/components/table-constants";
import {
  ERRelationTypes,
  GroupNodeType,
  NodePositionIndex,
  NodeTypes,
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
    .map(getTableId)
    .map((id) => nodes.get(id)!);
  // const initialWidth =
  //   childNodes.reduce((acc, n) => acc + (n.initialWidth ?? 0), 0) +
  //   (childNodes.length - 1) * paddingX;
  // const initialHeight =
  //   childNodes.reduce((acc, n) => acc + (n.initialHeight ?? 0), 0) + 20;

  return <GroupNodeType>{
    id: getGroupId(g),
    type: NodeTypes.TableGroup,
    zIndex: -1001,
    data: {
      label: g.name,
      nodeIds: g.tables.map(getTableId),
      color: g.color,
      folded: false,
    },
    // initialWidth,
    // initialHeight,
  };
}

export function mapTableToNode(table: Table) {
  const tableId = getTableId(table);

  const guessed = guessSize(table);
  return <TableNodeType>{
    id: tableId,
    type: NodeTypes.Table,
    zIndex: 10,
    data: {
      table,
      label: table.name,
      groupId: table.group ? getGroupId(table.group) : undefined,
      color: table.headerColor,
      folded: true,
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
    source: getTableId(sourceEndPoint.fields[0].table),
    target: getTableId(targetEndPoint.fields[0].table),
    type: TableEdgeTypeName,
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

export function getTableId(table: Table) {
  return `t-${getBaseId(table)}`;
}

export function getGroupId(group: TableGroup) {
  return `g-${getBaseId(group)}`;
}

export function getFieldId(e: Field) {
  return `f-${getBaseId(e.table)}.${e.name}`;
}

function getBaseId(table: Table | TableGroup) {
  return `${table.schema.name}.${table.name}`;
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

let fontWidth = 7; //  getTextWidth() return wrong value on start up, to be investigated

const inlinePadding = 8;

export function guessSize(table: Table) {
  const longestField = table.fields
    .map((f) => f.name + f.type.type_name)
    .reduce((longest, e) => {
      return e.length > longest.length ? e : longest;
    }, "");
  return {
    width:
      longestField.length * fontWidth +
      inlinePadding * 2 +
      PRIMARY_KEY_WIDTH +
      FIELD_SPACING +
      FIELD_BORDER * 2,
    height: table.fields.length * FIELD_HEIGHT_TOTAL + HEADER_HEIGHT,
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
