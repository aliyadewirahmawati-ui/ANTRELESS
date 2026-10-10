export const statusLabels = {waiting:'Menunggu konfirmasi',preparing:'Sedang diproses',ready:'Siap diambil',completed:'Selesai',cancelled:'Dibatalkan'};
export const statusActions = {waiting:['preparing','Terima / Proses'],preparing:['ready','Siap diambil'],ready:['completed','Selesai']};
export const collator = new Intl.Collator('id', {sensitivity:'base',numeric:true});
export const rupiah = value => value == null ? 'Perlu konfirmasi' : 'Rp'+Number(value).toLocaleString('id-ID');
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const jakartaDay = (date=new Date()) => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export function jakartaTime(date=new Date()) {
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date);
  const part=type=>Number(parts.find(p=>p.type===type).value);
  return part('hour')*3600+part('minute')*60+part('second');
}
export const timeSeconds = text => {const [h,m,s=0]=String(text).split(':').map(Number);return h*3600+m*60+s;};
export function isOpen(kantin,date=new Date()) {const seconds=jakartaTime(date);return kantin?.accepting_orders && seconds>=timeSeconds(kantin.opens_at)&&seconds<timeSeconds(kantin.closes_at);}
export function promoAvailable(promo,variant,date=new Date()) {
  if(!promo?.active||!variant?.active||!variant.price_verified||promo.price>=variant.price)return false;
  const seconds=jakartaTime(date);
  const remaining=promo.stock_date===jakartaDay(date)?promo.remaining_stock:promo.daily_quota;
  return seconds>=timeSeconds(promo.starts_at)&&seconds<timeSeconds(promo.ends_at)&&seconds>=54000&&seconds<61200&&remaining>0&&variant.stock>0;
}
export function variantProblem(menu,variant,kantin,{promo,mode='regular',date=new Date(),quantity=1}={}) {
  if(!menu||!variant||!kantin)return 'Menu tidak tersedia lagi.';
  if(kantin.is_demo)return 'Kantin Demo belum menerima transaksi nyata.';
  if(!menu.is_verified||!variant.price_verified||variant.price==null)return 'Perlu konfirmasi oleh admin.';
  if(!menu.active||!variant.active)return 'Menu sedang tidak tersedia.';
  if(!isOpen(kantin,date))return 'Kantin tutup atau sedang menjeda pesanan baru.';
  if(variant.stock<quantity)return 'Stok tidak mencukupi.';
  if(mode==='promo'&&!promoAvailable(promo,variant,date))return 'Promo belum aktif, sudah berakhir, atau habis.';
  if(mode==='promo'&&quantity>(promo.stock_date===jakartaDay(date)?promo.remaining_stock:promo.daily_quota))return 'Stok promo tidak mencukupi.';
  return '';
}
export function normalizeCart(value) {
  if(!Array.isArray(value))return [];
  return value.filter(item=>item&&typeof item.variant_id==='string'&&/^[0-9a-f-]{36}$/i.test(item.variant_id)&&Number.isSafeInteger(item.quantity)&&item.quantity>0&&item.quantity<=99&&['regular','promo'].includes(item.price_mode)).map(item=>({variant_id:item.variant_id,quantity:item.quantity,price_mode:item.price_mode,customer_note:typeof item.customer_note==='string'?item.customer_note.trim().slice(0,300):''}));
}
export function cartPayload(cart,getPrice) {return normalizeCart(cart).map(item=>({...item,...(getPrice?{expected_unit_price:getPrice(item)}:{})}));}
export function reconcileCart(cart,variants) {
  const ids=new Set(variants.map(v=>v.id));
  return {cart:normalizeCart(cart).filter(item=>ids.has(item.variant_id)),removed:cart.some(item=>!ids.has(item.variant_id))};
}
export function filteredMenus(menus,kantin,{search='',category='all',kantinId='all'}={}) {
  const query=search.trim().toLocaleLowerCase('id-ID');
  return menus.filter(menu=>(category==='all'||menu.category===category)&&(kantinId==='all'||menu.kantin_id===kantinId)&&[menu.name,menu.category,kantin.find(k=>k.id===menu.kantin_id)?.name].join(' ').toLocaleLowerCase('id-ID').includes(query)).sort((a,b)=>collator.compare(a.name,b.name));
}
