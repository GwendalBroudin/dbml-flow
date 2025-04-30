import { HorizontalFloatingEdgeTypeName } from "@/components/edges/horizontal-floating-edge";
import {
  ERRelationTypes,
  GuessedSize,
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

//#region DBML to Nodes and Edges
export type RefDic = { [k: string]: Ref[] };

export const parser = new Parser();

export function getNodeAndEdgesFromDbml(dbml: string) {
  try {
    const database = parser.parse(dbml, "dbmlv2");
    console.log("database", database);

    return parseDatabaseToNodesAndEdges(database);
  } catch (e) {
    return { error: e };
  }
}
export function parseDatabaseToNodesAndEdges(database: Database) {
  const tables = database.schemas.flatMap((s) => s.tables);

  const refs = database.schemas.flatMap((s) => s.refs);

  return {
    nodes: tables.map((t, i) => mapToNode(t)),
    edges: refs.map((r) => mapToEdge(r)),
  };
}

export function mapToNode(table: Table) {
  const tableId = getTableId(table);

  return <TableNodeType & GuessedSize>{
    id: tableId,
    type: "table",
    data: {
      table,
      label: table.name,
    },
    position: { x: 0, y: 0 },
    guessed: guessSize(table),
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
    type: HorizontalFloatingEdgeTypeName,
    sourceHandle: sourcefieldId,
    targetHandle: targetfieldId,
    markerStart: sourceRelationType ,
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
  targetfield : Field
): ERRelationTypes {
  if(endPoint.relation === "1" && isNotNull(targetfield)) {
    return "one" ;
  } else if (endPoint.relation === "1") {
    return "oneOptionnal";
  } else if (endPoint.relation === "*") {
    return "many";
  }

  throw new Error("Unknown relation type");
}
export function getTableId(table: Table) {
  return `${table.schema.name}.${table.name}`;
}
export function getFieldId(e: Field) {
  return `${getTableId(e.table)}.${e.name}`;
}

export function isNotNull(
  field: Field
): boolean {
  const table = field.table;
  return (
    field.not_null ||
    field.pk ||
    table.indexes?.find((i) =>
      i.columns.some((c) => c.value === field.name)
    )?.pk as unknown as boolean
  );
}
// #endregion

// #region size guesser

// Guess size function for nodes
const headerHeight = 39;
const fieldHeight = 28;

const fontSize = 14;

export function guessSize(table: Table) {
  const longestField = table.fields
    .map((f) => f.name + f.type.type_name)
    .reduce((longest, e) => {
      return e.length > longest.length ? e : longest;
    }, "");
  return {
    width: longestField.length * fontSize,
    height: table.fields.length * fieldHeight + headerHeight + 20,
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

let isRunning = false;
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