import { defineConfig } from "vite";
import reactPlugin from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactPlugin()],
  base: "/Abundance-Mo-Fork",
  build: {
    outDir: "dist",
  },
  server: {
    port: 4444,
  },
});
