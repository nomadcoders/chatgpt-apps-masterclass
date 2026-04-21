import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { skybridge } from "skybridge/web";
import { defineConfig, type PluginOption } from "vite";

export default defineConfig({
  plugins: [skybridge() as PluginOption, react(), tailwindcss()],
  root: __dirname,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
