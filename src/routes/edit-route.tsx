import "@/lib/monaco/monarch-config";

import DBMLEditor from "@/components/editor/editor";
import Viewer from "@/components/viewer/viewer";
import { Link } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function EditRoute() {
  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-primary">
        <Link className="text-mist-200" to={"view" + location.search}>
          {" "}
          Viewer
        </Link>
      </nav>
      <ResizablePanelGroup
        orientation="horizontal"
      >
        <ResizablePanel defaultSize="30%" className="min-w-1/5 max-w-1/2">
          <DBMLEditor />
        </ResizablePanel>

        <ResizableHandle withHandle={true} />
        <ResizablePanel>
          <Viewer />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
