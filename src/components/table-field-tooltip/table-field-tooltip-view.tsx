import Field from "@dbml/core/types/model_structure/field";

export const TableFieldTooltipView = ({ field }: { field: Field }) => {
  const note = field.note;
  const enumData = field._enum;

  return (
    <div className="flex flex-col gap-1 px-2 py-1 text-gray-100 text-xs">
      <div className=" text-xs pb-0.5 whitespace-nowrap border-b-2 border-b-muted-foreground">
        <span className="">{field.name} </span>
        <span className="text-blue-500">{field.type.type_name}</span>
      </div>
      {note && <div className="text-muted-foreground">{note}</div>}
      {enumData && (
        <div>
          <p>
            <span className="text-amber-800">ENUM </span>
            {enumData.name}:
          </p>
          <div className="ml-2 ">
            {enumData.values.map((v) => (
              <p key={v.name}>
                {v.name}
                {v.note && (
                  <span className="text-muted-foreground"> ({v.note})</span>
                )}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
