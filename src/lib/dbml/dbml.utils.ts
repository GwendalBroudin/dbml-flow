import Field from "@dbml/core/types/model_structure/field";

export function hasFieldDetails(field: Field) {
  return !!(
    (field.note || field._enum || field.dbdefault)
    // || field.check
  );
}

export function isUniqueFieldOrPK(field: Field) {
  const table = field.table;
  const indexes = table.indexes.filter((i) =>
    i.columns.some((c) => c.value === field.name),
  );
  const pk = field.pk || indexes.some((i) => i.pk);
  const unique = pk || field.unique || indexes.some((i) => i.unique);
  return { unique, pk };
}
