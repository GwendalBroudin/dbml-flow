import {
  GuessedSize,
  NodePositionIndex,
  TableEdgeType,
  TableNodeType,
} from "@/types/nodes.types";
import { Parser } from "@dbml/core";
import Database from "@dbml/core/types/model_structure/database";
import Field from "@dbml/core/types/model_structure/field";
import Ref from "@dbml/core/types/model_structure/ref";
import Table from "@dbml/core/types/model_structure/table";
import { Edge, type Node } from "@xyflow/react";

export type RefDic = { [k: string]: Ref[] };

export const parser = new Parser();

export async function getTestDbml() {
  const dbmlReq = await fetch("test-data/test.private.dbml");
  return await dbmlReq.text();
}

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
  const refsByTable = database.schemas
    .flatMap((e) => e.refs)
    .reduce((acc, ref) => {
      for (const endpoint of ref.endpoints) {
        const tableId = getTableId(endpoint.fields[0].table);
        acc[tableId] = [...(acc[tableId] ?? []), ref];
      }
      return acc;
    }, {} as RefDic);

  const tables = database.schemas.flatMap((s) => s.tables);

  const refs = database.schemas.flatMap((s) => s.refs);

  return {
    nodes: tables.map((t, i) => mapToNode(t)),
    edges: refs.map((r) => mapToEdge(r)),
  };
}

export function getTableId(table: Table) {
  return `${table.schema.name}.${table.name}`;
}
export function getFieldId(e: Field) {
  return `${getTableId(e.table)}.${e.name}`;
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

  const sourcefieldId = getFieldId(sourceEndPoint.fields[0]);
  const targetfieldId = getFieldId(targetEndPoint.fields[0]);
  return <TableEdgeType>{
    id: ref.id.toString(),
    source: getTableId(sourceEndPoint.fields[0].table),
    target: getTableId(targetEndPoint.fields[0].table),
    type: "smoothstep",
    sourceHandle: sourcefieldId,
    targetHandle: targetfieldId,
    data: {
      sourcefieldId,
      targetfieldId,
      ref,
    },
  };
}

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
