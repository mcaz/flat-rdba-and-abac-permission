import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~/': `${resolve(__dirname, 'src')}/`,
      '@rdba-abac-auth/permission': resolve(__dirname, 'packages/permission/src'),
    },
  },
  optimizeDeps: {
    include: ['@rdba-abac-auth/permission']
  }
}) 