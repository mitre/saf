import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    disableConsoleIntercept: true,
    testTimeout: 20000
  }
});
