import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedMenus,seedVariants,seedKantin} from '../src/catalog.seed.js';
import {filteredMenus,escapeHTML,promoAvailable,variantProblem,normalizeCart,cartPayload,jakartaTime,jakartaDay} from '../src/domain.js';
test('Reference seed: general canteen, unverified prices, no invented stock or final starting prices',()=>{
  assert.equal(seedMenus.length,45);assert.equal(seedVariants.length,58);
  assert.equal(seedKantin[0].name,'Kantin Demo');assert.equal(seedKantin[0].accepting_orders,false);
  assert.ok(seedMenus.every(m=>!m.active&&!m.is_verified));assert.ok(seedVariants.every(v=>!v.active&&!v.price_verified&&v.stock===0));
  for(const name of ['Aneka Seblak','Aneka Sajian Prasmanan']){const menu=seedMenus.find(m=>m.name===name);assert.equal(seedVariants.find(v=>v.menu_id===menu.id).price,null);}
  assert.equal(JSON.stringify(seedMenus).includes('FPMIPA'),false);
});
test('Category/name/canteen search and alphabetical order',()=>{
  const all=filteredMenus(seedMenus,seedKantin);assert.equal(all.length,45);assert.equal(filteredMenus(seedMenus,seedKantin,{search:'Kantin Demo'}).length,45);
  assert.equal(filteredMenus(seedMenus,seedKantin,{category:'Mie'}).length,7);
  assert.ok(filteredMenus(seedMenus,seedKantin,{search:'susu'}).every(m=>m.name==='Susu Murni'));
});
test('Variant-specific milk price and options remain separate',()=>{const milk=seedMenus.find(m=>m.name==='Susu Murni');const variants=seedVariants.filter(v=>v.menu_id===milk.id);assert.equal(variants.length,8);assert.equal(variants.find(v=>v.name==='Original').price,8000);assert.equal(variants.find(v=>v.name==='Melon').price,10000);});
test('No local preview checkout; WIB promo boundaries independent of client timezone',()=>{
  const date=new Date('2026-10-10T08:00:00Z'),v={active:true,price_verified:true,price:12000,stock:5};
  const p={active:true,price:9000,daily_quota:3,remaining_stock:3,stock_date:jakartaDay(date),starts_at:'15:00:00',ends_at:'17:00:00'};
  assert.equal(jakartaTime(date),54000);assert.equal(promoAvailable(p,v,date),true);assert.equal(promoAvailable(p,v,new Date('2026-10-10T10:00:00Z')),false);
  assert.match(variantProblem({active:true,is_verified:true},v,{...seedKantin[0],accepting_orders:true},{date}),/Demo/);
});
test('Draft validation does not import legacy services, malformed quantities or client prices',()=>{
  const draft=[{variant_id:seedVariants[0].id,quantity:2,price_mode:'regular',price:1},{menuId:'print-dokumen',quantity:1},{variant_id:seedVariants[0].id,quantity:-1,price_mode:'regular'}];
  const normalized=normalizeCart(draft);assert.equal(normalized.length,1);assert.deepEqual(cartPayload(normalized),[{variant_id:seedVariants[0].id,quantity:2,price_mode:'regular',customer_note:''}]);
});
test('User-controlled names and notes are escaped before rendering',()=>{assert.equal(escapeHTML('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');});
