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
  const urlParams = new URLSearchParams(window.location.search);
  const base64Code = urlParams.get(codeParam) || "";
  return atob(base64Code);
}

export function setCodeInUrl(code: string) {
  const urlParams = new URLSearchParams(window.location.search);

  const base64Code = btoa(code);
  urlParams.set(codeParam, base64Code);
  window.location.search = urlParams.toString();
}

const positionParam = "positions";

export function getPositionsFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const base64Code = urlParams.get(positionParam);
  if (!base64Code) return {} as NodePositionIndex;

  const json = atob(base64Code);
  return JSON.parse(json) as NodePositionIndex;
}

export function setPositionsInUrl(positions: NodePositionIndex) {
  const urlParams = new URLSearchParams(window.location.search);
  const json = JSON.stringify(positions);
  const base64Code = btoa(json);
  urlParams.set(positionParam, base64Code);
  window.location.search = urlParams.toString();
}
