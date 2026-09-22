import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/stats": "http://localhost:8000",
      "/sessions": "http://localhost:8000",
      "/readings": "http://localhost:8000",
      "/bpm": "http://localhost:8000",
      "/health": "http://localhost:8000",
    },
  },
  build: { outDir: "dist" },
});