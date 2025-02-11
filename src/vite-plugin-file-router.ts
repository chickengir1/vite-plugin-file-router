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
      const watcher = server.watcher;
      const pagesDir = path.resolve(process.cwd(), finalOptions.pagesDir);

      watcher.add(pagesDir);
      watcher.on("add", (file: string) => {
        if (file.endsWith(".tsx") && file.includes(pagesDir)) {
          updateRoutes(pagesDir, finalOptions);
        }
      });
      watcher.on("unlink", (file: string) => {
        if (file.endsWith(".tsx") && file.includes(pagesDir)) {
          updateRoutes(pagesDir, finalOptions);
        }
      });
    },
    buildStart() {
      const pagesDir = path.resolve(process.cwd(), finalOptions.pagesDir);
      if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, { recursive: true });
      }
      updateRoutes(pagesDir, finalOptions);
    },
  };
}

function generateRoutes(
  pagesDir: string
): { path: string; component: string }[] {
  const getAllFiles = (dir: string): string[] => {
    const files = fs.readdirSync(dir);
    return files.reduce<string[]>((acc, file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        return [...acc, ...getAllFiles(filePath)];
      }
      return [...acc, filePath];
    }, []);
  };

  const files = getAllFiles(pagesDir);
  return files
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => {
      const relativePath = path.relative(pagesDir, file);
      return {
        path: formatPath(relativePath),
        component: file,
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
  const getComponentName = (filePath: string) => {
    return `Page${filePath
      .replace(/[\/\\]/g, "_")
      .replace(/[\[\]]/g, "")
      .replace(/\./g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "")
      .replace(/^_+|_+$/g, "")}`;
  };

  const routesImport = routes
    .map(
      (route) =>
        `const ${getComponentName(route.path)} = lazy(() => import('./pages${
          route.path
        }.tsx'));`
    )
    .join("\n");

  const routesDefinition = routes
    .map(
      (route) =>
        `  { path: '${route.path}', component: ${getComponentName(
          route.path
        )} }`
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
import { Suspense } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import routes from './routes';
${notFoundImport}
${loadingImport}

const RouterConfig = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={${loadingElement}}>
        <Routes>
          {routes.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={${notFoundElement}} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default RouterConfig;
`;
}

function updateRoutes(pagesDir: string, options: FileRouterPluginOptions) {
  const routes = generateRoutes(pagesDir);
  fs.writeFileSync(
    path.resolve(process.cwd(), "src/routes.ts"),
    generateRoutesFileContent(routes, options)
  );
  fs.writeFileSync(
    path.resolve(process.cwd(), "src/RouterConfig.tsx"),
    generateRouterConfigFileContent(options)
  );
}
