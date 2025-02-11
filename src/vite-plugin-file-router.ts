import fs from "fs";
import path from "path";
import type { FileRouterPluginOptions, Server } from "./types";

const defaultOptions: FileRouterPluginOptions = {
  pagesDir: "src/pages",
};

export default function fileRouterPlugin(options?: FileRouterPluginOptions) {
  const finalOptions = { ...defaultOptions, ...options };

  return {
    name: "vite-plugin-file-router",

    configureServer(server: Server) {
      const { watcher } = server;
      const pagesDir: string = path.resolve(
        process.cwd(),
        finalOptions.pagesDir
      );

      watcher.add(pagesDir);

      watcher.on("add", (filePath: string) => {
        if (filePath.endsWith(".tsx") && filePath.includes(pagesDir)) {
          updateRouterFile(finalOptions);
        }
      });

      watcher.on("unlink", (filePath: string) => {
        if (filePath.endsWith(".tsx") && filePath.includes(pagesDir)) {
          updateRouterFile(finalOptions);
        }
      });
    },

    buildStart() {
      updateRouterFile(finalOptions);
    },
  };
}

function updateRouterFile(options: FileRouterPluginOptions): void {
  const pagesRelativeDir = path.relative(
    path.resolve(process.cwd(), "src"),
    path.resolve(process.cwd(), options.pagesDir)
  );

  const fileContent = generateRouterConfigFileContent(
    pagesRelativeDir.replace(/\\/g, "/"),
    options
  );

  const routerConfigPath = path.resolve(process.cwd(), "src/RouterConfig.tsx");
  fs.writeFileSync(routerConfigPath, fileContent, { encoding: "utf-8" });
}

function generateRouterConfigFileContent(
  pagesRelativeDir: string,
  options: FileRouterPluginOptions
): string {
  const notFoundImport: string = options.notFoundPage
    ? `import NotFound from '${makeImportPath(options.notFoundPage)}';`
    : "";

  const loadingImport: string = options.loadingComponent
    ? `import Loading from '${makeImportPath(options.loadingComponent)}';`
    : "";

  const notFoundElement: string = options.notFoundPage
    ? "<NotFound />"
    : "<></>";

  const loadingElement: string = options.loadingComponent
    ? "<Loading />"
    : "<></>";

  const globPath: string = `./${pagesRelativeDir}/**/*.tsx`;

  return `
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

${notFoundImport}
${loadingImport}

const pages = import.meta.glob('${globPath}');

function formatPath(filePath: string): string {
  return filePath
    .replace('${globPath.replace("/**/*.tsx", "")}', '')
    .replace(/\\/index\\.tsx$/, '/')
    .replace(/\\.tsx$/, '')
    .replace(/\\[(.+?)\\]/g, ':$1')
    .toLowerCase()
    .replace(/\\/+$/, '')
    || '/';
}

const routes = Object.entries(pages).map(([filePath, resolver]) => {
  const Component = lazy(resolver as () => Promise<{ default: React.ComponentType<unknown> }>);
  return {
    path: formatPath(filePath),
    component: Component
  };
});

export default function RouterConfig() {
  return (
    <BrowserRouter>
      <Suspense fallback={${loadingElement}}>
        <Routes>
          {routes.map(({ path, component: Component }) => (
            <Route 
              key={path} 
              path={path} 
              element={<Component />} 
            />
          ))}
          <Route path="*" element={${notFoundElement}} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
`;
}

function makeImportPath(userPath: string): string {
  const relativePath: string = path.relative(
    path.resolve(process.cwd(), "src"),
    path.resolve(process.cwd(), userPath)
  );

  return `./${relativePath.replace(/\\/g, "/")}`;
}
