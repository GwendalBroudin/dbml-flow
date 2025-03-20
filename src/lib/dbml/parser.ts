import { TableEdgeType, TableNodeType } from "@/types/nodes.types";
import { Parser } from "@dbml/core";
import Field from "@dbml/core/types/model_structure/field";
import Ref from "@dbml/core/types/model_structure/ref";
import Table from "@dbml/core/types/model_structure/table";
import { Edge, type Node } from "@xyflow/react";

export type RefDic = { [k: string]: Ref[] };

const parser = new Parser();

export async function getNodesAndEdges() {
  const dbmlReq = await fetch("test-data/test.private.dbml");
  const dbml = await dbmlReq.text();
  const database = parser.parse(dbml, "dbmlv2");

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

  const res = {
    nodes: tables.map((t, i) => mapToNode(t)),
    edges: refs.map((r) => mapToEdge(r)),
  };

  console.log(res);
  return res;
}

export function getTableId(table: Table) {
  return `${table.schema.name}.${table.name}`;
}
export function getFieldId(e: Field) {
  return `${getTableId(e.table)}.${e.name}`;
}

export function mapToNode(table: Table) {
  const tableId = getTableId(table);

  return <TableNodeType>{
    id: tableId,
    type: "table",
    data: {
      table,
      label: table.name,
    },
    position: { x: 0, y: 0 },
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
    sourceHandle : sourcefieldId,
    targetHandle : targetfieldId,
    data: {
      sourcefieldId,
      targetfieldId,
      ref
    },
  };
}
