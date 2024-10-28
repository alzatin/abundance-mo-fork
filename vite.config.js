import { defineConfig } from "vite";
import reactPlugin from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactPlugin()],
  base: "/abundace-mo-fork",
  build: {
    outDir: "dist",
  },
  server: {
    port: 4444,
  },
});
