import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
export const ids={buyer:'b0000000-0000-4000-8000-000000000001',other:'b0000000-0000-4000-8000-000000000002',admin:'a0000000-0000-4000-8000-000000000001',adminOther:'a0000000-0000-4000-8000-000000000002',kantin:'00000000-0000-4000-8000-000000000001',kantinOther:'00000000-0000-4000-8000-000000000002',menu:'10000000-0000-4000-8000-000000000001',variant:'20000000-0000-4000-8000-000000000001'};
export async function databaseFixture(){
  const db=new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth; grant usage on schema public,auth to anon,authenticated;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant execute on function auth.uid() to anon,authenticated;`);
  await db.exec(await readFile(new URL('../supabase/migrations/202610100001_shared_orders.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('../supabase/seed.sql',import.meta.url),'utf8'));
  await db.exec(`create or replace function private.business_time() returns timestamptz language sql volatile set search_path='' as $$select '2026-10-10T09:00:00Z'::timestamptz$$;`);
  for(const [label,id] of Object.entries(ids).filter(([name])=>['buyer','other','admin','adminOther'].includes(name)))await db.query(`insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)`,[id,label+'@qa.invalid',JSON.stringify({display_name:label,role:'admin'})]);
  await db.query(`update public.profiles set role='admin' where id in($1,$2)`,[ids.admin,ids.adminOther]);
  await db.query(`insert into public.kantin_admins(kantin_id,user_id) values($1,$2)`,[ids.kantin,ids.admin]);
  const asUser=(user,sql,params=[])=>db.transaction(async tx=>{await tx.exec('set local role authenticated');await tx.query("select set_config('request.jwt.claim.sub',$1,true)",[user]);return (await tx.query(sql,params)).rows;});
  const rpc=async(user,name,params)=>{const placeholders=params.map((_,i)=>'$'+(i+1)).join(',');const rows=await asUser(user,`select to_jsonb(public.${name}(${placeholders})) as result`,params);return rows[0].result;};
  return {db,asUser,rpc};
}
