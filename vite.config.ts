import { defineConfig, Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import UnoCSS from 'unocss/vite';
import { resolve, relative, dirname, basename } from 'path';
import { readdir, readFile, writeFile, stat } from 'fs/promises';

/**
 * Vite lib 模式会把 CSS 提取成独立文件但不保留 JS 中的 import。
 * 这个插件在构建后扫描 dist，把 CSS import 注入回对应的 JS 文件。
 */
function cssInjector(outDir: string): Plugin {
  return {
    name: 'css-import-injector',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      const { rename } = await import('fs/promises');
      const cssFiles = await findFiles(outDir, /\.css$/);
      for (const cssFile of cssFiles) {
        const dir = dirname(cssFile);
        const name = basename(cssFile);
        // 跳过 __uno.css，由消费方显式 import '@munet/ui/uno.css'
        if (name === '__uno.css') continue;
        // 重命名 .module.css -> .css，避免消费方 Vite 重新处理 CSS modules
        const finalCssName = name.replace('.module.css', '.css');
        if (finalCssName !== name) {
          await rename(cssFile, resolve(dir, finalCssName));
        }
        // 找对应的 JS 文件
        const candidates = [
          resolve(dir, name.replace(/\.css$/, '.js')),
          resolve(dir, name.replace(/\.css$/, '.vue.js')),
          resolve(dir, name.replace(/\.module\.css$/, '.module.sass.js')),
          resolve(dir, name.replace(/\.module\.css$/, '.module.scss.js')),
        ];
        for (const jsFile of candidates) {
          try {
            await stat(jsFile);
            const content = await readFile(jsFile, 'utf-8');
            const importLine = `import './${finalCssName}';\n`;
            if (!content.includes(importLine)) {
              await writeFile(jsFile, importLine + content);
            }
            break;
          } catch {
            // file doesn't exist, try next
          }
        }
      }
      // 清理所有 JS 文件中的 /* empty css */ 注释
      const jsFiles = await findFiles(outDir, /\.js$/);
      for (const jsFile of jsFiles) {
        const content = await readFile(jsFile, 'utf-8');
        if (content.includes('/* empty css')) {
          await writeFile(jsFile, content.replace(/\/\*\s*empty css\s*\*\/\n?/g, ''));
        }
      }
    },
  };
}

async function findFiles(dir: string, pattern: RegExp): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await findFiles(full, pattern));
    } else if (pattern.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

export default defineConfig({
  plugins: [vue(), vueJsx(), UnoCSS(), cssInjector(resolve(__dirname, 'dist'))],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'themes/index': resolve(__dirname, 'src/themes/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue',
        '@vueuse/core',
        'lodash-es',
        '@chenfengyuan/vue-qrcode',
        /^qrcode/,
        'dijkstrajs',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    cssCodeSplit: true,
    emptyOutDir: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]_[hash:base64:5]',
    },
  },
});

