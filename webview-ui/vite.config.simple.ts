import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { resolve } from "path"

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
    chunkSizeWarningLimit: 100000,
  },
  server: {
    port: 25463,
  },
  define: {
    __PLATFORM__: JSON.stringify("vscode"),
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@shared": resolve(__dirname, "../src/shared"),
    },
  },
})