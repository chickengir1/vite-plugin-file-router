import fs from "fs";
import path from "path";

export default function dynamicRoutesPlugin() {
  return {
    name: "vite-plugin-file-router", // 플러그인 이름
    buildStart() {
      const pagesDir = path.resolve(__dirname, "src/pages"); // 페이지 파일이 있는 디렉토리
      const routes = generateRoutes(pagesDir); // 라우트 생성 함수 호출

      // 생성된 라우트 정보로 `routes.ts` 파일 생성
      fs.writeFileSync(
        path.resolve(__dirname, "src/routes.ts"),
        generateRoutesFileContent(routes)
      );
    },
  };
}

// 페이지 파일을 읽어서 라우트 배열을 생성하는 함수
function generateRoutes(pagesDir: string) {
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

// 페이지 파일명을 경로 형식에 맞게 변환하는 함수
function formatPath(fileName: string) {
  return fileName
    .replace(/\/index\.tsx$/, "/")
    .replace(/\.tsx$/, "")
    .replace(/\[(.+?)\]/g, ":$1")
    .toLowerCase();
}

// 동적으로 생성할 `routes.ts` 파일 내용 생성
function generateRoutesFileContent(
  routes: { path: string; component: string }[]
) {
  const routesImport = routes
    .map(
      (route) => `import ${route.component} from './pages${route.path}.tsx';`
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
