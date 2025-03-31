import { Link, createFileRoute } from "@tanstack/react-router";
import React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import DBMLEditor from "@/components/editor/editor";
import Viewer from "@/components/viewer/viewer";
import "@/lib/monaco/monarch-config";
import { retainSearchParams } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  search: {
    middlewares: [retainSearchParams(true)],
  },
});

function RouteComponent() {
  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-primary">
        <Link to="/view">viewer</Link>
      </nav>
      <PanelGroup direction="horizontal">
        <Panel defaultSize={30} minSize={20}>
          <DBMLEditor />
        </Panel>
        <PanelResizeHandle />

        <Panel minSize={40}>
          <Viewer />
        </Panel>
      </PanelGroup>
    </div>
  );
}
