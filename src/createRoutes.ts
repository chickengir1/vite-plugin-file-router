import path from "path";
import { normalizePath } from "./utils/normalizePath";
import type { FileRouterOptions, RouteNode } from "./types";

/**
 * Recursively remove empty children arrays from route nodes.
 */
function pruneEmptyChildren(nodes: RouteNode[]): RouteNode[] {
  return nodes.map((node) => {
    const newNode: RouteNode = { path: node.path };
    if (node.importPath) newNode.importPath = node.importPath;
    if (node.children && node.children.length > 0) {
      newNode.children = pruneEmptyChildren(node.children);
    }
    return newNode;
  });
}

/**
 * Creates a nested route tree from a list of file paths.
 */
export function createRoutes(
  files: string[],
  options: FileRouterOptions
): RouteNode[] {
  const { root, extensions = ["tsx", "jsx"] } = options;
  const extRegex = new RegExp(`\\.(${extensions.join("|")})$`);
  const topLevelRoutes: RouteNode[] = [];

  /**
   * Recursively insert a route node.
   *
   * @param baseArray - The current array of route nodes.
   * @param segments - The remaining path segments.
   * @param importPath - The component import path.
   * @param parent - The parent route node.
   */
  function insertRouteNode(
    baseArray: RouteNode[],
    segments: string[],
    importPath?: string,
    parent?: RouteNode
  ) {
    if (segments.length === 0) return;
    const [current, ...rest] = segments;
    const isIndex = current === "index";

    // If the last segment is "index", assign importPath directly to the parent.
    if (isIndex && rest.length === 0) {
      if (parent) {
        parent.importPath = importPath;
        return;
      } else {
        baseArray.push({ path: "/", importPath, children: [] });
        return;
      }
    }

    const currentPath = isIndex ? "/" : `/${current}`;
    let node = baseArray.find((item) => item.path === currentPath);
    if (!node) {
      node = { path: currentPath, children: [] };
      baseArray.push(node);
    }

    if (rest.length === 0 && importPath) {
      node.importPath = importPath;
    } else if (rest.length > 0) {
      insertRouteNode(node.children!, rest, importPath, node);
    }
  }

  for (const file of files) {
    // Get the file path relative to the root.
    const relative = path.relative(root, file);
    const normalized = normalizePath(relative);
    const noExt = normalized.replace(extRegex, "");
    // Transform [param] -> :param
    const segments = noExt
      .split("/")
      .map((seg) => seg.replace(/\[([^\]]+)\]/g, ":$1"));
    const finalImportPath = normalizePath(file);
    insertRouteNode(topLevelRoutes, segments, finalImportPath);
  }

  return pruneEmptyChildren(topLevelRoutes);
}
