import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    // drizzle-orm è bundlato (non esternalizzato) perché il suo adapter require('better-sqlite3')
    // a livello di modulo. L'alias lo reindirizza a better-sqlite3-multiple-ciphers, che resta
    // esterno (nativo). Vite risolve il require nel bundle → output: require('better-sqlite3-multiple-ciphers').
    plugins: [externalizeDepsPlugin({ exclude: ['drizzle-orm'] })],
    resolve: {
      alias: { 'better-sqlite3': 'better-sqlite3-multiple-ciphers' }
    },
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'main/app.ts') },
        output: { entryFileNames: '[name].js' }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(__dirname, 'main/preload.ts') },
        output: { entryFileNames: '[name].js' }
      }
    }
  },
  renderer: {
    root: resolve(__dirname, 'src'),
    plugins: [react()],
    build: {
      outDir: resolve(__dirname, 'out/renderer'),
      rollupOptions: {
        input: resolve(__dirname, 'src/index.html')
      }
    }
  }
})
