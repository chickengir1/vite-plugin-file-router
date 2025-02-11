export function normalizePath(rawPath: string): string {
  return rawPath.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");
}
