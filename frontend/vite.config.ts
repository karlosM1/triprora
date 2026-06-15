import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3001'

  return {
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          configure: (proxy) => {
            let logged = false
            proxy.on('error', (err) => {
              if (logged || !('code' in err) || err.code !== 'ECONNREFUSED') {
                return
              }
              logged = true
              console.error(
                `\n[vite] API proxy error: backend not reachable at ${apiProxyTarget}`,
              )
              console.error(
                '[vite] Start it with `npm run dev:backend` or run both with `npm run dev` from the project root.\n',
              )
            })
          },
        },
      },
    },
  }
})
