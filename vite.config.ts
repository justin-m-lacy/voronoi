import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import autoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vitest/config';

/// <reference types="vitest/globals" />

const getApiBase = (url?: string) => {

  if (url == null) {
    return 'localhost';
  }
  const portIndex = url.lastIndexOf(':');
  return portIndex > 0 ? url.substring(0, portIndex) : url;

}

// https://vitejs.dev/config/
export default async function ({ mode, command }) {

  const isDev = mode !== 'production';

  const origins = ["'self'", "https://theory-of-magic.gitlab.io/"].join(" ");

  const api_base = getApiBase(process.env.VITE_API_BASE);

  return defineConfig({

    build: {
      minify: 'terser',
      rollupOptions: {
        plugins: [
          /* zipPack({
             outDir: './'
           }),*/
        ]
      },

    },
    base: './',
    resolve: {
      alias: [
        { find: /^@\//, replacement: `${resolve(__dirname, './src')}/` },
        { find: /^assets\//, replacement: `${resolve(__dirname, './assets')}/` },
      ]
    },
    test: {
      globals: true,
      environment: 'node'
    },
    define: {
      //"__INTLIFY_PROD_DEVTOOLS__": false,
      //"__VUE_I18N_LEGACY_API__": false
      /// @note The quotes around the variable value are necessary.
      //"import.meta.env.build_variable": `"${buildVar}"`
    },

    plugins: [

      tailwindcss(),

      vue(),

      // auto-import listed packages
      autoImport({
        dts: resolve(__dirname, 'src/auto-imports.d.ts'),
        imports: ["vue"]

      }),

    ],

    optimizeDeps: {

      include: [
        "vue",
        "@vueuse/core",

      ]
    },

    preview: {
      port: 5000,
      cors: true,
    },


    server: {
      port: 3001,
      cors: true,
      hmr: process.env.SILENT ? false : {
        host: 'localhost'
      },
      watch: {
        ignored: [
          resolve(__dirname, "src/auto-imports.d.ts"),
          resolve(__dirname, "src/components.d.ts")
        ],
      },
    }

  });
}