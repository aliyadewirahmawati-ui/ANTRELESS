import {supabase,configured} from './supabase.js';
import {seedKantin,seedMenus,seedVariants} from './catalog.seed.js';
import {statusLabels,statusActions,collator,rupiah,escapeHTML as e,jakartaDay,jakartaTime,timeSeconds,isOpen,promoAvailable,variantProblem,normalizeCart,cartPayload,reconcileCart,filteredMenus} from './domain.js';

const $=id=>document.getElementById(id);
const state={session:null,profile:null,memberships:[],kantin:[],menus:[],variants:[],promos:[],orders:[],cart:[],cartError:'',category:'all',kantinId:'all',promoOnly:false,adminKantin:'',buyerFilter:'all',adminFilter:'all',connected:false,channel:null,epoch:0,refreshing:false,refreshAgain:false,checkoutBusy:false,authBusy:false,mode:'login',orderDrafts:new Map()};
let toastTimer,refreshTimer,clockTimer,pendingKey=null,channelStatus='';
const admin=()=>!!state.session && state.profile?.role==='admin';
const managedKantin=()=>state.kantin.filter(k=>state.memberships.some(m=>m.kantin_id===k.id));
const variantMenu=v=>state.menus.find(m=>m.id===v?.menu_id);
const menuKantin=m=>state.kantin.find(k=>k.id===m?.kantin_id);
const menuVariants=id=>state.variants.filter(v=>v.menu_id===id).sort((a,b)=>collator.compare(a.name,b.name));
const variantPromo=id=>state.promos.find(p=>p.variant_id===id);
const dateLabel=value=>value?new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',dateStyle:'medium',timeStyle:'short'}).format(new Date(value))+' WIB':'Belum diisi';
function wibInput(value){if(!value)return '';const date=new Date(new Date(value).getTime()+7*3600000);return date.toISOString().slice(0,16);}
function storageGet(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function storageSet(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{showToast('Draft tas tidak dapat disimpan di perangkat ini.');}}
const draftKey=()=>`antreless-online-draft-v1:${state.session?.user.id||'guest'}`;
function saveDraft(){storageSet(draftKey(),{cart:state.cart,pendingKey});}
function loadDraft(){const draft=storageGet(draftKey(),{});state.cart=normalizeCart(draft.cart);pendingKey=typeof draft.pendingKey==='string'?draft.pendingKey:null;}
function changedCart(){pendingKey=null;state.cartError='';saveDraft();renderCart();}
function showToast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),5000);}
function setError(id,message){$(id).textContent=message;$(id).hidden=!message;}
function humanError(error){const message=error?.message||'Koneksi gagal. Coba lagi setelah jaringan tersambung.';const messages={'Invalid login credentials':'Email atau kata sandi tidak sesuai.','Email not confirmed':'Konfirmasi email terlebih dahulu.','Failed to fetch':'Koneksi ke server gagal. Periksa jaringan dan konfigurasi Supabase.'};return messages[message]||message;}
function closeDialogs(){document.querySelectorAll('dialog[open]').forEach(d=>d.close());}
function resetFilters(){state.category='all';state.kantinId='all';state.promoOnly=false;$('searchInput').value='';renderMenu();}
function setMode(mode){state.mode=mode;$('nameField').hidden=mode!=='register';$('authName').required=mode==='register';$('confirmField').hidden=mode==='login';$('authConfirm').required=mode!=='login';$('authPassword').autocomplete=mode==='login'?'current-password':'new-password';$('authPassword').minLength=mode==='login'?1:8;$('authTitle').textContent=mode==='register'?'Buat akun pembeli':mode==='recovery'?'Kata sandi baru':'Selamat datang!';$('authSubmit').textContent=mode==='register'?'Buat akun':mode==='recovery'?'Simpan kata sandi':'Masuk';$('loginSwitch').innerHTML=mode==='login'?'Baru di Antreless? <button type="button" data-action="register">Buat akun</button>':'Sudah punya akun? <button type="button" data-action="login">Masuk</button>';$('authError').textContent='';}
function route(){const recovery=state.mode==='recovery';$('loginScreen').hidden=!!state.session&&!recovery;$('appShell').hidden=!state.session||admin()||recovery;$('adminShell').hidden=!admin()||recovery;$('accountName').textContent=state.profile?.display_name||'Pengunjung';$('accountButton').textContent=state.session?'Keluar':'Masuk';$('adminAccount').textContent=state.profile?.display_name||'Admin';}
function browse(){$('loginScreen').hidden=true;$('adminShell').hidden=true;$('appShell').hidden=false;renderAll();window.scrollTo({top:0,behavior:'instant'});}
async function api(result){const {data,error}=await result;if(error)throw error;return data;}

