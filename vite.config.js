import { defineConfig } from "vite";
import reactPlugin from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactPlugin()],
<<<<<<< Updated upstream
  base: "/",
=======
  base: "/abundance-mo-fork/ ",
>>>>>>> Stashed changes
  build: {
    outDir: "dist",
  },
  server: {
    port: 4444,
  },
});
