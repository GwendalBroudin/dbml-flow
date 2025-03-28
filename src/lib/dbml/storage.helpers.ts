import { NodePositionIndex } from "@/types/nodes.types";
import Database from "@dbml/core/types/model_structure/database";
import { resourceUsage } from "process";

export const getPositionStorageKey = (database: Database): string => {
  let uniqueIdentifier;

  if (database.name) return `dbml-${database.name}`;

  return database.schemas
    .flatMap((schema) =>
      schema.tables.map(
        (table) => `${table.name}:${table.fields.map((f) => f.name).join(",")}`
      )
    )
    .sort()
    .join("|");
};

const codeParam = "code";

export function getCodeFromUrl() {
  return getUrlB64Param(codeParam);
}

export function setCodeInUrl(code: string) {
  setUrlB64Param(codeParam, code);
}

const positionParam = "positions";

export function getPositionsFromUrl() {
  const json = getUrlB64Param(positionParam);
  if (!json) return {} as NodePositionIndex;
  return JSON.parse(json) as NodePositionIndex;
}

export function setPositionsInUrl(positions: NodePositionIndex) {
  const json = JSON.stringify(positions);
  const base64Code = btoa(json);
  setUrlB64Param(positionParam, base64Code);
}

export function getUrlB64Param(key: string) {
  const url = new URL(window.location.href);
  const value = url.searchParams.get(key) ?? "";
  return atob(value);
}

export function setUrlB64Param(key: string, value: string) {
  const url = new URL(window.location.href);
  const base64Value = btoa(value);
  url.searchParams.set(key, base64Value);
  window.history.pushState(null, "", url.toString());
}
