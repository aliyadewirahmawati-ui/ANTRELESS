import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {watch} from 'node:fs';
import {buildSite} from './build.js';
import {existsSync} from 'node:fs';
for(const file of ['.env','.env.local'])if(existsSync(file))process.loadEnvFile(file);
if(process.argv.includes('--watch'))await buildSite();
const files={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/assets/menu-illustrations.png':'assets/menu-illustrations.png'};
const server=http.createServer(async(req,res)=>{
  const file=files[new URL(req.url,'http://localhost').pathname];
  if(!file){res.writeHead(404).end();return;}
  try{const body=await readFile('dist/'+file);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.png')?'image/png':'text/html; charset=utf-8');res.setHeader('Cache-Control','no-cache');res.end(body);}catch{res.writeHead(503).end('Build the site with npm run build first.');}
});
server.listen(Number(process.env.PORT||5500),'127.0.0.1',()=>console.log('Antreless: http://127.0.0.1:'+server.address().port));
if(process.argv.includes('--watch')){
  let timer,busy=false,again=false;
  const rebuild=async()=>{if(busy){again=true;return;}busy=true;try{await buildSite();}catch(error){console.error(error.message);}finally{busy=false;if(again){again=false;rebuild();}}};
  for(const file of ['index.html','style.css','src'])watch(file,{recursive:file==='src'},()=>{clearTimeout(timer);timer=setTimeout(rebuild,200);});
}
