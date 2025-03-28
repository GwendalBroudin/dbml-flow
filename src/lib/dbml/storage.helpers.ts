import Database from "@dbml/core/types/model_structure/database";
import { resourceUsage } from "process";

export const getPositionStorageKey = (database: Database): string => {
    let uniqueIdentifier;

    if(database.name) return `dbml-${database.name}`;

    return database.schemas
    .flatMap((schema) =>
      schema.tables.map(
        (table) => `${table.name}:${table.fields.map((f) => f.name).join(",")}`
      )
    )
    .sort()
    .join("|");

};