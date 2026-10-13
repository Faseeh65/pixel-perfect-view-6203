// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { visualizer } from "rollup-plugin-visualizer";
import type { PluginOption } from "vite";

export default defineConfig({
  plugins:
    process.env["npm_lifecycle_event"] === "analyze"
      ? [
          visualizer({
            filename: "bundle-stats.html",
            template: "treemap",
            gzipSize: true,
            brotliSize: true,
            emitFile: true,
          }) as PluginOption,
        ]
      : [],
  tanstackStart: {
    router: {
      autoCodeSplitting: true,
    },
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            minSize: 10 * 1024,
            groups: [
              {
                name: "react-vendor",
                test: /node_modules[\\/]((react|react-dom|scheduler))[\\/]/,
                priority: 20,
              },
              {
                name: "tanstack-vendor",
                test: /node_modules[\\/]@tanstack[\\/]/,
                priority: 10,
              },
            ],
          },
        },
      },
    },
  },
});
