import { describe, it, expect } from "vitest";
import pagesRouterPlugin from "../src/vite-plugin-pages-router";
import type { Plugin } from "vite";

describe("vite-plugin-pages-router", () => {
  // Test that the plugin is created correctly with provided options
  it("should create the plugin correctly", () => {
    const plugin: Plugin = pagesRouterPlugin({
      pagesDir: "src/pages",
      notFoundPage: "src/pages/404.tsx",
      loadingComponent: "src/components/Loading.tsx",
    });

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe("vite-plugin-pages-router");
  });

  // Test that the resolveId hook works as expected
  it("should correctly execute the resolveId hook", () => {
    const plugin: Plugin = pagesRouterPlugin();
    const resolveId = plugin.resolveId as (
      id: string
    ) => string | null | undefined;
    const resolvedId = resolveId("vite-plugin-pages-router");

    expect(resolvedId).toBe("\0vite-plugin-pages-router.tsx");
  });

  // Test that the load hook transforms TSX code and returns a valid string
  it("should transform TSX code and return it using the load hook", async () => {
    const plugin: Plugin = pagesRouterPlugin({
      pagesDir: "src/pages",
      notFoundPage: "src/pages/404.tsx",
      loadingComponent: "src/components/Loading.tsx",
    });
    const load = plugin.load as (id: string) => Promise<string> | string;
    const result = await load("\0vite-plugin-pages-router.tsx");

    expect(typeof result).toBe("string");
    expect(result).toContain("import React");
    expect(result).toContain("BrowserRouter");
    expect(result).toContain("Suspense");
    expect(result).toContain("Loading");
  });

  // Test that the formatPath function generates the correct route paths
  it("should generate correct route paths using the formatPath function", async () => {
    const plugin: Plugin = pagesRouterPlugin({
      pagesDir: "src/pages",
      notFoundPage: "src/pages/404.tsx",
      loadingComponent: "src/components/Loading.tsx",
    });
    const load = plugin.load as (id: string) => Promise<string> | string;
    const result = await load("\0vite-plugin-pages-router.tsx");

    // Extract the formatPath function definition using regex
    const formatPathRegex =
      /function formatPath\(filePath: string\): string\s*{([\s\S]*?)}/;
    const match = result.match(formatPathRegex);
    expect(match).toBeDefined();
    if (!match) return; // Avoid TypeScript warning

    let funcStr = match[0];
    // Remove TypeScript type annotations
    funcStr = funcStr.replace(/: string/g, "");

    // Use new Function to convert the string into an actual function
    const formatPath = new Function("return " + funcStr)();
    expect(typeof formatPath).toBe("function");

    // Test if each file path is transformed to the expected route path
    expect(formatPath("/src/pages/index.tsx")).toBe("/");
    expect(formatPath("/src/pages/test.tsx")).toBe("/test");
    expect(formatPath("/src/pages/test/test2.tsx")).toBe("/test/test2");
    expect(formatPath("/src/pages/test/[id].tsx")).toBe("/test/:id");
    expect(formatPath("/src/pages/[id].tsx")).toBe("/:id");
  });
});
