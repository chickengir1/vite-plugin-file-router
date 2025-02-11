declare module "virtual:file-routes" {
  import type { ReactNode } from "react";

  export interface VirtualRoute {
    path: string;
    element: ReactNode;
    children?: VirtualRoute[];
  }

  const routes: VirtualRoute[];
  export default routes;
}
