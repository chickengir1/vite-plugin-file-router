export interface FileRouterOptions {
  root: string;
  extensions?: string[];
  globOptions?: Record<string, unknown>;
  notFound?: string;
}

export interface RouteNode {
  path: string;
  importPath?: string;
  children?: RouteNode[];
}
