import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    // Only pick up our own test files, never node_modules or build output
    include: ['lib/**/__tests__/**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**', '.worktrees/**'],
  },
})
