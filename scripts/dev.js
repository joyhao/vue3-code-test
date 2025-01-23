// 打包packages文件下的模块

import minimist from 'minimist';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import esbuild from 'esbuild';
// require方法
const require = createRequire(import.meta.url);

// import.meta.url 当前文件的file路径
// 获取文件的绝对路径  file路径转成/path
const __filename = fileURLToPath(import.meta.url);

// G:\练习\vue\vue3-kit\scripts 当前文件的文件夹绝对路径
const __dirname = dirname(__filename);
// console.log(__filename, __dirname);

// process.argv 所有命令行参数
const args = minimist(process.argv.slice(2));

// 打包哪个项目 默认（packages/reactivity）
const target = args?._[0] ?? 'reactivity';

// 打包格式
const format = args?.f ?? 'esm';

/**
 * 开始打包
 */

// 打包入口文件
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`);

const pkg = require(`../packages/${target}/package.json`);
const globalName = pkg?.buildOptions?.name ?? pkg.name;

// 打包

esbuild
  .context({
    entryPoints: [entry],
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
    bundle: true, //依赖打包在一起
    platform: 'browser', // 打包后给浏览器使用
    sourcemap: true, // 可以调试源代码
    format: format, // cjs esm iife
    globalName: globalName
  })
  .then((ctx) => {
    const watch = ctx.watch();
    console.log('watch');

    return watch; // 监控文件持续打包
  });
