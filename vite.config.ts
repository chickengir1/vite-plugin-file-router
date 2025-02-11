import { defineConfig } from "vite";
import fileRouterPlugin from "./src/vite-plugin-file-router";

export default defineConfig({
  plugins: [fileRouterPlugin()],
});
