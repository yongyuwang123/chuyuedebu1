import { defineConfig } from 'vitest/config';

// 关闭 SSR 缓存写入（沙箱环境临时目录写入受限），避免 EPERM 未处理错误
export default defineConfig({
  test: {
    cache: false,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
