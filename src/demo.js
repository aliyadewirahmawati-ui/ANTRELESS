import {seedKantin,seedMenus,seedVariants} from './catalog.seed.js';
import {jakartaDay,variantProblem,statusActions} from './domain.js';

// Local presentation data. This adapter is never a substitute for server authorization.
const KEY='antreless-local-demo-v2',SESSION='antreless-local-session-v2';
export const demoAccounts={admin:{email:'aliyadewirahmawati@gmail.com',password:'admin'},buyer:{email:'pembeli@antreless.demo',password:'demo12345'}};
const uuid=()=>crypto.randomUUID(),copy=value=>structuredClone(value);
async function digest(password,salt){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+password));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
async function account(email,password,name,role){const salt=uuid();return {id:uuid(),email,display_name:name,role,salt,password_hash:await digest(password,salt)};}
const read=()=>{const data=JSON.parse(localStorage.getItem(KEY));if(!data)throw Error('Data demo belum siap. Muat ulang halaman.');return data;};
const write=data=>localStorage.setItem(KEY,JSON.stringify(data));
let ready;
async function initialize(){
  if(localStorage.getItem(KEY))return;
  const profiles=await Promise.all([account(demoAccounts.admin.email,demoAccounts.admin.password,'Admin Antreless','admin'),account(demoAccounts.buyer.email,demoAccounts.buyer.password,'Pembeli Demo','buyer')]);
  const kantin=copy(seedKantin).map(k=>({...k,name:'Kantin Contoh',pickup_location:'Meja pengambilan kantin (contoh)',accepting_orders:true,is_demo:false}));
  const menu=copy(seedMenus).map(m=>({...m,active:true,is_verified:true,confirmation_note:'Data contoh untuk demonstrasi; belum diverifikasi oleh mitra.'}));
  const menu_variants=copy(seedVariants).map(v=>({...v,name:v.price===null?'Standar (contoh)':v.name,price:v.price??(menu.find(m=>m.id===v.menu_id).kind==='drink'?10000:15000),stock:20,active:true,price_verified:true}));
  const promos=menu_variants.filter(v=>[12000,15000,10000].includes(v.price)).slice(0,3).map(v=>({id:uuid(),variant_id:v.id,price:Math.round(v.price*.8/500)*500,daily_quota:5,remaining_stock:5,stock_date:jakartaDay(),active:true,starts_at:'15:00:00',ends_at:'17:00:00'}));
  // A second tab may have completed initialization while hashes were generated.
  if(!localStorage.getItem(KEY))write({profiles,kantin,menu,menu_variants,promos,orders:[],kantin_admins:[{user_id:profiles[0].id,kantin_id:kantin[0].id}],requests:{},counters:{}});
}
const locked=callback=>navigator.locks?navigator.locks.request(KEY,callback):Promise.reject(Error('Browser ini belum mendukung penguncian data demo. Gunakan Chrome atau Edge terbaru.'));
export function createDemoClient(){
  ready=locked(initialize);
  const listeners=new Set(),channels=new Set();
  const session=()=>{const id=localStorage.getItem(SESSION),user=read().profiles.find(p=>p.id===id);return user?{user:{id:user.id,email:user.email}}:null;};
  const actor=data=>data.profiles.find(p=>p.id===localStorage.getItem(SESSION));
  const notify=()=>channels.forEach(c=>c.callback?.());
  window.addEventListener('storage',event=>{if(event.key===KEY)notify();if(event.key===SESSION)listeners.forEach(cb=>cb(session()?'SIGNED_IN':'SIGNED_OUT',session()));});
  async function result(callback){try{await ready;return {data:await callback(),error:null};}catch(error){return {data:null,error:{message:error.message}};}}
  function requireAdmin(data,kantinId){const user=actor(data);if(user?.role!=='admin'||kantinId&&!data.kantin_admins.some(m=>m.user_id===user.id&&m.kantin_id===kantinId))throw Error('Akses admin diperlukan.');return user;}
  function mutation(name,p,data){
    const user=actor(data),now=new Date().toISOString();
    if(name==='checkout_with_details'){
      if(user?.role!=='buyer')throw Error('Masuk sebagai pembeli untuk memesan.');
      if(p.p_options?.terms_version!=='2026-10-11'||!['demo','on_pickup'].includes(p.p_options.payment_method))throw Error('Setujui panduan dan pilih metode pembayaran.');
      if(!Array.isArray(p.p_items)||!p.p_items.length||p.p_items.length>100)throw Error('Tas tidak valid.');
      const signature=JSON.stringify({items:p.p_items,options:p.p_options});const old=data.requests[p.p_key];
      if(old){if(old.user!==user.id||old.signature!==signature)throw Error('Permintaan berubah. Perbarui tas terlebih dahulu.');return old.orders.map(id=>data.orders.find(o=>o.id===id));}
      const grouped=new Map(),physical=new Map(),promoQty=new Map(),quantities=new Map();
      p.p_items.forEach(item=>{
        if(!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>99||!['regular','promo'].includes(item.price_mode)||typeof item.customer_note!=='string'||item.customer_note.length>300)throw Error('Jumlah atau catatan tidak valid.');
        const v=data.menu_variants.find(v=>v.id===item.variant_id),m=data.menu.find(m=>m.id===v?.menu_id),k=data.kantin.find(k=>k.id===m?.kantin_id),promo=data.promos.find(pr=>pr.variant_id===v?.id);
        const problem=variantProblem(m,v,k,{mode:item.price_mode,promo,quantity:item.quantity});if(problem)throw Error(problem);
        const price=item.price_mode==='promo'?promo.price:v.price;if(price!==item.expected_unit_price)throw Error('Harga berubah. Buka ulang ringkasan pesanan.');
        physical.set(v.id,(physical.get(v.id)||0)+item.quantity);const merge=v.id+':'+item.price_mode;quantities.set(merge,(quantities.get(merge)||0)+item.quantity);if(quantities.get(merge)>99)throw Error('Maksimal 99 per pilihan.');
        if(item.price_mode==='promo')promoQty.set(v.id,(promoQty.get(v.id)||0)+item.quantity);
        if(!grouped.has(k.id))grouped.set(k.id,{kantin:k,items:new Map()});const items=grouped.get(k.id).items;
        if(!items.has(merge))items.set(merge,{id:uuid(),variant_id:v.id,menu_name:m.name,variant_name:v.name,price_mode:item.price_mode,unit_price:price,quantity:0,customer_requests:[]});
        const line=items.get(merge);line.quantity+=item.quantity;if(item.customer_note.trim())line.customer_requests.push({quantity:item.quantity,note:item.customer_note.trim()});
      });
      physical.forEach((quantity,id)=>{if(quantity>data.menu_variants.find(v=>v.id===id).stock)throw Error('Stok tidak mencukupi.');});
      promoQty.forEach((quantity,id)=>{const pr=data.promos.find(pr=>pr.variant_id===id);if(quantity>(pr.stock_date===jakartaDay()?pr.remaining_stock:pr.daily_quota))throw Error('Stok promo habis.');});
      physical.forEach((quantity,id)=>{data.menu_variants.find(v=>v.id===id).stock-=quantity;});promoQty.forEach((quantity,id)=>{const pr=data.promos.find(pr=>pr.variant_id===id);pr.remaining_stock=(pr.stock_date===jakartaDay()?pr.remaining_stock:pr.daily_quota)-quantity;pr.stock_date=jakartaDay();});
      const orders=[...grouped.values()].map(({kantin:k,items})=>{const counter=k.id+':'+jakartaDay();data.counters[counter]=(data.counters[counter]||0)+1;const order={id:uuid(),kantin_id:k.id,kantin_name:k.name,pickup_location:k.pickup_location,buyer_id:user.id,buyer_name:user.display_name,queue_day:jakartaDay(),queue_number:data.counters[counter],created_at:now,updated_at:now,status:'waiting',total:[...items.values()].reduce((n,i)=>n+i.unit_price*i.quantity,0),admin_note:'',estimated_ready_at:null,cancellation_reason:'',payment_method:p.p_options.payment_method,payment_status:p.p_options.payment_method==='demo'?'demo_confirmed':'unpaid',terms_version:p.p_options.terms_version,terms_accepted_at:now,order_items:[...items.values()],order_status_history:[{status:'waiting',changed_at:now,note:'Pesanan demo dibuat'}]};data.orders.push(order);return order;});
      data.requests[p.p_key]={user:user.id,signature,orders:orders.map(o=>o.id)};return orders;
    }
    if(name==='update_order'){
      const o=data.orders.find(o=>o.id===p.p_order_id);if(!o)throw Error('Pesanan tidak ditemukan.');requireAdmin(data,o.kantin_id);
      if(['completed','cancelled'].includes(o.status)||!(p.p_status===o.status||p.p_status===statusActions[o.status]?.[0]||p.p_status==='cancelled'))throw Error('Perubahan status tidak diizinkan.');
      if(p.p_status==='cancelled'&&!p.p_reason?.trim())throw Error('Isi alasan pembatalan.');
      if(p.p_status==='cancelled'){if(o.status==='waiting')o.order_items.forEach(i=>{const v=data.menu_variants.find(v=>v.id===i.variant_id);if(v)v.stock+=i.quantity;const pr=data.promos.find(pr=>pr.variant_id===i.variant_id);if(i.price_mode==='promo'&&pr&&pr.stock_date===o.queue_day)pr.remaining_stock+=i.quantity;});o.cancellation_reason=p.p_reason.trim();}
      if(p.p_status!==o.status)o.order_status_history.push({status:p.p_status,changed_at:now,note:p.p_status==='cancelled'?p.p_reason:p.p_note});o.status=p.p_status;o.admin_note=p.p_note||'';o.estimated_ready_at=p.p_eta;o.updated_at=now;return o;
    }
    if(name==='save_kantin'){
      requireAdmin(data,p.p_id);if(!p.p_name?.trim()||!p.p_location?.trim()||p.p_opens>=p.p_closes)throw Error('Isi nama, lokasi, dan jam buka yang valid.');
      const row={id:p.p_id||uuid(),name:p.p_name.trim(),pickup_location:p.p_location.trim(),opens_at:p.p_opens,closes_at:p.p_closes,accepting_orders:p.p_accept,is_demo:p.p_demo};const existing=data.kantin.find(k=>k.id===row.id);if(existing)Object.assign(existing,row);else{data.kantin.push(row);data.kantin_admins.push({user_id:user.id,kantin_id:row.id});}return row;
    }
    if(name==='save_menu'){
      requireAdmin(data,p.p_kantin);const old=data.menu.find(m=>m.id===p.p_id);if(old)requireAdmin(data,old.kantin_id);if(!p.p_name?.trim()||!p.p_category?.trim()||!['food','drink'].includes(p.p_kind))throw Error('Isi menu dengan benar.');const row={id:p.p_id||uuid(),kantin_id:p.p_kantin,name:p.p_name.trim(),category:p.p_category.trim(),kind:p.p_kind,active:p.p_active,is_verified:p.p_verified,confirmation_note:p.p_note};if(old)Object.assign(old,row);else data.menu.push(row);return row;
    }
    if(name==='save_variant'){
      const menu=data.menu.find(m=>m.id===p.p_menu);if(!menu)throw Error('Menu tidak ditemukan.');requireAdmin(data,menu.kantin_id);const old=data.menu_variants.find(v=>v.id===p.p_id);if(old)requireAdmin(data,data.menu.find(m=>m.id===old.menu_id).kantin_id);if(!p.p_name?.trim()||!Number.isInteger(p.p_stock)||p.p_stock<0||p.p_price!==null&&(!Number.isInteger(p.p_price)||p.p_price<1))throw Error('Harga dan stok tidak valid.');const row={id:p.p_id||uuid(),menu_id:p.p_menu,name:p.p_name.trim(),price:p.p_price,stock:p.p_stock,active:p.p_active,price_verified:p.p_verified};if(old)Object.assign(old,row);else data.menu_variants.push(row);return row;
    }
    if(name==='save_promo'){
      const v=data.menu_variants.find(v=>v.id===p.p_variant),m=data.menu.find(m=>m.id===v?.menu_id);if(!m)throw Error('Pilihan tidak ditemukan.');requireAdmin(data,m.kantin_id);if(!Number.isInteger(p.p_price)||p.p_price<1||p.p_price>=v.price||!Number.isInteger(p.p_quota)||!Number.isInteger(p.p_remaining)||p.p_remaining<0||p.p_remaining>p.p_quota||p.p_starts<'15:00'||p.p_ends>'17:00'||p.p_starts>=p.p_ends||p.p_active&&(!m.active||!v.active||v.stock<1||p.p_remaining<1))throw Error('Periksa harga, stok promo, dan waktu 15.00–17.00.');let pr=data.promos.find(pr=>pr.variant_id===v.id);const row={id:pr?.id||uuid(),variant_id:v.id,price:p.p_price,daily_quota:p.p_quota,remaining_stock:p.p_remaining,stock_date:jakartaDay(),starts_at:p.p_starts,ends_at:p.p_ends,active:p.p_active};if(pr)Object.assign(pr,row);else data.promos.push(row);return row;
    }
    throw Error('Fitur demo tidak dikenal.');
  }
  return {
    auth:{
      onAuthStateChange(cb){listeners.add(cb);return {data:{subscription:{unsubscribe:()=>listeners.delete(cb)}}};},
      getSession:()=>result(()=>({session:session()})),getUser:()=>result(()=>({user:session()?.user||null})),
      signInWithPassword:({email,password})=>result(async()=>{const user=read().profiles.find(p=>p.email===email.trim().toLowerCase());if(!user||await digest(password,user.salt)!==user.password_hash)throw Error('Invalid login credentials');localStorage.setItem(SESSION,user.id);return {session:session(),user:session().user};}),
      signUp:({email,password,options})=>result(()=>locked(async()=>{const normalized=email.trim().toLowerCase(),data=read();if(data.profiles.some(p=>p.email===normalized))throw Error('Email ini sudah digunakan.');if(password.length<8||!options?.data?.display_name?.trim())throw Error('Isi nama dan kata sandi minimal 8 karakter.');const user=await account(normalized,password,options.data.display_name.trim(),'buyer');data.profiles.push(user);write(data);localStorage.setItem(SESSION,user.id);return {session:session(),user:session().user};})),
      signOut:()=>result(()=>{localStorage.removeItem(SESSION);return {}; }),
      resetPasswordForEmail:()=>result(()=>{throw Error('Mode demo tidak mengirim email pemulihan. Gunakan akun contoh atau buat akun lokal baru.');}),
      updateUser:()=>result(()=>{throw Error('Pemulihan kata sandi belum tersedia dalam mode demo.');})
    },
    from(table){const filters=[];let single=false,sort=null;const query={select(){return this;},eq(k,v){filters.push([k,v]);return this;},single(){single=true;return this;},order(k,options){sort=[k,options?.ascending!==false];return this;},then(resolve,reject){return result(()=>{const data=read(),user=actor(data);let rows=copy(data[table]||[]);if(table==='profiles')rows=rows.filter(p=>p.id===user?.id).map(({salt,password_hash,...p})=>p);if(table==='kantin_admins')rows=rows.filter(m=>m.user_id===user?.id&&user?.role==='admin');if(table==='orders')rows=rows.filter(o=>user?.role==='admin'?data.kantin_admins.some(m=>m.user_id===user.id&&m.kantin_id===o.kantin_id):o.buyer_id===user?.id);rows=rows.filter(r=>filters.every(([k,v])=>r[k]===v));if(sort)rows.sort((a,b)=>String(a[sort[0]]).localeCompare(String(b[sort[0]]))*(sort[1]?1:-1));return single?rows[0]||null:rows;}).then(resolve,reject);}};return query;},
    rpc:(name,p)=>result(()=>locked(()=>{const data=read(),value=mutation(name,p,data);write(data);notify();return copy(value);})),
    channel(){const c={callback:null,on(_type,_filter,cb){this.callback=cb;return this;},subscribe(cb){channels.add(this);queueMicrotask(()=>cb('LOCAL'));return this;}};return c;},removeChannel:async c=>{channels.delete(c);}
  };
}
