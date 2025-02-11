const fs = require("fs");
const path = require("path");

function main() {
  const projectRoot = process.cwd();
  const srcDir = path.join(projectRoot, "src");
  const routerFile = path.join(srcDir, "Router.tsx");

  if (fs.existsSync(routerFile)) {
    console.log(
      "[vite-plugin-file-router] src/Router.tsx already exists. Skipping generation."
    );
    return;
  }

  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  const template = `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import fileRoutes from 'virtual:file-routes';

function renderRoutes(routeObjects: {
  path: string;
  element: React.ReactNode;
  children?: {
    path: string;
    element: React.ReactNode;
    children?: unknown;
  }[];
}[]): JSX.Element[] {
  return routeObjects.map((route, idx) => (
    <Route key={\`\${route.path}-\${idx}\`} path={route.path} element={route.element}>
      {route.children ? renderRoutes(route.children) : null}
    </Route>
  ));
}

const GeneratedRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {renderRoutes(fileRoutes)}
      </Routes>
    </BrowserRouter>
  );
};

export default GeneratedRouter;
`;

  fs.writeFileSync(routerFile, template, "utf-8");
  console.log("[my-vite-plugin-file-router] Created src/Router.tsx");
}

main();
