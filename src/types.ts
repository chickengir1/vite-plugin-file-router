export interface FileRouterPluginOptions {
  pagesDir: string;
  notFoundPage?: string;
  loadingComponent?: string;
}

export interface Server {
  watcher: {
    add: (fileOrDir: string) => void;
    on: (event: "add" | "unlink", callback: (filePath: string) => void) => void;
  };
}
