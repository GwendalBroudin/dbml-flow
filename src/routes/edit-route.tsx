import "@/lib/monaco/monarch-config";

import { Group, Panel, Separator } from "react-resizable-panels";
import DBMLEditor from "@/components/editor/editor";
import Viewer from "@/components/viewer/viewer";
import { Link } from "react-router-dom";

export function EditRoute() {
  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-primary">
        <Link to={"view" + location.search}> Viewer</Link>
      </nav>
      <Group orientation="horizontal">
        <Panel defaultSize={30} minSize={20}>
          <DBMLEditor />
        </Panel>
        <Separator />

        <Panel minSize={40}>
          <Viewer />
        </Panel>
      </Group>
    </div>
  );
}
