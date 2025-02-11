import { defineConfig } from "vite";
import fileRouterPlugin from "./src/vite-plugin-file-router";

export default defineConfig({
  plugins: [
    fileRouterPlugin({
      pagesDir: "src/pages",
      notFoundPage: "./src/pages/404.tsx",
      loadingComponent: "./src/components/Loading.tsx",
    }),
  ],
});
