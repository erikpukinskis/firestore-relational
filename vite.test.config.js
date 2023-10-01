import path from "path"
import { defineConfig } from "vite"
import commonjsExternals from "vite-plugin-commonjs-externals"

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./lib"),
    },
  },

  plugins: [
    commonjsExternals({
      "externals": [
        "async_hooks",
        "crypto",
        "events",
        "fs",
        "http",
        "os",
        "path",
        "stream",
        "url",
        "util",
        "zlib",
      ],
    }),
  ],

  build: {
    rollupOptions: {},
  },
})
