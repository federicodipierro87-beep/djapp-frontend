import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Changes on every build. The bundle carries it as __BUILD_ID__ and also serves
// it at /version.json, so a tab left open can tell that it is running code that
// has since been replaced.
const buildId = Date.now().toString(36)

const emitBuildId = (): Plugin => ({
  name: 'emit-build-id',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({ buildId })
    })
  }
})

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), emitBuildId()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    // Production used to ship a readable copy of the whole source tree next to
    // the bundle, and pay to upload it on every deploy.
    sourcemap: mode !== 'production'
  },
  define: {
    'process.env': {},
    __BUILD_ID__: JSON.stringify(buildId)
  }
}))