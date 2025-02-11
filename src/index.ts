import type { Plugin } from "vite";
import fg from "fast-glob";
import React from "react";
import { createRoutes } from "./createRoutes";
import type { FileRouterOptions, RouteNode } from "./types";

function serializeLazy(routeNodes: RouteNode[], counter = { idx: 0 }): string {
  let code = "";
  for (const route of routeNodes) {
    const varName = `FileRoute${counter.idx}`;
    counter.idx++;
    if (route.importPath) {
      code += `const ${varName} = React.lazy(() => import('${route.importPath}'));\n`;
    } else {
      code += `const ${varName} = React.Fragment;\n`;
    }
    if (route.children && route.children.length > 0) {
      code += serializeLazy(route.children, counter);
    }
  }
  return code;
}

function serializeRouteObjects(
  routeNodes: RouteNode[],
  counter = { idx: 0 }
): string {
  const items: string[] = [];
  for (const route of routeNodes) {
    const compName = `FileRoute${counter.idx}`;
    counter.idx++;

    let childrenStr = "";
    if (route.children && route.children.length > 0) {
      childrenStr = serializeRouteObjects(route.children, counter);
    }

    const normPath = route.path === "/" ? "/" : route.path.replace(/^\//, "");
    const item = `{
      path: '${normPath}',
      element: (
        <React.Suspense fallback={<></>}>
          <${compName} />
        </React.Suspense>
      )${childrenStr ? `, children: [${childrenStr}]` : ""}
    }`;
    items.push(item);
  }
  return items.join(",\n");
}

export function VitePluginFileRouter(options: FileRouterOptions): Plugin {
  const {
    root,
    extensions = ["tsx", "jsx"],
    globOptions = {},
    notFound,
  } = options;

  return {
    name: "vite-plugin-file-router",

    resolveId(source) {
      if (source === "virtual:file-routes") {
        return source;
      }
      return null;
    },

    async load(id) {
      if (id !== "virtual:file-routes") return null;

      const pattern = `${root}/**/*.+(${extensions.join("|")})`;
      const files = await fg(pattern, { ...globOptions, absolute: true });

      let routesTree: RouteNode[] = createRoutes(files, {
        root,
        extensions,
        globOptions,
      });

      if (notFound) {
        routesTree.push({
          path: "*",
          importPath: notFound,
        });
      }

      const lazyImports = serializeLazy(routesTree);

      const routeObjects = serializeRouteObjects(routesTree);

      return `
        import React from 'react';
        ${lazyImports}
        export default [
          ${routeObjects}
        ];
      `;
    },
  };
}