async function refresh(){
  if(!configured)return;
  if(state.refreshing){state.refreshAgain=true;return;}
  state.refreshing=true;const epoch=state.epoch,wasConnected=state.connected,previousOrders=state.orders;
  try{
    const userId=state.session?.user.id;
    const results=await Promise.all([
      api(supabase.from('kantin').select('*')),api(supabase.from('menu').select('*')),api(supabase.from('menu_variants').select('*')),api(supabase.from('promos').select('*')),
      userId?api(supabase.from('profiles').select('*').eq('id',userId).single()):Promise.resolve(null),
      userId?api(supabase.from('kantin_admins').select('*')):Promise.resolve([]),
      userId?api(supabase.from('orders').select('*,order_items(*),order_status_history(*)').order('created_at',{ascending:false})):Promise.resolve([])
    ]);
    if(epoch!==state.epoch)return;
    [state.kantin,state.menus,state.variants,state.promos,state.profile,state.memberships,state.orders]=results;
    state.connected=true;setError('buyerOrderError','');setError('adminError','');
    if(wasConnected){
      const previous=new Map(previousOrders.map(order=>[order.id,order.status]));
      const changed=state.orders.filter(order=>admin()?!previous.has(order.id):previous.has(order.id)&&previous.get(order.id)!==order.status);
      if(changed.length){const first=changed[0];showToast((admin()?'Pesanan baru ANT-'+String(first.queue_number).padStart(3,'0'):statusLabels[first.status])+' · '+first.kantin_name+(changed.length>1?' · '+changed.length+' pembaruan':''));}
    }
    $('catalogNotice').hidden=true;
    const reconciled=reconcileCart(state.cart,state.variants);
    if(reconciled.removed){state.cart=reconciled.cart;pendingKey=null;saveDraft();showToast('Menu yang sudah dihapus dikeluarkan dari tas. Riwayat pesanan tetap tersimpan.');}
    if(admin()){
      const list=managedKantin();
      if(!list.some(k=>k.id===state.adminKantin)){state.adminKantin=list[0]?.id||'';$('kantinForm').dataset.dirty='';}
    }
    const needsRoute=state.session && ($('loginScreen').hidden===false||admin()!==!$('adminShell').hidden);
    if(needsRoute)route();
    renderAll();
  }catch(error){
    if(epoch!==state.epoch)return;
    state.connected=false;
    const message=humanError(error)+' Pesanan baru belum dapat dikirim.';
    setError('buyerOrderError',message);setError('adminError',message);$('catalogNotice').textContent=message;$('catalogNotice').hidden=false;renderCart();syncLabel();
  }finally{
    state.refreshing=false;
    if(state.refreshAgain){state.refreshAgain=false;queueMicrotask(refresh);}
  }
}
function scheduleRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,200);}
async function cleanup(){clearTimeout(refreshTimer);channelStatus='';if(state.channel){const channel=state.channel;state.channel=null;await supabase.removeChannel(channel);}}
async function changeSession(session,event){
  if(session?.user.id===state.session?.user.id && event!=='SIGNED_OUT'){
    state.session=session;
    if(event==='PASSWORD_RECOVERY'){setMode('recovery');route();}else scheduleRefresh();return;
  }
  state.epoch++;const epoch=state.epoch;await cleanup();if(epoch!==state.epoch)return;
  state.session=session;state.profile=null;state.memberships=[];state.orders=[];state.cartError='';state.orderDrafts.clear();state.connected=false;state.buyerFilter='all';state.adminFilter='all';closeDialogs();$('lastOrderNotice').hidden=true;loadDraft();
  if(event==='PASSWORD_RECOVERY')setMode('recovery');else if(state.mode==='recovery')setMode('login');
  route();renderOrders();renderCart();
  await refresh();if(epoch!==state.epoch)return;route();
  const tables=['kantin','menu','menu_variants','promos','orders','order_items','order_status_history','kantin_admins','profiles'];
  let channel=supabase.channel('antreless:'+epoch);
  tables.forEach(table=>{channel=channel.on('postgres_changes',{event:'*',schema:'public',table},()=>{if(epoch===state.epoch)scheduleRefresh();});});
  state.channel=channel.subscribe(status=>{if(epoch===state.epoch){channelStatus=status;syncLabel();if(status==='SUBSCRIBED')scheduleRefresh();}});
}
function syncLabel(){const text=!configured?'Katalog referensi · Pemesanan online belum aktif':!state.session?'Masuk untuk melihat pesananmu.':!state.connected?'Koneksi terputus · Mencoba menyambung kembali':channelStatus==='SUBSCRIBED'?'Pesanan tersinkron otomatis':'Pembaruan otomatis setiap 15 detik';$('syncStatus').textContent=text;$('adminSyncStatus').textContent=text;}
function icon(kind){return `<svg viewBox="0 0 128 128" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${kind==='drink'?'<path d="m43 50 5 60h32l6-60ZM38 50h53M65 50l6-29h17"/><path d="M47 69h35"/>':'<path d="M20 62h88c-4 25-18 42-44 42S24 87 20 62ZM16 62h96M46 29c-8 10 8 13 0 23m20-23c-8 10 8 13 0 23m20-23c-8 10 8 13 0 23"/>'}</svg>`;}
function media(menu,cls='dish-photo'){return `<div class="category-placeholder ${cls}" role="img" aria-label="Ilustrasi kategori ${e(menu.category)}, bukan foto menu">${icon(menu.kind)}<span>ILUSTRASI ${menu.kind==='drink'?'MINUMAN':'MAKANAN'}</span></div>`;}
function menuCard(menu,{featured=false,popup=false}={}){
  const variants=menuVariants(menu.id),kantin=menuKantin(menu);
  const promoted=variants.filter(v=>variantPromo(v.id)?.active);
  const showPromo=featured||popup||state.promoOnly;
  const candidates=showPromo?promoted:variants;
  const available=candidates.find(v=>!variantProblem(menu,v,kantin,{mode:showPromo?'promo':'regular',promo:variantPromo(v.id)}));
  const known=candidates.filter(v=>v.price!=null);
  const amounts=known.map(v=>showPromo?variantPromo(v.id).price:v.price);
  const minimum=amounts.length?Math.min(...amounts):null;
  const problem=!configured?'Katalog referensi':!menu.is_verified?'Perlu konfirmasi':available?'':variantProblem(menu,candidates[0],kantin,{mode:showPromo?'promo':'regular',promo:variantPromo(candidates[0]?.id)});
  if(featured||popup){
    const promo=available?variantPromo(available.id):variantPromo(promoted[0]?.id);
    return `<article class="last-call-card ${popup?'last-call-popup-card':'last-call-featured-card'}"><div class="last-call-card-media">${media(menu,'last-call-food last-call-food-illustration')}${promo?'<span class="last-call-discount">LAST CALL</span>':''}</div><div class="last-call-card-body"><span class="dish-type">${e(kantin?.name)}</span><h3>${e(menu.name)}</h3><span class="promo-price"><strong>${rupiah(minimum)}</strong></span><p class="last-call-card-stock">${e(problem||'Promo tersedia')}</p><p class="last-call-pickup">${e(kantin?.pickup_location)}</p><button class="last-call-add" data-action="pick" data-id="${menu.id}" data-mode="promo" ${available&&configured?'':'disabled'}>Pilih promo</button></div></article>`;
  }
  return `<article class="dish" data-menu-id="${menu.id}"><div class="dish-media">${media(menu)}</div><div class="dish-body"><span class="dish-type">${e(menu.category)} · ${e(kantin?.name)}</span><h4>${e(menu.name)}</h4><p>${e(menu.is_verified?(variants.length>1?variants.length+' pilihan rasa / jenis':'Pilih, pesan, lalu ambil saat siap.'):'Perlu konfirmasi oleh admin.')}</p><span class="availability-badge ${problem?'unavailable':'available'}">${e(problem||'Tersedia')}</span><div class="dish-bottom"><span class="price">${amounts.length>1&&new Set(amounts).size>1?'Mulai ':''}${rupiah(minimum)}${!menu.is_verified&&minimum!=null?'<small>Harga referensi</small>':''}</span><button class="add" data-action="pick" data-id="${menu.id}" data-mode="${state.promoOnly?'promo':'regular'}" aria-label="Pilih ${e(menu.name)}" ${available&&configured?'':'disabled'}>+</button></div></div></article>`;
}
function renderMenu(){
  const categories=[...new Set(state.menus.map(m=>m.category))].sort(collator.compare);
  const buttons=['all',...categories].map(c=>`<button class="category ${state.category===c?'active':''}" data-action="category" data-id="${e(c)}" aria-pressed="${state.category===c}">${c==='all'?'Semua':e(c)}</button>`).join('');
  if($('categoryButtons').innerHTML!==buttons)$('categoryButtons').innerHTML=buttons;
  $('categoryRibbon').innerHTML=categories.slice(0,6).map(c=>`<span>${e(c)}</span>`).join('');
  let menus=filteredMenus(state.menus,state.kantin,{search:$('searchInput').value,category:state.category,kantinId:state.kantinId});
  if(state.promoOnly)menus=menus.filter(m=>menuVariants(m.id).some(v=>variantPromo(v.id)?.active));
  $('menuList').innerHTML=menus.length?menus.map(m=>menuCard(m)).join(''):'<div class="no-result">Belum ada menu yang sesuai. Coba kata kunci atau kategori lain.</div>';
  $('tenantTitle').textContent=state.kantinId==='all'?(state.promoOnly?'Hemat Ekstra':'Semua menu'):state.kantin.find(k=>k.id===state.kantinId)?.name||'Kantin';
  $('tenantSub').textContent=`${menus.length} menu · Urut A–Z`;
  $('clearSearch').hidden=!$('searchInput').value;
  $('resetFilter').hidden=state.category==='all'&&state.kantinId==='all'&&!state.promoOnly&&!$('searchInput').value;
  $('lastCallFilter').classList.toggle('active',state.promoOnly);$('lastCallFilter').setAttribute('aria-pressed',String(state.promoOnly));
  $('menuCount').textContent=state.menus.length;$('partnerCount').textContent=state.kantin.length;
}
function renderKantin(){
  $('kantinCards').innerHTML=state.kantin.slice().sort((a,b)=>collator.compare(a.name,b.name)).map(k=>`<article class="tenant"><div class="kantin-symbol" aria-hidden="true">♧</div><div class="tenant-copy"><span class="tenant-type">${k.is_demo?'DATA CONTOH':'MAKANAN & MINUMAN'}</span><h3>${e(k.name)}</h3><p>${e(k.pickup_location)}<br>${e(k.opens_at.slice(0,5))}–${e(k.closes_at.slice(0,5))} WIB · ${isOpen(k)&&!k.is_demo?'Menerima pesanan':'Belum menerima pesanan'}</p><button class="tenant-button" data-action="kantin" data-id="${k.id}">Lihat ${state.menus.filter(m=>m.kantin_id===k.id).length} menu <span>↗</span></button></div></article>`).join('')||'<p>Belum ada kantin.</p>';
}
function cartLine(item,index){
  const variant=state.variants.find(v=>v.id===item.variant_id),menu=variantMenu(variant),kantin=menuKantin(menu),promo=variantPromo(item.variant_id);
  const price=item.price_mode==='promo'?promo?.price:variant?.price;
  const totalQuantity=state.cart.filter(i=>i.variant_id===item.variant_id).reduce((n,i)=>n+i.quantity,0);
  const problem=variantProblem(menu,variant,kantin,{mode:item.price_mode,promo,quantity:totalQuantity});
  return {html:`<div class="cart-line"><div><strong>${e(menu?.name||'Menu dihapus')}</strong><small>${e(variant?.name)}${item.price_mode==='promo'?' · Last Call':''}</small><span>${rupiah(price)} / item</span>${problem?`<small class="cart-warning">${e(problem)}</small>`:''}</div><div class="cart-quantity"><button data-action="quantity" data-index="${index}" data-change="-1" aria-label="Kurangi ${e(menu?.name)}">−</button><span>${item.quantity}</span><button data-action="quantity" data-index="${index}" data-change="1" aria-label="Tambah ${e(menu?.name)}">+</button><button data-action="remove" data-index="${index}" aria-label="Hapus ${e(menu?.name)}">×</button></div></div>`,subtotal:Number(price||0)*item.quantity,problem,kantin};
}
function renderCart(){
  const groups=new Map();let total=0;const problems=[];
  state.cart.forEach((item,index)=>{const line=cartLine(item,index);total+=line.subtotal;if(line.problem)problems.push(line.problem);const id=line.kantin?.id||'unknown';if(!groups.has(id))groups.set(id,{name:line.kantin?.name||'Kantin',subtotal:0,html:[]});const group=groups.get(id);group.subtotal+=line.subtotal;group.html.push(line.html);});
  $('cartCount').textContent=state.cart.reduce((sum,i)=>sum+i.quantity,0);$('empty').hidden=!!state.cart.length;$('summary').classList.toggle('show',!!state.cart.length);
  $('items').innerHTML=[...groups.values()].map(g=>`<section class="cart-group"><h4>${e(g.name)}</h4>${g.html.join('')}<p class="cart-subtotal">Subtotal ${rupiah(g.subtotal)}</p></section>`).join('');
  $('total').textContent=rupiah(total);
  const message=!configured?'Pemesanan online belum aktif. Katalog ini hanya referensi.':!state.connected?'Koneksi ke database belum tersedia.':problems[0]||'';
  setError('cartWarning',message||state.cartError);
  $('checkoutButton').disabled=state.checkoutBusy||!configured||!state.connected||!!problems.length||!state.cart.length;
  $('checkoutButton').textContent=state.checkoutBusy?'Mengirim pesanan…':'Buat pesanan ↗';
}
function filterButtons(mode){const value=mode==='buyer'?state.buyerFilter:state.adminFilter;return ['all',...Object.keys(statusLabels)].map(s=>`<button class="category ${s===value?'active':''}" data-action="${mode}-filter" data-id="${s}" aria-pressed="${s===value}">${s==='all'?'Semua':statusLabels[s]}</button>`).join('');}
function orderCard(order,isAdmin){
  const queue='ANT-'+String(order.queue_number).padStart(3,'0');
  const message=order.status==='preparing'?'Pesananmu sedang disiapkan':order.status==='ready'?`Pesananmu siap diambil di ${order.kantin_name}`:statusLabels[order.status];
  const history=(order.order_status_history||[]).slice().sort((a,b)=>new Date(a.changed_at)-new Date(b.changed_at));
  const draft=state.orderDrafts.get(order.id)||{};
  const eta=draft.eta??wibInput(order.estimated_ready_at),note=draft.note??order.admin_note,reason=draft.reason||'';
  const actions=isAdmin&&!['completed','cancelled'].includes(order.status)?`<form class="order-admin-form" data-order-id="${order.id}"><label>Perkiraan siap (WIB)<input type="datetime-local" name="eta" value="${e(eta)}"></label><label>Catatan<input name="note" maxlength="500" value="${e(note)}"></label><label>Alasan pembatalan<input name="reason" maxlength="500" value="${e(reason)}" placeholder="Wajib jika membatalkan"></label><div class="order-admin-actions"><button type="submit" class="category" value="${order.status}">Simpan estimasi / catatan</button>${statusActions[order.status]?`<button type="submit" class="button primary" value="${statusActions[order.status][0]}">${statusActions[order.status][1]}</button>`:''}<button type="submit" class="category cancel-action" value="cancelled">Batalkan</button></div></form>`:'';
  return `<article class="history-card" data-order-id="${order.id}"><div class="history-card-head"><div><span class="eyebrow">${e(order.kantin_name)}</span><h3 class="receipt-number">${queue}</h3><p>${dateLabel(order.created_at)}<br>${e(order.pickup_location)}</p>${isAdmin?`<p class="receipt-buyer">Pembeli: <b>${e(order.buyer_name)}</b></p>`:''}</div><span class="status-chip status-${order.status}">${statusLabels[order.status]}</span></div><p class="order-message">${e(message)}</p><ul class="receipt-items">${(order.order_items||[]).map(i=>`<li><span>${e(i.menu_name)} <small>${e(i.variant_name)}${i.price_mode==='promo'?' · Last Call':''}</small></span><b>${i.quantity} × ${rupiah(i.unit_price)}</b></li>`).join('')}</ul><div class="history-total"><span>Total kantin</span><strong>${rupiah(order.total)}</strong></div>${order.estimated_ready_at?`<p class="order-estimate">Perkiraan siap: <strong>${dateLabel(order.estimated_ready_at)}</strong><br>Perkiraan dapat berubah saat kantin ramai.</p>`:''}${order.admin_note?`<p class="order-estimate">Catatan: ${e(order.admin_note)}</p>`:''}${order.status==='cancelled'?`<p class="cart-warning">Alasan: ${e(order.cancellation_reason)}</p>`:''}<details class="order-timeline"><summary>Riwayat status · ${dateLabel(order.updated_at)}</summary><ol>${history.map(h=>`<li><b>${statusLabels[h.status]}</b> · ${dateLabel(h.changed_at)}${h.note?`<br>${e(h.note)}`:''}</li>`).join('')}</ol></details>${actions}</article>`;
}
function renderOrders(){
  syncLabel();$('buyerFilters').innerHTML=filterButtons('buyer');$('adminFilters').innerHTML=filterButtons('admin');
  const buyerOrders=state.orders.filter(o=>o.buyer_id===state.session?.user.id&&(state.buyerFilter==='all'||o.status===state.buyerFilter));
  $('orderHistory').innerHTML=!state.session?'<p class="no-result">Masuk untuk melihat dan memantau pesananmu.</p>':buyerOrders.length?buyerOrders.map(o=>orderCard(o,false)).join(''):'<p class="no-result">Belum ada pesanan pada status ini.</p>';
  const managed=state.orders.filter(o=>o.kantin_id===state.adminKantin);
  const filtered=managed.filter(o=>state.adminFilter==='all'||o.status===state.adminFilter);
  if(!$('adminOrders').contains(document.activeElement))$('adminOrders').innerHTML=filtered.length?filtered.map(o=>orderCard(o,true)).join(''):'<p class="no-result">Belum ada pesanan pada status ini.</p>';
  $('adminOrderCount').textContent=filtered.length+' pesanan';
  $('adminStats').innerHTML=['waiting','preparing','ready','completed'].map(status=>`<article class="queue-stat"><span>${statusLabels[status]}</span><strong>${managed.filter(o=>o.status===status&&o.queue_day===jakartaDay()).length}</strong><small>Hari ini</small></article>`).join('');
}
function promoCards(popup=false){return state.menus.filter(m=>menuVariants(m.id).some(v=>{const p=variantPromo(v.id);return p?.active&&(!popup||!variantProblem(m,v,menuKantin(m),{mode:'promo',promo:p}));})).sort((a,b)=>collator.compare(a.name,b.name)).slice(0,3).map(m=>menuCard(m,{featured:true,popup})).join('');}
function renderPromos(){const html=promoCards();$('lastCallFeaturedCards').innerHTML=html||'<p class="last-call-empty">Pilihan promo sedang disiapkan oleh kantin. Pemesanan Last Call tersedia pukul 15.00–17.00 WIB.</p>';if($('lastCallDialog').open){const cards=promoCards(true);if(!cards)$('lastCallDialog').close();else $('lastCallCards').innerHTML=cards;}updateClock();}
function updateClock(){
  const seconds=jakartaTime(),active=seconds>=54000&&seconds<61200;
  const remaining=active?61200-seconds:seconds<54000?54000-seconds:86400-seconds+54000;
  $('lastCallStatus').textContent=active?'✦ SPESIAL SORE INI':'✦ PRATINJAU PROMO';$('lastCallCountdownLabel').textContent=active?'Berakhir dalam':'Bisa dipesan dalam';$('lastCallCountdown').textContent=[Math.floor(remaining/3600),Math.floor(remaining/60)%60,remaining%60].map(v=>String(v).padStart(2,'0')).join(':');
  if(!active&&$('lastCallDialog').open)$('lastCallDialog').close();
  if(!active||!state.session||admin()||document.querySelector('dialog[open]'))return;
  const cards=promoCards(true);if(!cards)return;
  const key='antreless-online-promo-shown-v1';
  try{if(localStorage.getItem(key)===jakartaDay())return;localStorage.setItem(key,jakartaDay());$('lastCallCards').innerHTML=cards;$('lastCallDialog').showModal();}catch{/* Preferences unavailable: do not repeat a popup. */}
}
function renderManagement(){
  if(!admin())return;
  const managed=managedKantin();$('adminKantin').innerHTML=managed.map(k=>`<option value="${k.id}" ${k.id===state.adminKantin?'selected':''}>${e(k.name)}</option>`).join('')||'<option value="">Belum ada kantin</option>';
  const kantin=state.kantin.find(k=>k.id===state.adminKantin),form=$('kantinForm');
  if(!form.dataset.dirty){form.elements.id.value=kantin?.id||'';form.elements.name.value=kantin?.name||'';form.elements.location.value=kantin?.pickup_location||'';form.elements.opens.value=kantin?.opens_at.slice(0,5)||'06:30';form.elements.closes.value=kantin?.closes_at.slice(0,5)||'17:00';form.elements.accept.checked=kantin?.accepting_orders||false;form.elements.demo.checked=kantin?.is_demo??true;}
  const menus=state.menus.filter(m=>m.kantin_id===state.adminKantin).sort((a,b)=>collator.compare(a.name,b.name));
  $('adminInventory').innerHTML=menus.map(m=>`<article class="inventory-card"><span class="dish-type">${e(m.category)}</span><h3>${e(m.name)}</h3><p>${m.is_verified?'Kepemilikan terverifikasi':'Perlu konfirmasi'} · ${m.active?'Aktif':'Nonaktif'}</p>${m.confirmation_note?`<p>${e(m.confirmation_note)}</p>`:''}<button class="category" data-action="edit-menu" data-id="${m.id}">Ubah menu</button><div class="variant-list">${menuVariants(m.id).map(v=>`<div><b>${e(v.name)}</b><span>${rupiah(v.price)} · Stok ${v.stock}</span><small>${v.price_verified?'Harga terkonfirmasi':'Perlu konfirmasi harga'} · ${v.active?'Tersedia':'Nonaktif'}</small><button class="link-btn" data-action="edit-variant" data-id="${v.id}">Ubah harga / stok</button></div>`).join('')}</div><button class="category" data-action="new-variant" data-id="${m.id}">Tambah pilihan</button></article>`).join('')||'<p>Belum ada menu. Tambahkan menu untuk kantin ini.</p>';
  $('knownCategories').innerHTML=[...new Set(state.menus.map(m=>m.category))].map(c=>`<option value="${e(c)}"></option>`).join('');
  $('promoAdminList').innerHTML=menus.flatMap(m=>menuVariants(m.id).filter(v=>v.price_verified&&v.price!=null).map(v=>{const p=variantPromo(v.id);return `<article class="promo-admin-card"><h3>${e(m.name)}</h3><p>${e(v.name)} · Normal ${rupiah(v.price)}</p><p>${p?`${p.active?'Aktif':'Nonaktif'} · ${rupiah(p.price)} · Kuota ${p.daily_quota}`:'Belum ada promo'}</p><button class="category" data-action="edit-promo" data-id="${v.id}">Kelola promo</button></article>`;})).join('')||'<p>Konfirmasi harga menu terlebih dahulu untuk membuat promo.</p>';
}
function renderAll(){renderMenu();renderKantin();renderCart();renderOrders();renderPromos();renderManagement();}
function openVariant(menuId,mode){
  const menu=state.menus.find(m=>m.id===menuId);if(!menu)return;
  const form=$('variantForm');form.reset();form.elements.menu_id.value=menuId;form.elements.mode.value=mode;
  const variants=menuVariants(menuId).filter(v=>mode!=='promo'||variantPromo(v.id)?.active);
  $('variantTitle').textContent=menu.name;$('variantDescription').textContent=menuKantin(menu)?.name||'';
  $('variantSelect').innerHTML=variants.map(v=>`<option value="${v.id}">${e(v.name)} · ${rupiah(mode==='promo'?variantPromo(v.id)?.price:v.price)} · Stok ${v.stock}</option>`).join('');
  closeDialogs();$('variantDialog').showModal();updateVariant();
}
function updateVariant(){const form=$('variantForm'),variant=state.variants.find(v=>v.id===form.elements.variant_id.value),menu=variantMenu(variant),promo=variantPromo(variant?.id);const quantity=Number(form.elements.quantity.value),problem=variantProblem(menu,variant,menuKantin(menu),{mode:form.elements.mode.value,promo,quantity});$('variantPrice').textContent=rupiah((form.elements.mode.value==='promo'?promo?.price:variant?.price)*quantity);$('variantError').textContent=problem;$('variantSubmit').disabled=!!problem||!configured;}
async function checkout(){
  if(state.checkoutBusy)return;
  if(!state.session){closeDialogs();$('appShell').hidden=true;$('loginScreen').hidden=false;showToast('Masuk terlebih dahulu untuk memesan.');return;}
  if(!configured||!state.connected||!state.cart.length){showToast('Pesanan online belum dapat dikirim.');return;}
  if(state.cart.some((item,index)=>cartLine(item,index).problem)){renderCart();showToast('Periksa ketersediaan menu dalam tas.');return;}
  state.checkoutBusy=true;const epoch=state.epoch;pendingKey ||= crypto.randomUUID();saveDraft();renderCart();
  try{
    const orders=await api(supabase.rpc('checkout',{p_key:pendingKey,p_items:cartPayload(state.cart,item=>item.price_mode==='promo'?variantPromo(item.variant_id)?.price:state.variants.find(v=>v.id===item.variant_id)?.price)}));
    if(epoch!==state.epoch)return;
    if(!Array.isArray(orders)||!orders.length)throw Error('Server belum mengonfirmasi pesanan. Tas tetap disimpan.');
    state.cart=[];state.cartError='';pendingKey=null;saveDraft();$('lastOrderNotice').textContent='Pesanan berhasil tersimpan: '+orders.map(o=>o.kantin_name+' · ANT-'+String(o.queue_number).padStart(3,'0')).join(', ')+'. Pantau kesiapan setiap kantin di bawah ini.';$('lastOrderNotice').hidden=false;showToast('Pesanan berhasil tersimpan di database.');await refresh();$('pesanan-saya').scrollIntoView({behavior:'smooth'});
  }catch(error){if(epoch===state.epoch){state.cartError=humanError(error)+' Tas tetap disimpan; coba lagi untuk melanjutkan permintaan yang sama.';showToast(humanError(error));}}
  finally{state.checkoutBusy=false;renderCart();}
}
function openMenuEditor(id){const menu=state.menus.find(m=>m.id===id),form=$('menuForm');if(!menu&&!state.adminKantin)return showToast('Tambahkan atau pilih kantin terlebih dahulu.');form.reset();form.elements.id.value=menu?.id||'';form.elements.kantin_id.value=menu?.kantin_id||state.adminKantin;form.elements.name.value=menu?.name||'';form.elements.category.value=menu?.category||'';form.elements.kind.value=menu?.kind||'food';form.elements.note.value=menu?.confirmation_note||'Perlu konfirmasi';form.elements.active.checked=menu?.active||false;form.elements.verified.checked=menu?.is_verified||false;$('menuError').textContent='';$('menuDialog').showModal();}
function openVariantEditor(id,menuId){const variant=state.variants.find(v=>v.id===id),form=$('variantEditorForm');form.reset();form.elements.id.value=variant?.id||'';form.elements.menu_id.value=variant?.menu_id||menuId;form.elements.name.value=variant?.name||'';form.elements.price.value=variant?.price??'';form.elements.stock.value=variant?.stock??0;form.elements.active.checked=variant?.active||false;form.elements.verified.checked=variant?.price_verified||false;$('variantEditorError').textContent='';$('variantEditorDialog').showModal();}
function openPromoEditor(id){const variant=state.variants.find(v=>v.id===id);if(!variant)return;const promo=variantPromo(id),form=$('promoForm');form.reset();form.elements.variant_id.value=id;form.elements.price.value=promo?.price??'';form.elements.quota.value=promo?.daily_quota??0;form.elements.remaining.value=promo?(promo.stock_date===jakartaDay()?promo.remaining_stock:promo.daily_quota):0;form.elements.starts.value=promo?.starts_at.slice(0,5)||'15:00';form.elements.ends.value=promo?.ends_at.slice(0,5)||'17:00';form.elements.active.checked=promo?.active||false;$('promoVariantName').textContent=variantMenu(variant)?.name+' · '+variant.name;$('promoError').textContent='';$('promoDialog').showModal();}
async function saveForm(form,rpc,args,errorId,success){
  if(form.dataset.busy)return;form.dataset.busy='true';const button=form.querySelector('[type=submit]');button.disabled=true;
  try{await api(supabase.rpc(rpc,args));form.dataset.dirty='';form.closest('dialog')?.close();setError(errorId,'');showToast(success);await refresh();}
  catch(error){setError(errorId,humanError(error));}
  finally{form.dataset.busy='';button.disabled=false;}
}

