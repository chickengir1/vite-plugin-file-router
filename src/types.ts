export interface FileRouterPluginOptions {
  pagesDir: string;
  notFoundPage?: string;
  loadingComponent?: string;
}

export interface Server {
  watcher: {
    add: (file: string) => void;
    on: (event: string, callback: (file: string) => void) => void;
  };
}
