import Viewer from "@/components/viewer/viewer";
import { createFileRoute, retainSearchParams } from "@tanstack/react-router";

export const Route = createFileRoute("/view")({
  component: RouteComponent,
  search: {
    middlewares: [retainSearchParams(true)],
  },
});

function RouteComponent() {
  return <Viewer />;
}
