import type { Table } from "@dbml/core";

export const TableHeaderTooltipView = ({ table }: { table: Table }) => {
  const note = table.note;

  return (
    <div className="flex flex-col gap-1 px-2 py-1 text-gray-100 text-xs">
      <div className=" text-xs pb-0.5 whitespace-nowrap border-b-2 border-b-muted-foreground">
        <span className="">{table.name} </span>
      </div>
      {note && <div className="text-muted-foreground">{note}</div>}
    </div>
  );
};
