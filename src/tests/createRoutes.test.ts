import { describe, it, expect } from "vitest";
import { createRoutes } from "../createRoutes";
import type { FileRouterOptions, RouteNode } from "../types";

describe("createRoutes 테스트", () => {
  it("기본 구조를 생성한다", () => {
    const files: string[] = [
      "/absolute/path/src/pages/index.tsx",
      "/absolute/path/src/pages/about.tsx",
      "/absolute/path/src/pages/blog/index.tsx",
      "/absolute/path/src/pages/blog/[slug].tsx",
    ];
    const options: FileRouterOptions = {
      root: "/absolute/path/src/pages",
      extensions: ["tsx"],
    };

    const result: RouteNode[] = createRoutes(files, options);

    const expected: RouteNode[] = [
      {
        path: "/",
        importPath: "absolute/path/src/pages/index.tsx",
      },
      {
        path: "/about",
        importPath: "absolute/path/src/pages/about.tsx",
      },
      {
        path: "/blog",
        importPath: "absolute/path/src/pages/blog/index.tsx",
        children: [
          {
            path: "/:slug",
            importPath: "absolute/path/src/pages/blog/[slug].tsx",
          },
        ],
      },
    ];

    expect(result).toEqual(expected);
  });

  it("깊은 중첩 디렉토리를 처리한다", () => {
    const files: string[] = [
      "/absolute/path/src/pages/docs/[docId]/project/[projectId].tsx",
    ];
    const options: FileRouterOptions = {
      root: "/absolute/path/src/pages",
      extensions: ["tsx"],
    };

    const result: RouteNode[] = createRoutes(files, options);

    const expected: RouteNode[] = [
      {
        path: "/docs",
        children: [
          {
            path: "/:docId",
            children: [
              {
                path: "/project",
                children: [
                  {
                    path: "/:projectId",
                    importPath:
                      "absolute/path/src/pages/docs/[docId]/project/[projectId].tsx",
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    expect(result).toEqual(expected);
  });
});