document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  const {action,id,index,change,mode}=button.dataset;
  try{
    if(action==='password'){const visible=$('authPassword').type==='password';$('authPassword').type=visible?'text':'password';button.textContent=visible?'Sembunyikan':'Lihat';button.setAttribute('aria-pressed',String(visible));button.setAttribute('aria-label',visible?'Sembunyikan kata sandi':'Tampilkan kata sandi');}
    else if(action==='register'||action==='login')setMode(action);
    else if(action==='browse')browse();
    else if(action==='account'){if(state.session){await api(supabase.auth.signOut());await changeSession(null,'SIGNED_OUT');}else{$('appShell').hidden=true;$('loginScreen').hidden=false;}}
    else if(action==='forgot'){if(!configured)return showToast('Pemulihan akun tersedia setelah koneksi Supabase aktif.');if(!$('authEmail').reportValidity())return;await api(supabase.auth.resetPasswordForEmail($('authEmail').value.trim(),{redirectTo:window.location.origin}));showToast('Jika email terdaftar, tautan pemulihan dikirim.');}
    else if(action==='category'){state.category=id;renderMenu();}
    else if(action==='kantin'){state.kantinId=id;renderMenu();$('menu').scrollIntoView({behavior:'smooth'});}
    else if(action==='clear-search'){$('searchInput').value='';renderMenu();}
    else if(action==='reset-filters')resetFilters();
    else if(action==='promo-filter'){state.promoOnly=!state.promoOnly;closeDialogs();renderMenu();$('menu').scrollIntoView({behavior:'smooth'});}
    else if(action==='pick')openVariant(id,mode);
    else if(action==='close-dialog')button.closest('dialog')?.close();
    else if(action==='quantity'){const item=state.cart[Number(index)];if(!item)return;item.quantity+=Number(change);if(item.quantity<1)state.cart.splice(Number(index),1);if(item.quantity>99)item.quantity=99;changedCart();}
    else if(action==='remove'){state.cart.splice(Number(index),1);changedCart();}
    else if(action==='checkout')await checkout();
    else if(action==='buyer-filter'){state.buyerFilter=id;renderOrders();}
    else if(action==='admin-filter'){state.adminFilter=id;renderOrders();}
    else if(action==='new-menu')openMenuEditor();
    else if(action==='edit-menu')openMenuEditor(id);
    else if(action==='edit-variant')openVariantEditor(id);
    else if(action==='new-variant')openVariantEditor(null,id);
    else if(action==='edit-promo')openPromoEditor(id);
    else if(action==='new-kantin'){const form=$('kantinForm');form.reset();form.elements.id.value='';form.elements.name.value='';form.elements.location.value='';form.elements.opens.value='06:30';form.elements.closes.value='17:00';form.elements.demo.checked=true;form.dataset.dirty='true';form.scrollIntoView({behavior:'smooth'});form.elements.name.focus();}
  }catch(error){showToast(humanError(error));}
});
$('searchInput').addEventListener('input',renderMenu);
$('adminKantin').addEventListener('change',event=>{state.adminKantin=event.target.value;$('kantinForm').dataset.dirty='';renderManagement();renderOrders();});
$('kantinForm').addEventListener('input',()=>{$('kantinForm').dataset.dirty='true';});
$('variantForm').addEventListener('input',updateVariant);
$('variantForm').addEventListener('submit',event=>{event.preventDefault();const form=event.target,variantId=form.elements.variant_id.value,quantity=Number(form.elements.quantity.value),priceMode=form.elements.mode.value;if(!form.reportValidity()||$('variantSubmit').disabled)return;const existing=state.cart.find(i=>i.variant_id===variantId&&i.price_mode===priceMode);if(existing){if(existing.quantity+quantity>99)return showToast('Maksimal 99 per pilihan.');existing.quantity+=quantity;}else state.cart.push({variant_id:variantId,quantity,price_mode:priceMode});changedCart();$('variantDialog').close();showToast('Pilihan ditambahkan ke tas.');});
$('authForm').addEventListener('submit',async event=>{
  event.preventDefault();if(state.authBusy||!configured)return;if(!$('authForm').reportValidity())return;
  const email=$('authEmail').value.trim(),password=$('authPassword').value;
  if(state.mode!=='login'&&password!==$('authConfirm').value){$('authError').textContent='Konfirmasi kata sandi belum sama.';return;}
  state.authBusy=true;$('authSubmit').disabled=true;$('authError').textContent='';
  try{
    if(state.mode==='recovery'){await api(supabase.auth.updateUser({password}));setMode('login');route();showToast('Kata sandi berhasil diperbarui.');}
    else if(state.mode==='register'){const data=await api(supabase.auth.signUp({email,password,options:{data:{display_name:$('authName').value.trim()},emailRedirectTo:window.location.origin}}));if(data.session)await changeSession(data.session,'SIGNED_IN');else $('authError').textContent='Periksa email untuk mengonfirmasi akun, lalu masuk. Akun demo lama perlu didaftarkan ulang.';}
    else{const data=await api(supabase.auth.signInWithPassword({email,password}));await changeSession(data.session,'SIGNED_IN');}
    $('authPassword').value='';$('authConfirm').value='';
  }catch(error){$('authError').textContent=humanError(error);}
  finally{state.authBusy=false;$('authSubmit').disabled=!configured;}
});
$('kantinForm').addEventListener('submit',event=>{event.preventDefault();const f=event.target.elements;saveForm(event.target,'save_kantin',{p_id:f.id.value||null,p_name:f.name.value,p_location:f.location.value,p_opens:f.opens.value,p_closes:f.closes.value,p_accept:f.accept.checked,p_demo:f.demo.checked},'adminError','Kantin disimpan.');});
$('menuForm').addEventListener('submit',event=>{event.preventDefault();const f=event.target.elements;saveForm(event.target,'save_menu',{p_id:f.id.value||null,p_kantin:f.kantin_id.value,p_name:f.name.value,p_category:f.category.value,p_kind:f.kind.value,p_active:f.active.checked,p_verified:f.verified.checked,p_note:f.note.value},'menuError','Menu disimpan.');});
$('variantEditorForm').addEventListener('submit',event=>{event.preventDefault();const f=event.target.elements;saveForm(event.target,'save_variant',{p_id:f.id.value||null,p_menu:f.menu_id.value,p_name:f.name.value,p_price:f.price.value?Number(f.price.value):null,p_stock:Number(f.stock.value),p_active:f.active.checked,p_verified:f.verified.checked},'variantEditorError','Pilihan dan stok disimpan.');});
$('promoForm').addEventListener('submit',event=>{event.preventDefault();const f=event.target.elements;saveForm(event.target,'save_promo',{p_variant:f.variant_id.value,p_price:Number(f.price.value),p_quota:Number(f.quota.value),p_remaining:Number(f.remaining.value),p_starts:f.starts.value,p_ends:f.ends.value,p_active:f.active.checked},'promoError','Promo disimpan.');});
document.addEventListener('input',event=>{const form=event.target.closest('.order-admin-form');if(form)state.orderDrafts.set(form.dataset.orderId,{eta:form.elements.eta.value,note:form.elements.note.value,reason:form.elements.reason.value});});
document.addEventListener('submit',async event=>{
  const form=event.target;if(!form.matches('.order-admin-form'))return;event.preventDefault();if(form.dataset.busy)return;
  const status=event.submitter?.value;if(!status)return;
  if(status==='cancelled'&&!form.elements.reason.value.trim()){form.elements.reason.setCustomValidity('Isi alasan pembatalan.');form.elements.reason.reportValidity();form.elements.reason.addEventListener('input',()=>form.elements.reason.setCustomValidity(''),{once:true});return;}
  form.dataset.busy='true';const buttons=[...form.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);
  try{await api(supabase.rpc('update_order',{p_order_id:form.dataset.orderId,p_status:status,p_eta:form.elements.eta.value?new Date(form.elements.eta.value+':00+07:00').toISOString():null,p_note:form.elements.note.value,p_reason:form.elements.reason.value}));state.orderDrafts.delete(form.dataset.orderId);document.activeElement?.blur();showToast('Pesanan diperbarui.');await refresh();}
  catch(error){setError('adminError',humanError(error));showToast(humanError(error));}
  finally{form.dataset.busy='';buttons.forEach(b=>b.disabled=false);}
});
async function init(){
  loadDraft();setMode('login');$('authSubmit').disabled=!configured;
  const legacy=['antreless-carts-v1','antreless-orders-v2','antreless-demo-orders-v1'].some(key=>{try{return !!localStorage.getItem(key);}catch{return false;}});$('legacyNotice').hidden=!legacy;
  if(!configured){state.kantin=structuredClone(seedKantin);state.menus=structuredClone(seedMenus);state.variants=structuredClone(seedVariants);$('connectionNotice').hidden=false;$('connectionNotice').textContent='Pemesanan online belum aktif. Kamu bisa melihat katalog referensi; akun dan pesanan akan tersedia setelah layanan terhubung.';$('catalogNotice').hidden=false;$('catalogNotice').textContent='Katalog referensi dari transkripsi · Kantin Demo · Menu dan harga masih perlu konfirmasi. Belum menerima transaksi.';renderAll();}
  else{
    supabase.auth.onAuthStateChange((event,session)=>{setTimeout(()=>changeSession(session,event).catch(error=>showToast(humanError(error))),0);});
    try{const {data}=await supabase.auth.getSession();if(data.session){await api(supabase.auth.getUser());await changeSession(data.session,'INITIAL_SESSION');}else{await refresh();await changeSession(null,'INITIAL_SESSION');}}
    catch(error){$('authError').textContent=humanError(error);await refresh();}
  }
  clockTimer=setInterval(()=>{const before=$('lastCallStatus').textContent;updateClock();if(before!==$('lastCallStatus').textContent){renderMenu();renderCart();renderPromos();}},1000);
  setInterval(()=>{if(!document.hidden)refresh();},15000);
}
window.addEventListener('online',()=>{if(configured)refresh();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&configured)refresh();});
window.addEventListener('pagehide',()=>{cleanup();clearInterval(clockTimer);});
window.appReady=init();
