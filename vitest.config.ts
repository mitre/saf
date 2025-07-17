import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    disableConsoleIntercept: true,
    hookTimeout: 40000,
    testTimeout: 40000
  }
});
