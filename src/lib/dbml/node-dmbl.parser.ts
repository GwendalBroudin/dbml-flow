import {
  FIELD_BORDER,
  FIELD_HEIGHT_TOTAL,
  FIELD_SPACING,
  GROUP_Z_INDEX,
  HEADER_HEIGHT,
  PRIMARY_KEY_WIDTH,
  TABLE_Z_INDEX,
} from "@/components/table-constants";
import {
  GroupNodeType,
  NodePositionIndex,
  NodeTypes,
  TableNodeType,
} from "@/types/nodes.types";
import { Parser } from "@dbml/core";
import Database from "@dbml/core/types/model_structure/database";
import Field from "@dbml/core/types/model_structure/field";
import Table from "@dbml/core/types/model_structure/table";
import TableGroup from "@dbml/core/types/model_structure/tableGroup";

//#region DBML to Nodes

export const parser = new Parser();

export function parseDatabaseToGraph(database: Database) {
  const tables = database.schemas.flatMap((s) => s.tables);
  const groups = database.schemas.flatMap((s) => s.tableGroups);

  const tableNodes = tables.map((t) => mapTableToNode(t));

  const tableNodesById = new Map(tableNodes.map((n) => [n.id, n]));
  const groupNodes = groups.map((g) => mapToGroupNode(g, tableNodesById));

  return {
    tableNodes,
    groupNodes,
  };
}

export const paddingX = 20;
export const paddingY = 20;

function mapToGroupNode(g: TableGroup, nodes: Map<string, TableNodeType>) {
  return <GroupNodeType>{
    id: getGroupId(g),
    type: NodeTypes.TableGroup,
    zIndex: GROUP_Z_INDEX,
    data: {
      label: g.name,
      nodeIds: g.tables.map(getTableId),
      color: g.color,
      folded: false,
    },
  };
}

export function mapTableToNode(table: Table) {
  const tableId = getTableId(table);

  const guessed = guessSize(table);
  return <TableNodeType>{
    id: tableId,
    type: NodeTypes.Table,
    zIndex: TABLE_Z_INDEX,
    data: {
      table,
      label: table.name,
      groupId: table.group ? getGroupId(table.group) : undefined,
      color: table.headerColor,
      folded: false,
    },
    initialWidth: guessed.width,
    initialHeight: guessed.height,
    position: { x: 0, y: 0 },
  };
}

// #endregion

//#region helpers

export function getTableId(table: Table) {
  return table ? `t-${getBaseId(table)}` : undefined;
}

export function getGroupId(group: TableGroup) {
  return group ? `g-${getBaseId(group)}` : undefined;
}

export function getFieldId(e: Field) {
  return e ? `f-${getBaseId(e.table)}.${e.name}` : undefined;
}

function getBaseId(table: Table | TableGroup) {
  return `${table.schema.name}.${table.name}`;
}

// #endregion

// #region size guesser

// Guess size function for nodes

let fontWidth = 7; //  getTextWidth() return wrong value on start up, to be investigated

const inlinePadding = 8;

export function guessSize(table: Table) {
  const longestField = table.fields.reduce(
    (acc, f) => {
      const typeLength = f.type.type_name.length;
      const fieldLength = f.name.length;
      return {
        type: typeLength > acc.type ? typeLength : acc.type,
        name: fieldLength > acc.name ? fieldLength : acc.name,
      };
    },
    {
      type: 0,
      name: 0,
    }
  );
  return {
    width:
      (longestField.name + longestField.type) * fontWidth +
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
