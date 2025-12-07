import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        // 🚀 关键修改点：添加 base 属性并设置为根路径 '/'
        // 因为您的仓库是 bjjwwang.github.io，部署在根域名下。
       base: '/stockjw.github.io/', 
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        define: {
            // 注意：Vite 推荐使用 import.meta.env.* 来访问环境变量
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                // 注意：这里将 '@' 设置为项目根目录 (__)
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});
