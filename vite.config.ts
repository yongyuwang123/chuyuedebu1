/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  // 相对路径 base：Gitee Pages / GitHub Pages 项目页均带仓库名子路径，
  // 用 './' 可保证 /assets 正确加载（避免 /assets 在子路径下 404）。
  base: './',
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'node',
  },
});
