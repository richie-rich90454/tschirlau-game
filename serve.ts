// Offline static server for dist/ (no downloads, no CDN).
const TYPES: Record<string, string>={html: 'text/html', js: 'text/javascript', map: 'application/json', css: 'text/css', woff2: 'font/woff2', ttf: 'font/ttf', png: 'image/png'};
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
    if(p==='/'){
        p='/index.html';
    }
    if(p.indexOf('..')>=0){
        return new Response('Bad request', {status: 400});
    }
    let f: ReturnType<typeof Bun.file>=Bun.file('./dist'+p);
    if(await f.exists()){
        return new Response(f, {headers: {'Content-Type': ctype(p)}});
    }
    return new Response('Not found', {status: 404});
}};
console.log('Serving dist/ at http://localhost:8080');
