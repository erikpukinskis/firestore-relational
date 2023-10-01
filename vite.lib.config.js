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
      "externals": ["fs"],
    }),
  ],

  build: {
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "lib/index.ts"),
      name: "FirestoreRelational",
      fileName: (format) => `lib.${format}.js`,
    },

    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["firebase-admin", "firebase-functions"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          "firebase-admin": "firebaseadmin",
          "firebase-functions": "firebasefunctions",
        },
      },
    },
  },
})
