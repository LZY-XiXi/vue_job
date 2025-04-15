import { fileURLToPath, URL } from 'node:url'
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import viteCompression from "vite-plugin-compression";
import { resolve } from "path";

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        publicDir: resolve(__dirname, "public"),
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, "electron/main.js")
                }
            }
        }
    },

    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            rollupOptions:{
                input:{
                    index: resolve(__dirname, "electron/preload.mjs")
                }
            }
        }
    },

    renderer: {
        plugins: [
            vue(),
            viteCompression()
        ],
        resolve: {
            extensions: [".ts", ".js", ".vue", ".json"],
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            },
        },
        server: {
            host: "127.0.0.1",
            port: 3000
        },
        publicDir: resolve(__dirname, "public"),
        root: ".",
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, "index.html")
                }
            },
            terserOptions: {
                compress: {
                    pure_funcs: ["console.log"]
                }
            },
            sourcemap: false,
        }
    }
})

