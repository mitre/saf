import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    disableConsoleIntercept: true,
    hookTimeout: 80_000,
    testTimeout: 80_000,
  },
});
