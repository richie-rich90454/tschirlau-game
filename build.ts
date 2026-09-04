// Offline production build: bundles the game plus static files into dist/.
import {rmSync, mkdirSync, cpSync} from 'node:fs';
rmSync('dist', {recursive: true, force: true});
mkdirSync('dist/assets/fonts', {recursive: true});
let r: unknown=await Bun.build({entrypoints: ['./src/main.ts'], outdir: './dist', target: 'browser', format: 'esm', sourcemap: 'external', minify: true});
if(!(r as {success: boolean}).success){
    throw new Error('Build failed.');
}
let html: string=await Bun.file('index.html').text();
html=html.split('./src/main.ts').join('./main.js');
await Bun.write('dist/index.html', html);
cpSync('assets/fonts', 'dist/assets/fonts', {recursive: true});
console.log('Built dist/ offline-ready.');
