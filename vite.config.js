import { defineConfig } from "vite";
import reactPlugin from "@vitejs/plugin-react";
import Pages from "vite-plugin-pages";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactPlugin(), Pages()],

  base: "/abundance-mo-fork",
  build: {
    outDir: "dist",
  },
  server: {
    port: 4444,
  },
});
