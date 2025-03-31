import Viewer from "@/components/viewer/viewer";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/view")({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return <Viewer />;
}
