import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ComimiReact",
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "@yui540/comimi"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@yui540/comimi": "Comimi",
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
