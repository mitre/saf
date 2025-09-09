import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    disableConsoleIntercept: true,
    hookTimeout: 80000,
    testTimeout: 80000
  }
});
