import {
    FIELD_BORDER,
    FIELD_HEIGHT_TOTAL,
    FIELD_SPACING,
    HEADER_HEIGHT,
    ICON_SIZE,
} from "@/components/table-constants";
import type { Table } from "@dbml/core";

// Guess size function for nodes

let fontWidth = 7; //  getTextWidth() return wrong value on start up, to be investigated

const inlinePadding = 8;

export const tableWidth = [150, 200, 250, 300].map((w) => ({
  width: w,
  maxCharacters: Math.floor(
    (w - inlinePadding * 2 - ICON_SIZE * 2) / fontWidth,
  ),
}));

export function findClosestSize(table: Table) {
  const longest = longestField(table);
  const longestLength = longest.name + longest.type;
  const { width } =
    tableWidth.find((s) => longestLength <= s.maxCharacters) ||
    tableWidth[tableWidth.length - 1];
  return {
    width,
    height: getHeight(table),
  };
}

export function guessSize(table: Table) {
  const longest = longestField(table);
  return {
    width:
      (longest.name + longest.type) * fontWidth +
      inlinePadding * 2 +
      ICON_SIZE * 2 +
      FIELD_SPACING +
      FIELD_BORDER * 2,
    height: getHeight(table),
  };
}



function longestField(table: Table) {
  return table.fields.reduce(
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
    },
  );
}

function getHeight(table: Table) {
  return table.fields.length * FIELD_HEIGHT_TOTAL + HEADER_HEIGHT;
}
