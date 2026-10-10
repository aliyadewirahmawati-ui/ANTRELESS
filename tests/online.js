// Explicitly run against a staging Supabase project with real test accounts.
import {createClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
if(existsSync('.env.test'))process.loadEnvFile('.env.test');
const names=['ANTRELESS_TEST_URL','ANTRELESS_TEST_KEY','ANTRELESS_TEST_ADMIN_EMAIL','ANTRELESS_TEST_ADMIN_PASSWORD','ANTRELESS_TEST_BUYER_EMAIL','ANTRELESS_TEST_BUYER_PASSWORD','ANTRELESS_TEST_OTHER_EMAIL','ANTRELESS_TEST_OTHER_PASSWORD'];
if(names.some(name=>!process.env[name])||process.env.ANTRELESS_TEST_ALLOW_WRITES!=='1'){
  console.error('NOT RUN: Fill the staging variables in .env.test and set ANTRELESS_TEST_ALLOW_WRITES=1. See README.txt.');process.exit(2);
}
const url=process.env.ANTRELESS_TEST_URL,key=process.env.ANTRELESS_TEST_KEY;
let publicKey=key.startsWith('sb_publishable_');try{publicKey ||= JSON.parse(Buffer.from(key.split('.')[1]||'','base64url')).role==='anon';}catch{}if(!publicKey)throw Error('Use a publishable/anon key, never a secret/service-role key.');
const clients=[];
const checked=async result=>{const {data,error}=await result;if(error)throw error;return data;};
const one=result=>Array.isArray(result)?result[0]:result;
async function user(label){const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});clients.push(client);await checked(client.auth.signInWithPassword({email:process.env['ANTRELESS_TEST_'+label+'_EMAIL'],password:process.env['ANTRELESS_TEST_'+label+'_PASSWORD']}));return client;}
async function waitFor(test,seconds=25){const end=Date.now()+seconds*1000;while(Date.now()<end){if(await test())return;await new Promise(resolve=>setTimeout(resolve,500));}throw Error('Timed out waiting for online synchronization.');}
try{
  const admin=await user('ADMIN'),buyer=await user('BUYER'),other=await user('OTHER');
  const kantin=one(await checked(admin.rpc('save_kantin',{p_id:null,p_name:'Kantin Uji '+randomUUID().slice(0,8),p_location:'Lokasi pengujian, bukan penjualan',p_opens:'00:00',p_closes:'23:59',p_accept:true,p_demo:false})));
  const menu=one(await checked(admin.rpc('save_menu',{p_id:null,p_kantin:kantin.id,p_name:'Menu uji integrasi',p_category:'Uji',p_kind:'food',p_active:true,p_verified:true,p_note:'Data pengujian staging'})));
  const variant=one(await checked(admin.rpc('save_variant',{p_id:null,p_menu:menu.id,p_name:'Pilihan A',p_price:12000,p_stock:5,p_active:true,p_verified:true})));
  const buyerId=(await checked(buyer.auth.getUser())).user.id;
  let observed=false;
  const channel=admin.channel('integration-'+randomUUID()).on('postgres_changes',{event:'INSERT',schema:'public',table:'orders',filter:'kantin_id=eq.'+kantin.id},()=>{observed=true;}).subscribe();
  await waitFor(()=>channel.state==='joined');
  const request={p_options:{payment_method:'on_pickup',terms_version:'2026-10-11'},p_key:randomUUID(),p_items:[{variant_id:variant.id,quantity:1,price_mode:'regular'}]};
  const result=await checked(buyer.rpc('checkout_with_details',request));assert.equal(result.length,1);const order=result[0];assert.equal(order.total,12000);
  assert.deepEqual(await checked(buyer.rpc('checkout_with_details',request)),result);await waitFor(()=>observed);
  assert.equal((await checked(admin.from('orders').select('*').eq('id',order.id))).length,1);
  assert.equal((await checked(other.from('orders').select('*').eq('id',order.id))).length,0);
  assert.equal((await checked(other.from('order_items').select('*').eq('order_id',order.id))).length,0);
  for(const status of ['preparing','ready','completed']){await checked(admin.rpc('update_order',{p_order_id:order.id,p_status:status,p_eta:null,p_note:'Uji status',p_reason:''}));await waitFor(async()=>one(await checked(buyer.from('orders').select('*').eq('id',order.id)))?.status===status);}
  await checked(admin.rpc('save_variant',{p_id:variant.id,p_menu:menu.id,p_name:'Pilihan A',p_price:12000,p_stock:1,p_active:true,p_verified:true}));
  const races=await Promise.all([buyer,other].map(client=>client.rpc('checkout_with_details',{p_options:{payment_method:'on_pickup',terms_version:'2026-10-11'},p_key:randomUUID(),p_items:[{variant_id:variant.id,quantity:1,price_mode:'regular'}]})));
  assert.equal(races.filter(r=>!r.error).length,1);
  assert.equal(one(await checked(admin.from('menu_variants').select('stock').eq('id',variant.id))).stock,0);
  await checked(buyer.auth.signOut());await checked(buyer.auth.signInWithPassword({email:process.env.ANTRELESS_TEST_BUYER_EMAIL,password:process.env.ANTRELESS_TEST_BUYER_PASSWORD}));
  assert.equal(one(await checked(buyer.from('orders').select('*').eq('id',order.id))).buyer_id,buyerId);
  await checked(admin.rpc('save_kantin',{p_id:kantin.id,p_name:kantin.name,p_location:kantin.pickup_location,p_opens:'00:00',p_closes:'23:59',p_accept:false,p_demo:true}));
  console.log('Real Supabase Auth/Realtime, RLS, idempotency, statuses, relogin and concurrent final stock: PASS. Test canteen disabled; receipts retained.');
}finally{await Promise.allSettled(clients.map(async client=>{await client.removeAllChannels();await client.auth.signOut();}));}
