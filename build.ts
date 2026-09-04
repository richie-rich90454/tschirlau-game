// Offline production build: bundles the game plus static files into dist/.
import {rmSync, mkdirSync, copyFileSync, cpSync} from 'node:fs';
rmSync('dist', {recursive: true, force: true});
mkdirSync('dist/assets/fonts', {recursive: true});
let r: unknown=await Bun.build({entrypoints: ['./src/main.ts'], outdir: './dist', target: 'browser', format: 'esm', sourcemap: 'external', minify: true});
if(!(r as {success: boolean}).success){
    throw new Error('Build failed.');
}
copyFileSync('index.html', 'dist/index.html');
cpSync('assets/fonts', 'dist/assets/fonts', {recursive: true});
console.log('Built dist/ offline-ready.');
