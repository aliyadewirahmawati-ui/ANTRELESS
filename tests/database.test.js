import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {databaseFixture,ids} from './database-fixture.js';
let f,db,rpc,asUser;
const items=(variant=ids.variant,quantity=1,mode='regular')=>JSON.stringify([{variant_id:variant,quantity,price_mode:mode}]);
const checkout=(user=ids.buyer,payload=items(),key=randomUUID())=>rpc(user,'checkout',[key,payload]);
const stock=async variant=>(await db.query('select stock from public.menu_variants where id=$1',[variant])).rows[0].stock;
before(async()=>{f=await databaseFixture();({db,rpc,asUser}=f);});
after(async()=>{await db?.close();});
test('Signup metadata cannot assign role; buyers cannot directly update role, stock, or orders',async()=>{
  assert.equal((await asUser(ids.buyer,'select role from public.profiles'))[0].role,'buyer');
  for(const sql of ["update public.profiles set role='admin'",'update public.menu_variants set stock=999',"insert into public.kantin_admins(kantin_id,user_id) values('"+ids.kantin+"','"+ids.buyer+"')"]){await assert.rejects(()=>asUser(ids.buyer,sql),/permission denied/);}
  await assert.rejects(()=>rpc(ids.buyer,'save_kantin',[null,'Fake','','00:00','23:59',true,false]),/Hanya admin/);
});
test('Demo/unconfirmed menus are rejected by backend; trusted admin can verify catalog',async()=>{
  await assert.rejects(()=>checkout(),/Demo/);
  await rpc(ids.admin,'save_kantin',[ids.kantin,'Kantin Utama','Pintu depan','06:30','17:00',true,false]);
  await assert.rejects(()=>checkout(),/belum dikonfirmasi/);
  await rpc(ids.admin,'save_menu',[ids.menu,ids.kantin,'Mie Ayam Polos','Mie','food',true,true,'Sudah dicek']);
  await rpc(ids.admin,'save_variant',[ids.variant,ids.menu,'Standar',12000,20,true,true]);
});
test('Idempotent checkout uses backend prices and snapshots, with an atomic stock decrease',async()=>{
  const key=randomUUID();const payload=JSON.stringify([{variant_id:ids.variant,quantity:2,price_mode:'regular',price:1,total:1}]);
  const orders=await checkout(ids.buyer,payload,key);assert.equal(orders[0].total,24000);assert.equal(await stock(ids.variant),18);
  assert.deepEqual(await checkout(ids.buyer,payload,key),orders);assert.equal(await stock(ids.variant),18);
  await assert.rejects(()=>checkout(ids.buyer,items(ids.variant,3),key),/keranjang berbeda/);
  assert.equal((await asUser(ids.buyer,'select unit_price,menu_name,variant_name from public.order_items'))[0].unit_price,12000);
  await assert.rejects(()=>checkout(ids.buyer,JSON.stringify([{variant_id:ids.variant,quantity:1,price_mode:'regular',expected_unit_price:1000}])),/Harga berubah/);
  assert.equal(await stock(ids.variant),18);
});
test('RLS isolates buyers and limits admins to assigned canteens including items/history',async()=>{
  assert.equal((await asUser(ids.other,'select * from public.orders')).length,0);
  assert.equal((await asUser(ids.other,'select * from public.order_items')).length,0);
  assert.equal((await asUser(ids.other,'select * from public.order_status_history')).length,0);
  assert.equal((await asUser(ids.adminOther,'select * from public.orders')).length,0);
  assert.equal((await asUser(ids.admin,'select * from public.orders')).length,1);
  const order=(await asUser(ids.buyer,'select * from public.orders'))[0];
  await assert.rejects(()=>rpc(ids.buyer,'update_order',[order.id,'ready',null,'','']),/berwenang/);
  await assert.rejects(()=>rpc(ids.adminOther,'update_order',[order.id,'ready',null,'','']),/berwenang/);
});
test('Status sequence, estimates and cancellation reasons are backend validated',async()=>{
  const order=(await asUser(ids.admin,'select * from public.orders'))[0];
  await assert.rejects(()=>rpc(ids.admin,'update_order',[order.id,'ready',null,'','']),/Urutan/);
  await rpc(ids.admin,'update_order',[order.id,'preparing','2026-10-10T09:30:00Z','Antrean ramai','']);
  await rpc(ids.admin,'update_order',[order.id,'ready','2026-10-10T09:30:00Z','','']);
  await rpc(ids.admin,'update_order',[order.id,'completed',null,'Sudah diserahkan','']);
  const buyer=(await asUser(ids.buyer,'select * from public.orders'))[0];assert.equal(buyer.status,'completed');
  assert.equal((await asUser(ids.buyer,'select * from public.order_status_history')).length,4);
  await assert.rejects(()=>rpc(ids.admin,'update_order',[order.id,'waiting',null,'','']),/berakhir/);
});
test('Cancellation restores waiting stock once, never restores already prepared food',async()=>{
  const [order]=await checkout();const before=await stock(ids.variant);
  await assert.rejects(()=>rpc(ids.admin,'update_order',[order.id,'cancelled',null,'','']),/Alasan/);
  await rpc(ids.admin,'update_order',[order.id,'cancelled',null,'','Stok ternyata tidak sesuai']);assert.equal(await stock(ids.variant),before+1);
  await assert.rejects(()=>rpc(ids.admin,'update_order',[order.id,'cancelled',null,'','Ulang']),/berakhir/);assert.equal(await stock(ids.variant),before+1);
  const [prepared]=await checkout();await rpc(ids.admin,'update_order',[prepared.id,'preparing',null,'','']);const preparedStock=await stock(ids.variant);
  await rpc(ids.admin,'update_order',[prepared.id,'cancelled',null,'','Tidak dapat dipenuhi']);assert.equal(await stock(ids.variant),preparedStock);
});
test('Multiple canteens: failure rolls back the whole checkout; successful orders keep independent statuses',async()=>{
  const k=await rpc(ids.adminOther,'save_kantin',[null,'Kantin Kedua','Samping taman','06:30','17:00',false,false]);
  const menu=await rpc(ids.adminOther,'save_menu',[null,k.id,'Susu Murni','Minuman','drink',true,true,'']);
  const variant=await rpc(ids.adminOther,'save_variant',[null,menu.id,'Original',8000,5,true,true]);
  const payload=JSON.stringify([{variant_id:ids.variant,quantity:1,price_mode:'regular'},{variant_id:variant.id,quantity:1,price_mode:'regular'}]);
  const initial=await stock(ids.variant);const requestCount=(await db.query('select count(*)::int n from public.checkout_requests')).rows[0].n;
  await assert.rejects(()=>checkout(ids.other,payload),/tutup/);assert.equal(await stock(ids.variant),initial);assert.equal(await stock(variant.id),5);
  assert.equal((await db.query('select count(*)::int n from public.checkout_requests')).rows[0].n,requestCount);
  await rpc(ids.adminOther,'save_kantin',[k.id,k.name,k.pickup_location,'06:30','17:00',true,false]);
  const orders=await checkout(ids.other,payload);assert.equal(orders.length,2);
  const first=orders.find(o=>o.kantin_id===ids.kantin),second=orders.find(o=>o.kantin_id===k.id);
  await rpc(ids.admin,'update_order',[first.id,'preparing',null,'','']);await rpc(ids.admin,'update_order',[first.id,'ready',null,'','']);
  assert.equal((await asUser(ids.other,'select status from public.orders where id=$1',[second.id]))[0].status,'waiting');
  await assert.rejects(()=>rpc(ids.admin,'save_variant',[variant.id,menu.id,'Original',1,10,true,true]),/kewenangan/);
});
test('Last stock race commits only the available quantity (local serialized PostgreSQL transactions)',async()=>{
  await rpc(ids.admin,'save_variant',[ids.variant,ids.menu,'Standar',12000,1,true,true]);
  const result=await Promise.allSettled([checkout(ids.buyer),checkout(ids.other)]);
  assert.equal(result.filter(r=>r.status==='fulfilled').length,1);assert.equal(await stock(ids.variant),0);
  await rpc(ids.admin,'save_variant',[ids.variant,ids.menu,'Standar',12000,20,true,true]);
});
test('Variant-specific prices, immutable order snapshots, and no checkout of unverified variants',async()=>{
  const v=await rpc(ids.admin,'save_variant',[null,ids.menu,'Tambah bakso',15000,5,true,true]);
  const [order]=await checkout(ids.buyer,items(v.id));assert.equal(order.total,15000);
  await rpc(ids.admin,'save_variant',[v.id,ids.menu,'Nama baru',17000,4,true,true]);
  const item=(await asUser(ids.buyer,'select * from public.order_items where order_id=$1',[order.id]))[0];assert.equal(item.variant_name,'Tambah bakso');assert.equal(item.unit_price,15000);
  await rpc(ids.admin,'save_variant',[v.id,ids.menu,'Nama baru',null,4,true,false]);await assert.rejects(()=>checkout(ids.buyer,items(v.id)),/belum dikonfirmasi/);
});
test('Promo quotas share real inventory, cannot exceed stock, validate period/price and expire at 17:00 WIB',async()=>{
  await assert.rejects(()=>rpc(ids.admin,'save_promo',[ids.variant,12000,5,5,'15:00','17:00',true]),/lebih rendah/);
  await assert.rejects(()=>rpc(ids.admin,'save_promo',[ids.variant,9000,5,5,'14:00','17:00',true]),/check constraint/);
  await rpc(ids.admin,'save_variant',[ids.variant,ids.menu,'Standar',12000,3,true,true]);
  const promo=await rpc(ids.admin,'save_promo',[ids.variant,9000,5,5,'15:00','17:00',true]);
  const [order]=await checkout(ids.buyer,items(ids.variant,2,'promo'));assert.equal(order.total,18000);assert.equal(await stock(ids.variant),1);
  assert.equal((await db.query('select remaining_stock from public.promos where id=$1',[promo.id])).rows[0].remaining_stock,3);
  await assert.rejects(()=>checkout(ids.other,items(ids.variant,2,'promo')),/Stok/);
  await rpc(ids.admin,'update_order',[order.id,'cancelled',null,'','Belum diproses']);assert.equal(await stock(ids.variant),3);
  assert.equal((await db.query('select remaining_stock from public.promos where id=$1',[promo.id])).rows[0].remaining_stock,5);
  await db.exec(`create or replace function private.business_time() returns timestamptz language sql volatile set search_path='' as $$select '2026-10-10T10:00:00Z'::timestamptz$$;`);
  await rpc(ids.admin,'save_kantin',[ids.kantin,'Kantin Utama','Pintu depan','06:30','18:00',true,false]);
  await assert.rejects(()=>checkout(ids.other,items(ids.variant,1,'promo')),/berakhir/);
  assert.equal((await checkout(ids.other,items(ids.variant)))[0].total,12000);
});
