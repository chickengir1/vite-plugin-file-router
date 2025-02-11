import { Plugin } from "vite";
import path from "path";

interface FileRouterPluginOptions {
  pagesDir?: string;
  notFoundPage?: string;
  loadingComponent?: string;
}

const defaultOptions: FileRouterPluginOptions = {
  pagesDir: "src/pages",
};

export default function fileRouterPlugin(
  options?: FileRouterPluginOptions
): Plugin {
  const finalOptions = { ...defaultOptions, ...options };

  return {
    name: "vite-plugin-file-router",
    enforce: "pre",

    resolveId(id: string) {
      if (id === "vite-plugin-file-router") {
        return "\0vite-plugin-file-router";
      }
    },

    load(id: string) {
      if (id === "\0vite-plugin-file-router") {
        return generateRouterConfig(finalOptions);
      }
    },
  };
}

function generateRouterConfig(options: FileRouterPluginOptions): string {
  const pagesDir = options.pagesDir || "src/pages";
  const globPath = `./${pagesDir}/**/*.tsx`;

  const notFoundImport = options.notFoundPage
    ? `import NotFound from '${removeExtension(options.notFoundPage)}';`
    : "";

  const loadingImport = options.loadingComponent
    ? `import Loading from '${removeExtension(options.loadingComponent)}';`
    : "";

  const notFoundElement = options.notFoundPage
    ? "<NotFound />"
    : "<div>404 Not Found</div>";
  const loadingElement = options.loadingComponent
    ? "<Loading />"
    : "<div>Loading...</div>";

  return `
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Loading and NotFound Components Dynamically Imported
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

function removeExtension(filePath: string): string {
  return filePath.replace(/\.tsx$/, "");
}
