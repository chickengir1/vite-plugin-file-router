import fs from "fs";
import path from "path";

export default function fileRouterPlugin() {
  return {
    name: "vite-plugin-file-router", // 플러그인 이름
    buildStart() {
      const pagesDir = path.resolve(__dirname, "src/pages"); // 페이지 파일 위치
      const routes = generateRoutes(pagesDir); // 라우트 목록 생성

      // 동적으로 생성된 라우트 파일을 생성
      fs.writeFileSync(
        path.resolve(__dirname, "src/routes.ts"),
        generateRoutesFileContent(routes)
      );

      // `RouterConfig.tsx`도 자동 생성하여 제공
      fs.writeFileSync(
        path.resolve(__dirname, "src/RouterConfig.tsx"),
        generateRouterConfigFileContent()
      );
    },
  };
}

// 페이지 파일을 읽어서 라우트를 생성하는 함수
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

// 파일명을 경로 형식으로 변환하는 함수
function formatPath(fileName: string): string {
  return fileName
    .replace(/\/index\.tsx$/, "/") // index.tsx는 "/"로 변환
    .replace(/\.tsx$/, "") // 확장자 제거
    .replace(/\[(.+?)\]/g, ":$1") // 대괄호를 URL 파라미터로 변환
    .toLowerCase();
}

// 자동 생성될 `routes.ts` 파일 내용
function generateRoutesFileContent(
  routes: { path: string; component: string }[]
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

// 자동 생성될 `RouterConfig.tsx` 파일 내용
function generateRouterConfigFileContent(): string {
  return `
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './routes';

const RouterConfig = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {routes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </Suspense>
  );
};

export default RouterConfig;
  `;
}
