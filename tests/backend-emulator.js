// Test-only HTTP adapter around the real migration/RLS/RPCs in PGlite.
// It emulates Auth/PostgREST, not Supabase Realtime or production Auth security.
import http from 'node:http';
import {databaseFixture,ids} from './database-fixture.js';
export async function backendEmulator(){
  const fixture=await databaseFixture();const {db,asUser,rpc}=fixture;
  await rpc(ids.admin,'save_kantin',[ids.kantin,'Kantin Uji','Depan taman','06:30','17:00',true,false]);
  await rpc(ids.admin,'save_menu',[ids.menu,ids.kantin,'Mie Ayam Polos','Mie','food',true,true,'']);
  await rpc(ids.admin,'save_variant',[ids.variant,ids.menu,'Standar',12000,10,true,true]);
  const tokens=new Map();let blockCheckout=false;
  function session(id){const payload={sub:id,role:'authenticated',aud:'authenticated',email:id===ids.admin?'admin@qa.invalid':id===ids.other?'other@qa.invalid':'buyer@qa.invalid',exp:Math.floor(Date.now()/1000)+3600,iat:Math.floor(Date.now()/1000)};const token=Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')+'.'+Buffer.from(JSON.stringify(payload)).toString('base64url')+'.test';tokens.set(token,id);return {access_token:token,refresh_token:'test-refresh:'+id,expires_in:3600,token_type:'bearer',user:{id,email:payload.email,aud:'authenticated',role:'authenticated',created_at:new Date().toISOString(),app_metadata:{provider:'email'},user_metadata:{display_name:'Pengguna Uji'},identities:[]}};}
  const server=http.createServer(async(req,res)=>{
    res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Content-Type','application/json');
    if(req.method==='OPTIONS'){res.writeHead(204).end();return;}
    const url=new URL(req.url,'http://localhost');const user=tokens.get((req.headers.authorization||'').replace(/^Bearer /,''));
    let body='';for await(const chunk of req)body+=chunk;
    const data=body?JSON.parse(body):{};
    const send=(value,status=200)=>{res.writeHead(status);res.end(JSON.stringify(value));};
    try{
      if(url.pathname==='/auth/v1/token'){
        const users={'buyer@qa.invalid':ids.buyer,'other@qa.invalid':ids.other,'admin@qa.invalid':ids.admin};
        const id=data.refresh_token?.replace('test-refresh:','')||users[data.email];if(!id||(!data.refresh_token&&data.password!=='test-password'))return send({message:'Invalid login credentials'},400);
        return send(session(id));
      }
      if(url.pathname==='/auth/v1/user'){if(!user)return send({message:'Unauthorized'},401);return send(session(user).user);}
      if(url.pathname==='/auth/v1/logout')return send({});
      if(url.pathname.startsWith('/rest/v1/rpc/')){
        if(!user)return send({message:'Masuk terlebih dahulu.'},401);
        const name=url.pathname.split('/').at(-1);
        const signatures={checkout_with_details:['p_key','p_items','p_options'],update_order:['p_order_id','p_status','p_eta','p_note','p_reason'],save_kantin:['p_id','p_name','p_location','p_opens','p_closes','p_accept','p_demo'],save_menu:['p_id','p_kantin','p_name','p_category','p_kind','p_active','p_verified','p_note'],save_variant:['p_id','p_menu','p_name','p_price','p_stock','p_active','p_verified'],save_promo:['p_variant','p_price','p_quota','p_remaining','p_starts','p_ends','p_active']};
        if(!signatures[name])return send({message:'Unknown RPC'},404);
        if(name==='checkout_with_details'&&blockCheckout)return send({message:'Gangguan jaringan uji'},503);
        const params=signatures[name].map(k=>['p_items','p_options'].includes(k)?JSON.stringify(data[k]):data[k]);return send(await rpc(user,name,params));
      }
      const table=url.pathname.replace('/rest/v1/','');
      if(!['kantin','menu','menu_variants','promos','profiles','kantin_admins','orders','order_items','order_status_history'].includes(table))return send({message:'Not found'},404);
      let rows=await asUser(user||'',`select * from public.${table}`);
      rows=rows.map(row=>Object.fromEntries(Object.entries(row).map(([name,value])=>[name,['queue_day','stock_date'].includes(name)&&value instanceof Date?value.toISOString().slice(0,10):value])));
      for(const field of ['id','buyer_id','kantin_id']){const filter=url.searchParams.get(field);if(filter?.startsWith('eq.'))rows=rows.filter(row=>row[field]===filter.slice(3));}
      if(table==='orders'){
        const items=await asUser(user||'','select * from public.order_items'),history=await asUser(user||'','select * from public.order_status_history');
        rows.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));rows=rows.map(o=>({...o,order_items:items.filter(i=>i.order_id===o.id),order_status_history:history.filter(h=>h.order_id===o.id)}));
      }
      if(req.headers.accept?.includes('vnd.pgrst.object'))return rows.length===1?send(rows[0]):send({message:'Single row expected'},406);
      send(rows);
    }catch(error){send({message:error.message,code:error.code},400);}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {...fixture,url:'http://127.0.0.1:'+server.address().port,setCheckoutFailure:value=>blockCheckout=value,close:async()=>{await new Promise(resolve=>server.close(resolve));await db.close();}};
}
