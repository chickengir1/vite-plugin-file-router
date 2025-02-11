import { Plugin } from "vite";
import path from "path";
import { FileRouterPluginOptions } from "./types";

const defaultOptions: FileRouterPluginOptions = {
  pagesDir: "src/pages",
};

export default function fileRouterPlugin(
  options?: FileRouterPluginOptions
): Plugin {
  const finalOptions: FileRouterPluginOptions = {
    ...defaultOptions,
    ...options,
  };

  return {
    name: "vite-plugin-pages-router",
    enforce: "pre",

    resolveId(id: string) {
      if (id === "vite-plugin-pages-router") {
        return "\0vite-plugin-pages-router";
      }
    },

    load(id: string) {
      if (id === "\0vite-plugin-pages-router") {
        return generateRouterConfig(finalOptions);
      }
    },
  };
}

function generateRouterConfig(options: FileRouterPluginOptions): string {
  const pagesDir = options.pagesDir || "src/pages";
  const pagesDirPath = `/${pagesDir}`;
  const globPath = `${pagesDirPath}/**/*.tsx`;

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
// 동적으로 임포트되는 Loading 및 NotFound 컴포넌트
${notFoundImport}
${loadingImport}

const pages = import.meta.glob('${globPath}');

function formatPath(filePath: string): string {
  const basePath = '${pagesDirPath}';
  return filePath
    .replace(new RegExp('^' + basePath), '')
    .replace(/\\/index\\.tsx$/, '/')
    .replace(/\\.tsx$/, '')
    .replace(/\\[(.+?)\\]/g, ':$1')
    .toLowerCase()
    .replace(/\\/+$/, '') || '/';
}

const routes = Object.entries(pages).map(([filePath, resolver]) => {
  const Component = lazy(resolver as () => Promise<{ default: React.ComponentType<unknown> }>);
  return {
    path: formatPath(filePath),
    component: Component
  };
});

const RouterConfig = () => {
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
};

export default RouterConfig;
`;
}

function removeExtension(filePath: string): string {
  return filePath.replace(/\.tsx$/, "");
}
