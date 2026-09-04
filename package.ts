// Single-file package entry: `bun run package` compiles this into one executable.
import indexHtml from './dist/index.html' with {type: 'text'};
import mainJs from './dist/main.js' with {type: 'file'};
import mainMap from './dist/main.js.map' with {type: 'file'};
import font400 from './dist/assets/fonts/noto-sans-mono-400-latin.woff2' with {type: 'file'};
import font700 from './dist/assets/fonts/noto-sans-mono-700-latin.woff2' with {type: 'file'};
const DOCTEXT: string=indexHtml as unknown as string;
const PATHS: Record<string, string>={'/main.js': mainJs, '/main.js.map': mainMap, '/assets/fonts/noto-sans-mono-400-latin.woff2': font400, '/assets/fonts/noto-sans-mono-700-latin.woff2': font700};
const TYPES: Record<string, string>={html: 'text/html', js: 'text/javascript', map: 'application/json', woff2: 'font/woff2'};
function ctype(p: string): string{
    let e: string|undefined=p.split('.').pop();
    if(e===undefined){
        return 'application/octet-stream';
    }
    let t: string|undefined=TYPES[e];
    if(t===undefined){
        return 'application/octet-stream';
    }
    return t;
}
export default {port: 8080, async fetch(req: Request): Promise<Response>{
    let p: string=new URL(req.url).pathname;
    if(p==='/'||p==='/index.html'){
        return new Response(DOCTEXT, {headers: {'Content-Type': 'text/html'}});
    }
    let f: string|undefined=PATHS[p];
    if(f===undefined){
        return new Response('Not found', {status: 404});
    }
    return new Response(Bun.file(f), {headers: {'Content-Type': ctype(p)}});
}};
console.log('Tschirlau packaged server at http://localhost:8080');
