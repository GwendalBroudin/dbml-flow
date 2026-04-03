import Field from "@dbml/core/types/model_structure/field";

export function hasFieldDetails(field: Field) {
  return !!(
    (field.note || field._enum || field.dbdefault)
    // || field.check
  );
}
