import fs from "fs";
import path from "path";
import type { FileRouterPluginOptions } from "./types";

const defaultOptions: FileRouterPluginOptions = {
  pagesDir: "src/pages",
};

export default function fileRouterPlugin(options?: FileRouterPluginOptions) {
  const finalOptions = { ...defaultOptions, ...options };

  return {
    name: "vite-plugin-file-router",
    buildStart() {
      const pagesDir = path.resolve(process.cwd(), finalOptions.pagesDir);
      const routes = generateRoutes(pagesDir);

      fs.writeFileSync(
        path.resolve(process.cwd(), "src/routes.ts"),
        generateRoutesFileContent(routes, finalOptions)
      );

      fs.writeFileSync(
        path.resolve(process.cwd(), "src/RouterConfig.tsx"),
        generateRouterConfigFileContent(finalOptions)
      );
    },
  };
}

function generateRoutes(
  pagesDir: string
): { path: string; component: string }[] {
  const files = fs.readdirSync(pagesDir);
  return files
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => {
      const filePath = path.resolve(pagesDir, file);
      return {
        path: formatPath(file),
        component: filePath,
      };
    });
}

function formatPath(fileName: string): string {
  return fileName
    .replace(/\/index\.tsx$/, "/")
    .replace(/\.tsx$/, "")
    .replace(/\[(.+?)\]/g, ":$1")
    .toLowerCase();
}

function generateRoutesFileContent(
  routes: { path: string; component: string }[],
  options: FileRouterPluginOptions
): string {
  const routesImport = routes
    .map(
      (route) =>
        `const ${route.component} = lazy(() => import('./pages${route.path}.tsx'));`
    )
    .join("\n");

  const routesDefinition = routes
    .map(
      (route) => `  { path: '${route.path}', component: ${route.component} }`
    )
    .join(",\n");

  return `
import { lazy } from 'react';

${routesImport}

const routes = [
${routesDefinition}
];

export default routes;
  `;
}

function generateRouterConfigFileContent(
  options: FileRouterPluginOptions
): string {
  const notFoundImport = options.notFoundPage
    ? `import NotFound from '${options.notFoundPage}';`
    : "";
  const loadingImport = options.loadingComponent
    ? `import Loading from '${options.loadingComponent}';`
    : "";

  const notFoundElement = options.notFoundPage ? "<NotFound />" : "<></>";
  const loadingElement = options.loadingComponent ? "<Loading />" : "<></>";

  return `
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './routes';
${notFoundImport}
${loadingImport}

const RouterConfig = () => {
  return (
    <Suspense fallback={${loadingElement}}>
      <Routes>
        {routes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="*" element={${notFoundElement}} />
      </Routes>
    </Suspense>
  );
};

export default RouterConfig;
`;
}
