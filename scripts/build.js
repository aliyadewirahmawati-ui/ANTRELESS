import {build} from 'esbuild-wasm';
import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export async function buildSite({outDir='dist',env=process.env}={}){
  const url=env.VITE_SUPABASE_URL||'',key=env.VITE_SUPABASE_PUBLISHABLE_KEY||env.VITE_SUPABASE_ANON_KEY||'';
  // Only public configuration may enter the bundle, even if a secret was assigned to the wrong env variable.
  for(const value of [env.VITE_SUPABASE_PUBLISHABLE_KEY,env.VITE_SUPABASE_ANON_KEY].filter(Boolean)){let valid=value.startsWith('sb_publishable_');try{valid ||= JSON.parse(Buffer.from(value.split('.')[1]||'','base64url')).role==='anon';}catch{}if(!valid)throw Error('Use a Supabase publishable/anon key, never a secret/service-role key.');}
  if(url&&!/^https?:\/\//.test(url))throw Error('VITE_SUPABASE_URL must be an HTTP(S) project URL.');
  await mkdir(path.join(outDir,'assets'),{recursive:true});
  await build({entryPoints:['src/app.js'],outfile:path.join(outDir,'app.js'),bundle:true,minify:true,format:'esm',platform:'browser',target:'es2022',logLevel:'warning',define:{
    'import.meta.env.VITE_SUPABASE_URL':JSON.stringify(url),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY':JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY||''),
    'import.meta.env.VITE_SUPABASE_ANON_KEY':JSON.stringify(env.VITE_SUPABASE_ANON_KEY||'')
  }});
  const html=(await readFile('index.html','utf8')).replace('  <link rel="stylesheet" href="/src/overrides.css">','').replace('src="/src/app.js"','src="/app.js"');
  await writeFile(path.join(outDir,'index.html'),html);
  await writeFile(path.join(outDir,'style.css'),(await readFile('style.css','utf8'))+'\n'+(await readFile('src/overrides.css','utf8')));
  await copyFile('assets/menu-illustrations.png',path.join(outDir,'assets/menu-illustrations.png'));
  console.log(`Build ready: ${outDir} (${url&&key?'Supabase configured':'local demonstration; no real payment'})`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  // Read developer configuration without copying .env files or secrets into dist.
  for(const file of ['.env','.env.local'])if(existsSync(file))process.loadEnvFile(file);
  await buildSite();
}
