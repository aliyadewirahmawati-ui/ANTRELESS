const categoryNames={all:'Semua menu','aneka-nasi':'Aneka Nasi',bakmi:'Bakmi','bakso-soto':'Bakso dan Soto',jajanan:'Jajanan',minuman:'Minuman',roti:'Roti',layanan:'Layanan kampus'};
// Photo coordinates refer to the existing 3 × 3 image sheet, never the menu index.
const menuCatalog=[
  {name:'Bubur Ayam',category:'aneka-nasi',description:'Bubur hangat, ayam suwir, cakwe, dan daun bawang.',price:12000,tenant:'Kantin A'},
  {name:'Nasi Ayam Geprek',category:'aneka-nasi',description:'Ayam crispy, nasi, dan sambal geprek.',price:18000,tenant:'Kantin A',photo:{x:0,y:0}},
  {name:'Nasi Ayam Teriyaki',category:'aneka-nasi',description:'Ayam teriyaki, sayuran, dan nasi hangat.',price:20000,tenant:'Kantin A',photo:{x:50,y:0}},
  {name:'Nasi Goreng',category:'aneka-nasi',description:'Nasi goreng gurih dengan telur dan acar.',price:15000,tenant:'Kantin A'},
  {name:'Nasi Kuning',category:'aneka-nasi',description:'Nasi kunyit, telur, orek tempe, dan sambal.',price:14000,tenant:'Kantin A'},
  {name:'Nasi Liwet',category:'aneka-nasi',description:'Nasi liwet harum, ayam suwir, dan lalapan.',price:18000,tenant:'Kantin A'},
  {name:'Nasi Pecel',category:'aneka-nasi',description:'Nasi, sayuran rebus, bumbu kacang, dan rempeyek.',price:13000,tenant:'Kantin A'},
  {name:'Nasi Uduk',category:'aneka-nasi',description:'Nasi santan, telur, bihun, dan orek tempe.',price:14000,tenant:'Kantin A'},
  {name:'Bakmi Ayam',category:'bakmi',description:'Bakmi gurih dengan ayam berbumbu dan sawi.',price:16000,tenant:'Kantin B'},
  {name:'Bakmi Goreng',category:'bakmi',description:'Bakmi goreng kecap, telur, dan sayuran.',price:16000,tenant:'Kantin B'},
  {name:'Bakmi Jawa',category:'bakmi',description:'Bakmi bumbu Jawa dengan ayam suwir dan telur.',price:18000,tenant:'Kantin B'},
  {name:'Bakmi Kuah',category:'bakmi',description:'Bakmi berkuah hangat dengan telur dan sayuran.',price:16000,tenant:'Kantin B'},
  {name:'Mie Ayam Pangsit',category:'bakmi',description:'Mie ayam gurih dengan sawi dan pangsit.',price:16000,tenant:'Kantin B',photo:{x:0,y:50}},
  {name:'Bakso Ayam',category:'bakso-soto',description:'Bakso ayam, bihun, dan kuah kaldu hangat.',price:14000,tenant:'Kantin A'},
  {name:'Bakso Sapi',category:'bakso-soto',description:'Bakso sapi, mie, dan kuah kaldu gurih.',price:16000,tenant:'Kantin A'},
  {name:'Bakso Urat',category:'bakso-soto',description:'Bakso urat kenyal dengan mie dan kuah kaldu.',price:18000,tenant:'Kantin A'},
  {name:'Soto Ayam',category:'bakso-soto',description:'Soto ayam kuah kuning, soun, dan telur.',price:15000,tenant:'Kantin A'},
  {name:'Soto Bandung',category:'bakso-soto',description:'Soto sapi bening dengan lobak dan kedelai.',price:20000,tenant:'Kantin A'},
  {name:'Soto Betawi',category:'bakso-soto',description:'Soto sapi kuah santan dengan kentang dan tomat.',price:22000,tenant:'Kantin A'},
  {name:'Batagor',category:'jajanan',description:'Bakso tahu goreng dengan saus kacang.',price:10000,tenant:'Kantin B'},
  {name:'Cireng',category:'jajanan',description:'Cireng renyah, 5 buah, dengan sambal rujak.',price:8000,tenant:'Kantin B'},
  {name:'Dimsum Mentai',category:'jajanan',description:'4 buah dimsum ayam dengan saus mentai.',price:14000,tenant:'Kantin B',photo:{x:50,y:50}},
  {name:'Kentang Goreng',category:'jajanan',description:'Kentang goreng renyah dengan saus pilihan.',price:10000,tenant:'Kantin B'},
  {name:'Pisang Goreng',category:'jajanan',description:'Pisang goreng hangat dan renyah, 4 buah.',price:8000,tenant:'Kantin B'},
  {name:'Seblak',category:'jajanan',description:'Kerupuk kuah kencur pedas dengan telur dan sayur.',price:14000,tenant:'Kantin B'},
  {name:'Siomay',category:'jajanan',description:'Siomay kukus dengan tahu dan saus kacang.',price:12000,tenant:'Kantin B'},
  {name:'Tahu Crispy',category:'jajanan',description:'Tahu goreng renyah dengan bumbu gurih.',price:8000,tenant:'Kantin B'},
  {name:'Air Mineral',category:'minuman',description:'Air mineral botol 600 ml, segar untuk harimu.',price:3000,tenant:'Kantin C'},
  {name:'Es Cokelat',category:'minuman',description:'Minuman cokelat dingin dengan susu.',price:10000,tenant:'Kantin C'},
  {name:'Es Jeruk',category:'minuman',description:'Perasan jeruk segar dengan es batu.',price:6000,tenant:'Kantin A'},
  {name:'Es Kopi Susu',category:'minuman',description:'Kopi susu dingin dengan gula aren.',price:12000,tenant:'Kantin C'},
  {name:'Es Teh Lemon',category:'minuman',description:'Teh lemon dingin, segar dengan manis yang pas.',price:5000,tenant:'Kantin A',photo:{x:100,y:0}},
  {name:'Jus Alpukat',category:'minuman',description:'Jus alpukat lembut dengan susu cokelat.',price:12000,tenant:'Kantin C'},
  {name:'Jus Jambu',category:'minuman',description:'Jus jambu merah segar dengan es.',price:10000,tenant:'Kantin C'},
  {name:'Smoothie Berry',category:'minuman',description:'Smoothie buah berry segar tanpa sirup.',price:13000,tenant:'Kantin C',photo:{x:50,y:100}},
  {name:'Thai Tea',category:'minuman',description:'Teh Thailand dingin dengan susu yang creamy.',price:8000,tenant:'Kantin B',photo:{x:100,y:50}},
  {name:'Croissant Cokelat',category:'roti',description:'Croissant berlapis renyah dengan isi cokelat.',price:15000,tenant:'Kantin C'},
  {name:'Croissant Keju',category:'roti',description:'Croissant mentega dengan keju gurih.',price:15000,tenant:'Kantin C'},
  {name:'Croissant Original',category:'roti',description:'Croissant mentega klasik, renyah dan lembut.',price:12000,tenant:'Kantin C'},
  {name:'Roti Bakar Cokelat',category:'roti',description:'Roti bakar hangat dengan isian cokelat.',price:10000,tenant:'Kantin C'},
  {name:'Roti Bakar Keju',category:'roti',description:'Roti bakar dengan keju dan susu.',price:11000,tenant:'Kantin C'},
  {name:'Roti Isi Ayam',category:'roti',description:'Roti lembut dengan ayam berbumbu gurih.',price:12000,tenant:'Kantin C'},
  {name:'Roti Isi Telur',category:'roti',description:'Roti lembut dengan telur dan mayones.',price:10000,tenant:'Kantin C'},
  {name:'Roti Kukus',category:'roti',description:'Roti kukus lembut dengan susu manis.',price:8000,tenant:'Kantin C'},
  {name:'Sandwich Telur',category:'roti',description:'Roti gandum, telur, sayuran, dan mayones.',price:15000,tenant:'Kantin C',photo:{x:100,y:100}},
  {name:'Fotokopi',category:'layanan',description:'Salin dokumen hitam-putih atau warna sesuai kebutuhan.',price:500,tenant:'Fotokopi & Print Kampus',service:true},
  {name:'Print Dokumen',category:'layanan',description:'Cetak file, pilih warna dan sisi cetak.',price:2000,tenant:'Fotokopi & Print Kampus',service:true},
  {name:'Scan Dokumen',category:'layanan',description:'Digitalisasi halaman menjadi PDF atau JPG.',price:1000,tenant:'Fotokopi & Print Kampus',service:true},
  {name:'Jilid Spiral',category:'layanan',description:'Rapikan tugas dan laporan dengan cover pilihan.',price:8000,tenant:'Fotokopi & Print Kampus',service:true},
  {name:'Laminating',category:'layanan',description:'Lindungi lembar A4 atau A3.',price:4000,tenant:'Fotokopi & Print Kampus',service:true}
].map(menu=>({...menu,id:menu.name.toLowerCase().replaceAll(' ','-')}));
const menus=Object.fromEntries(['Kantin A','Kantin B','Kantin C','Fotokopi & Print Kampus'].map(tenant=>[tenant,menuCatalog.filter(menu=>menu.tenant===tenant)]));
const menuAlphabet=new Intl.Collator('id-ID',{sensitivity:'base'});
const categoryIllustrations={
  'aneka-nasi':'<path d="M33 74c4-15 16-23 31-23s27 8 31 23" fill="var(--surface)"/><path d="M27 77h74c-3 22-16 34-37 34S30 99 27 77Z"/><path d="M46 72l5-7m12 5 3-9m12 10 5-6M52 42c-8-9 8-11 0-20m22 20c-8-9 8-11 0-20"/>',
  bakmi:'<path d="M27 77h74c-3 22-16 34-37 34S30 99 27 77Z"/><path d="M35 76c0-20 12-20 12 0m3 0c0-25 12-25 12 0m3 0c0-20 12-20 12 0m3 0c0-16 12-16 12 0M60 42l46-18M63 49l46-18"/>',
  'bakso-soto':'<path d="M27 77h74c-3 22-16 34-37 34S30 99 27 77Z"/><circle cx="45" cy="67" r="10"/><circle cx="66" cy="63" r="12"/><circle cx="86" cy="68" r="9"/><path d="m93 56 12-25M54 40c-8-9 8-11 0-20"/>',
  jajanan:'<path d="M23 92h82l-8 17H31Z"/><path d="m35 82 4-39 13 2-4 39m8 0 2-49 13 1-2 48m8 0 6-39 13 3-6 36" fill="var(--surface)"/><path d="m30 49-8-5m78-8 8-7M45 23l3 8"/>',
  minuman:'<path d="m43 50 5 60h32l6-60ZM38 50h53M65 50l6-29h17"/><path d="M47 69h35M52 85l6-4 4 7-6 4Zm15 10 6-4 4 7-6 4Z" fill="var(--surface)"/>',
  roti:'<path d="M29 67c4-20 17-30 35-30s31 10 35 30l13 28c-17 7-31 2-34-9H50c-3 11-17 16-34 9Z" fill="var(--surface)"/><path d="m46 43 4 43m28-43-4 43M31 61l19 8m47-8-23 8M23 80l23 4m59-4-27 4"/>'
};
const partnerNames=Object.keys(menus),cartKey='antreless-carts-v1';
const slotList=Array.from({length:63},(_,i)=>{const time=n=>String(Math.floor(n/60)).padStart(2,'0')+'.'+String(n%60).padStart(2,'0');return time(390+i*10)+'–'+time(400+i*10)});
const oldPartners={'Ayam Bu Rina':'Kantin A','Mie Pojok':'Kantin B','Segar Sore':'Kantin C'};
let cartMessage='',serviceMenuId=null,adminPartner='Kantin A',adminSlot='06.30–06.40',inventoryPartner='all';
const $=id=>document.getElementById(id);
let tenant='all',category='all',cart=[],slot='06.30–06.40',authMode='login',currentUser=null,authBusy=false;
const accountKey='antreless-demo-accounts-v1',sessionKey='antreless-demo-session-v1';
const ordersKey='antreless-orders-v2',legacyOrdersKey='antreless-demo-orders-v1';
const adminEmail='aliyadewirahmawati@gmail.com',buyerDemoEmail='pembeli.demo@antreless.local';
const sessionTabKey='antreless-session-tab-id';
const orderStates=['waiting','preparing','ready','completed'];
const statusLabels={waiting:'Menunggu',preparing:'Sedang disiapkan',ready:'Siap diambil',completed:'Selesai'};
const statusActions={waiting:'Mulai siapkan',preparing:'Tandai siap diambil',ready:'Selesaikan pesanan'};
let buyerFilter='all',adminFilter='all',checkoutBusy=false;
function rupiah(n){return 'Rp'+Number(n).toLocaleString('id-ID')}
function readLocal(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
function readSession(key,fallback){try{return JSON.parse(sessionStorage.getItem(key))||fallback}catch{return fallback}}
function readAccounts(){const raw=localStorage.getItem(accountKey),accounts=raw===null?[]:JSON.parse(raw);if(!Array.isArray(accounts)||accounts.some(account=>!account||typeof account.email!=='string'||typeof account.name!=='string'))throw Error('Invalid accounts');return accounts}
function showToast(t){const e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(window.toastT);window.toastT=setTimeout(()=>e.classList.remove('show'),2300)}
// Last Call uses WIB, independently of the device's configured time zone.
const lastCallPopupKey='antreless-last-call-popup-v1';
let promoOnly=false,selectedPromoMenu='nasi-ayam-geprek';
function campusMinutes(now=new Date()){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);return Number(parts.find(part=>part.type==='hour').value)*60+Number(parts.find(part=>part.type==='minute').value)}
function lastCallHours(now=new Date()){const minutes=campusMinutes(now);return minutes>=900&&minutes<1020}
function eligibleLastCall(menu){return !!menu&&!menu.service&&['Kantin A','Kantin B','Kantin C'].includes(menu.tenant)}
function initialPromos(inventory){
  return Object.fromEntries([['nasi-ayam-geprek',15000,5],['dimsum-mentai',10000,6],['croissant-original',9000,5]].map(([id,price,stock])=>[id,{active:inventory[id].active&&inventory[id].stock>0,mode:'price',value:price,price,dailyStock:stock,stock:Math.min(stock,inventory[id].stock),stockDate:jakartaDate()}]));
}
function calculatePromoPrice(menu,mode,value){
  if(!eligibleLastCall(menu)||!Number.isSafeInteger(value))throw Error('Pilih menu kantin dan nilai promo berupa angka bulat.');
  if(mode==='percent'){if(value<1||value>99)throw Error('Diskon harus 1–99%.');return Math.max(1,Math.round(menu.price*(100-value)/100));}
  if(mode!=='price'||value<1||value>=menu.price)throw Error('Harga promo harus lebih dari Rp0 dan lebih rendah dari harga normal.');return value;
}
function validatePromos(state){
  if(!state.promos||typeof state.promos!=='object'||Array.isArray(state.promos))throw Error('Data promo tidak valid.');
  for(const [id,promo]of Object.entries(state.promos)){const menu=menuCatalog.find(menu=>menu.id===id);if(!promo||typeof promo.active!=='boolean'||promo.price!==calculatePromoPrice(menu,promo.mode,promo.value)||!Number.isSafeInteger(promo.dailyStock)||promo.dailyStock<0||promo.dailyStock>100000||!Number.isSafeInteger(promo.stock)||promo.stock<0||promo.stock>promo.dailyStock||!/^\d{4}-\d{2}-\d{2}$/.test(promo.stockDate))throw Error('Data stok promo tidak valid.');}
}
function hydratePromos(state){
  if(state.promos===undefined)state.promos=initialPromos(state.inventory);
  validatePromos(state);
  for(const [id,promo]of Object.entries(state.promos))if(promo.stockDate!==jakartaDate()){promo.stockDate=jakartaDate();promo.stock=Math.min(promo.dailyStock,state.inventory[id].stock);}
  return state;
}
function currentPromo(menu,state,now=new Date()){
  const promo=state?.promos?.[menu?.id],inventory=state?.inventory[menu?.id];
  return lastCallHours(now)&&eligibleLastCall(menu)&&promo?.active&&promo.stockDate===jakartaDate(now)&&inventory?.active&&inventory.stock>0?promo:null;
}
function availablePromoMenus(state,now=new Date()){return menuCatalog.filter(menu=>{const promo=currentPromo(menu,state,now);return promo&&promo.stock>0}).sort((a,b)=>menuAlphabet.compare(a.name,b.name))}
function promoCartQuantity(id){return cart.filter(item=>item.menuId===id&&item.promotion==='last-call').reduce((sum,item)=>sum+item.qty,0)}
function promoItemProblem(item,menu,state,now=new Date()){
  if(item.promotion!=='last-call')return '';
  if(!lastCallHours(now)||item.promoDate!==jakartaDate(now))return 'Promo Last Call berakhir atau belum aktif. '+item.name+' dihapus dari tas; tambahkan kembali jika ingin harga normal.';
  const promo=currentPromo(menu,state,now);
  if(!promo)return 'Promo '+item.name+' tidak tersedia lagi. Tambahkan kembali jika ingin harga normal.';
  if(promo.stock===0)return 'Stok promo habis: '+item.name+' dihapus dari tas.';
  if(item.price!==promo.price||item.originalPrice!==menu.price)return 'Harga promo '+item.name+' berubah. Pilih menu kembali untuk menyetujui harga terbaru.';
  return '';
}
function promoReceiptHTML(item){return item.promotion==='last-call'?`<small class="promo-receipt"><span>Menu Hemat</span> <del>${rupiah(item.originalPrice)}</del> → ${rupiah(item.price)} / item</small>`:''}
function promoStockBadge(menu,state,promo){if(!promo)return stockBadge(menu,state);const stock=Math.min(promo.stock,state.inventory[menu.id].stock),kind=stock===0?'empty':stock<=5?'low':'available',label=stock===0?'Habis hari ini':stock<=5?'Tersisa sedikit':'Tersedia';return `<span class="stock-badge stock-${kind}">${label}${stock?' · '+stock+' stok promo':''}</span>`}
function menuPriceHTML(menu,promo){return promo?`<span class="price promo-price"><del>${rupiah(menu.price)}</del><strong>${rupiah(promo.price)}</strong></span>`:`<span class="price">${menu.service?'Mulai ':''}${rupiah(menu.price)}</span>`}
function lastCallSlot(time,now=new Date()){if(!slotList.includes(time))return false;const end=time.split('–')[1].split('.').map(Number),endMinutes=end[0]*60+end[1];return lastCallHours(now)&&endMinutes>campusMinutes(now)&&endMinutes<=1020}
function choosePromoSlot(state){if(!cart.some(item=>item.promotion==='last-call')||lastCallSlot(slot))return;const partners=[...new Set(cart.map(item=>item.tenant))],available=slotList.find(time=>lastCallSlot(time)&&partners.every(name=>slotInfo(state,name,time).available));if(available)slot=available;}
function chooseLastCall(){
  const state=safeState();if(!lastCallHours()||!availablePromoMenus(state).length)return showToast('Belum ada menu hemat yang tersedia saat ini.');
  promoOnly=true;tenant='all';category='all';$('searchInput').value='';closeLastCall();renderMenu();navigateTo('menu');
}
function toggleLastCallFilter(){if(promoOnly){promoOnly=false;renderMenu()}else chooseLastCall()}
function popupPromoCard(menu,state){
  const promo=currentPromo(menu,state),stock=Math.min(state.inventory[menu.id].stock,promo.stock),visual=menu.photo?`<div class="food-photo last-call-food" aria-hidden="true" style="--photo-x:${menu.photo.x}%;--photo-y:${menu.photo.y}%"></div>`:`<svg class="last-call-food" viewBox="0 0 128 128" aria-hidden="true" fill="var(--soft-accent)" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${categoryIllustrations[menu.category]}</svg>`;
  return `<article class="last-call-card">${visual}<h3>${escapeHTML(menu.name)}</h3><p>${escapeHTML(menu.tenant)}</p>${menuPriceHTML(menu,promo)}<span class="stock-badge ${stock<=5?'stock-low':'stock-available'}">${stock<=5?'Tersisa sedikit':'Tersedia'} · ${stock}</span></article>`;
}
function renderLastCall(state){
  const menus=availablePromoMenus(state),buyer=currentUser?.role==='buyer',visible=buyer&&menus.length>0;
  if(!lastCallHours())promoOnly=false;
  $('lastCallBanner').hidden=!visible;$('lastCallFilter').hidden=!visible;
  $('lastCallFilter').classList.toggle('active',promoOnly);$('lastCallFilter').setAttribute('aria-pressed',String(promoOnly));
  if($('lastCallDialog').open){if(!buyer||!menus.length)closeLastCall();else $('lastCallCards').innerHTML=menus.slice(0,3).map(menu=>popupPromoCard(menu,state)).join('');}
}
function closeLastCall(){if($('lastCallDialog').open)$('lastCallDialog').close()}
async function maybeShowLastCall(){
  if(currentUser?.role!=='buyer'||!lastCallHours()||$('serviceDialog').open||$('resetDialog').open||$('forgotDialog').open||$('lastCallDialog').open)return;
  const sessionId=currentUser.sessionId;
  try{await withDataLock(lastCallPopupKey,()=>{
    if(currentUser?.role!=='buyer'||currentUser.sessionId!==sessionId||!lastCallHours()||$('lastCallDialog').open||$('serviceDialog').open)return;
    const state=safeState(),menus=availablePromoMenus(state),today=jakartaDate();
    if(!menus.length||readLocal(lastCallPopupKey,{}).lastShownDate===today)return;
    // Commit the once-per-browser marker before opening while holding a shared tab lock.
    localStorage.setItem(lastCallPopupKey,JSON.stringify({lastShownDate:today}));
    $('lastCallCards').innerHTML=menus.slice(0,3).map(menu=>popupPromoCard(menu,state)).join('');$('lastCallDialog').showModal();
  });}catch{ /* Unavailable storage must not cause a repeating popup. */ }
}
function refreshLastCallClock(){refreshBusiness();maybeShowLastCall()}
function scheduleLastCallClock(){setTimeout(()=>{refreshLastCallClock();scheduleLastCallClock()},60000-Date.now()%60000+25)}
function renderPromoAdmin(state){
  if(!isAdmin())return;
  const menu=menuCatalog.find(menu=>menu.id===selectedPromoMenu),promo=state.promos[menu.id],stock=state.inventory[menu.id];
  $('promoOrderCount').textContent=state.orders.filter(order=>jakartaDate(order.createdAt)===jakartaDate()&&order.items.some(item=>item.promotion==='last-call')).length+' pesanan promo hari ini';
  $('promoClockStatus').textContent=lastCallHours()?'Jam Last Call sedang aktif · hingga 17.00 WIB.':'Promo tampil untuk pembeli hanya pukul 15.00–17.00 WIB.';
  $('promoAdminControls').innerHTML=`<div class="promo-controls"><label>Menu kantin<select id="promoMenu" onchange="selectedPromoMenu=this.value;renderPromoAdmin(readOrderState())">${menuCatalog.filter(eligibleLastCall).sort((a,b)=>menuAlphabet.compare(a.name,b.name)).map(item=>`<option value="${item.id}" ${item.id===menu.id?'selected':''}>${escapeHTML(item.name)} · ${item.tenant}</option>`).join('')}</select></label><label>Jenis potongan<select id="promoMode" onchange="updatePromoEditor()"><option value="price" ${promo?.mode==='price'?'selected':''}>Harga promo (Rp)</option><option value="percent" ${!promo||promo.mode==='percent'?'selected':''}>Diskon (%)</option></select></label><label><span id="promoValueLabel">${promo?.mode==='price'?'Harga promo (Rp)':'Diskon (%)'}</span><input id="promoValue" type="number" min="1" max="${promo?.mode==='price'?menu.price-1:99}" step="1" value="${promo?.value||20}" oninput="previewPromoPrice()"></label><label>Stok promo hari ini<input id="promoStock" type="number" min="0" max="${stock.stock}" step="1" value="${promo?.stock??Math.min(5,stock.stock)}"></label><label class="promo-active-control"><input id="promoActive" type="checkbox" ${promo?.active?'checked':''}> Aktifkan promo</label><button class="category" onclick="saveLastCallPromo()">Simpan promo</button></div><p id="promoPreview" class="management-note"></p><p class="management-note">Stok utama ${stock.stock} · ${stock.active?'Menu aktif':'Menu tidak tersedia'}. Stok promo merupakan bagian dari stok utama, bukan tambahan. Stok yang disimpan menjadi kuota harian berikutnya, dibatasi stok utama.</p>`;
  previewPromoPrice();
  $('promoAdminList').innerHTML=Object.entries(state.promos).sort(([a],[b])=>menuAlphabet.compare(menuCatalog.find(menu=>menu.id===a).name,menuCatalog.find(menu=>menu.id===b).name)).map(([id,promo])=>{const item=menuCatalog.find(menu=>menu.id===id),inventory=state.inventory[id];return `<article class="promo-admin-card"><div><span class="dish-type">${item.tenant}</span><h3>${escapeHTML(item.name)}</h3>${menuPriceHTML(item,promo)}<p>Stok promo ${promo.stock} · Stok utama ${inventory.stock}</p><span class="stock-badge ${promo.stock===0||inventory.stock===0?'stock-empty':!promo.active||!inventory.active?'stock-off':'stock-available'}">${promo.stock===0||inventory.stock===0?'Habis hari ini':!inventory.active?'Menu tidak tersedia':promo.active?'Promo aktif':'Promo nonaktif'}</span></div><div class="promo-row-actions"><button class="category" data-edit-promo="${id}">Edit</button><button class="category" data-toggle-promo="${id}" ${!promo.active&&(!inventory.active||inventory.stock===0||promo.stock===0)?'disabled':''}>${promo.active?'Nonaktifkan':'Aktifkan'}</button></div></article>`}).join('');
}
function updatePromoEditor(){const menu=menuCatalog.find(menu=>menu.id===selectedPromoMenu),mode=$('promoMode').value;$('promoValueLabel').textContent=mode==='price'?'Harga promo (Rp)':'Diskon (%)';$('promoValue').max=mode==='price'?menu.price-1:99;$('promoValue').value=mode==='price'?Math.round(menu.price*.8):20;previewPromoPrice()}
function previewPromoPrice(){try{const menu=menuCatalog.find(menu=>menu.id===selectedPromoMenu),price=calculatePromoPrice(menu,$('promoMode').value,Number($('promoValue').value));$('promoPreview').textContent='Harga normal '+rupiah(menu.price)+' → Harga promo '+rupiah(price)}catch(error){$('promoPreview').textContent=error.message}}
function saveLastCallPromo(){
  if(!isAdmin())return;const id=selectedPromoMenu,menu=menuCatalog.find(menu=>menu.id===id),mode=$('promoMode').value,value=Number($('promoValue').value),stock=Number($('promoStock').value),active=$('promoActive').checked;
  try{const price=calculatePromoPrice(menu,mode,value);if(!$('promoStock').value||!Number.isSafeInteger(stock)||stock<0||stock>100000)throw Error('Stok promo harus angka bulat 0–100000.');
    return mutateBusiness(state=>{const inventory=state.inventory[id];if(stock>inventory.stock)throw Error('Stok promo tidak boleh melebihi stok utama.');if(active&&(!inventory.active||inventory.stock===0||stock===0))throw Error('Promo hanya dapat diaktifkan jika menu tersedia dan stoknya lebih dari 0.');state.promos[id]={mode,value,price,stock,dailyStock:stock,stockDate:jakartaDate(),active};},'Promo Last Call disimpan.');
  }catch(error){showToast(error.message)}
}
$('promoAdminList').addEventListener('click',event=>{
  if(!isAdmin())return;const button=event.target.closest('button');if(!button)return;
  if(button.dataset.editPromo){selectedPromoMenu=button.dataset.editPromo;renderPromoAdmin(readOrderState());$('promoMenu').focus({preventScroll:true});}
  if(button.dataset.togglePromo){const id=button.dataset.togglePromo;mutateBusiness(state=>{const promo=state.promos[id],inventory=state.inventory[id];if(!promo.active&&(!inventory.active||inventory.stock===0||promo.stock===0))throw Error('Menu dan stok promo harus tersedia untuk aktivasi.');promo.active=!promo.active;},'Status promo diperbarui.');}
});


function initialBusiness(){const inventory=Object.fromEntries(menuCatalog.map(menu=>[menu.id,{stock:menu.service?null:20,active:true}]));return {inventory,partners:Object.fromEntries(partnerNames.map(name=>[name,{capacity:5,slots:{}}])),promos:initialPromos(inventory)}}
function validateBusiness(state){
  if(!state.inventory||!state.partners)throw Error('Data operasional belum tersedia.');
  for(const menu of menuCatalog){const item=state.inventory[menu.id];if(!item||typeof item.active!=='boolean'||(menu.service?item.stock!==null:!Number.isSafeInteger(item.stock)||item.stock<0))throw Error('Data stok tidak valid.');}
  for(const name of partnerNames){const partner=state.partners[name];if(!partner||!Number.isSafeInteger(partner.capacity)||partner.capacity<1||partner.capacity>1000||!partner.slots||typeof partner.slots!=='object')throw Error('Kapasitas tidak valid.');for(const [time,value]of Object.entries(partner.slots)){if(!slotList.includes(time)||typeof value.closed!=='boolean'||!Number.isSafeInteger(value.capacity)||value.capacity<1||value.capacity>1000)throw Error('Slot tidak valid.');}}
  validatePromos(state);return state;
}
function hydrateState(state){
  // Upgrade the existing receipt format without changing its IDs, prices or counter.
  if(!state.inventory&&!state.partners){Object.assign(state,initialBusiness());for(const order of state.orders){order.items.forEach(item=>{item.tenant=oldPartners[item.tenant]||item.tenant;const menu=menuCatalog.find(menu=>menu.name===item.name&&menu.tenant===item.tenant);if(menu){item.menuId=menu.id;if(!menu.service&&jakartaDate(order.createdAt)===jakartaDate())state.inventory[menu.id].stock=Math.max(0,state.inventory[menu.id].stock-item.qty);}});}}
  hydratePromos(state);return validateBusiness(state);
}
function safeState(){try{return readOrderState()}catch{return null}}
function menuStatus(menu,state){
  const item=state?.inventory[menu.id];
  if(!item)return {label:'Belum tersedia',kind:'off',available:false};
  if(!item.active)return {label:'Tidak tersedia',kind:'off',available:false};
  if(!menu.service&&item.stock===0)return {label:'Habis hari ini',kind:'empty',available:false};
  return {label:menu.service?'Tersedia':item.stock<=5?'Tersisa sedikit':'Tersedia',kind:!menu.service&&item.stock<=5?'low':'available',available:true};
}
function stockBadge(menu,state){const status=menuStatus(menu,state);return `<span class="stock-badge stock-${status.kind}">${status.label}${!menu.service&&status.available?' · '+state.inventory[menu.id].stock:''}</span>`}
function cartQuantity(menuId){return cart.filter(item=>item.menuId===menuId).reduce((sum,item)=>sum+item.qty,0)}
function menuRow(menu,state){
  const qty=cartQuantity(menu.id),promo=currentPromo(menu,state),status=menuStatus(menu,state),limit=!menu.service&&(qty>=(state?.inventory[menu.id]?.stock||0)||promo&&promoCartQuantity(menu.id)>=promo.stock);
  const illustration=categoryIllustrations[menu.category]||'<rect x="30" y="48" width="68" height="44" rx="7"/><path d="M43 48V24h42v24M43 78h42v31H43ZM79 61h6M50 88h28M50 97h20"/>';
  const visual=menu.photo?`<div class="food-photo dish-photo" role="img" aria-label="Ilustrasi ${escapeHTML(menu.name)}" style="--photo-x:${menu.photo.x}%;--photo-y:${menu.photo.y}%"></div>`:`<div class="dish-photo category-placeholder" role="img" aria-label="Ilustrasi ${categoryNames[menu.category]}"><svg viewBox="0 0 128 128" aria-hidden="true" fill="var(--soft-accent)" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${illustration}</svg><span>Ilustrasi · ${categoryNames[menu.category]}</span></div>`;
  return `<article class="dish${qty?' chosen':''}" data-menu-id="${menu.id}" data-category="${menu.category}"><div class="dish-media">${visual}${qty?`<span class="dish-selected">${qty} di tas ✓</span>`:''}</div><div class="dish-body"><span class="dish-type">${escapeHTML(menu.tenant)} · ${categoryNames[menu.category]}</span><h4>${escapeHTML(menu.name)}</h4><p>${escapeHTML(menu.description)}</p>${promo?'<span class="menu-hemat-badge">Menu Hemat</span>':''}${promoStockBadge(menu,state,promo)}<div class="dish-bottom">${menuPriceHTML(menu,promo)}<button class="add" data-add-menu="${menu.id}" ${!status.available||limit?'disabled':''} aria-label="${menu.service?'Isi detail':'Tambah'} ${escapeHTML(menu.name)} dari ${escapeHTML(menu.tenant)}">${menu.service?'↗':'+'}</button></div></div></article>`;
}
function menuMatchesQuery(menu,query){return (menu.tenant+' '+menu.name+' '+menu.description+' '+categoryNames[menu.category]).toLocaleLowerCase('id-ID').includes(query)}
function renderMenu(){
  const q=$('searchInput').value.trim().toLocaleLowerCase('id-ID'),state=safeState();renderLastCall(state);
  const visible=menuCatalog.filter(menu=>(tenant==='all'||menu.tenant===tenant)&&(!q||menuMatchesQuery(menu,q))&&(category==='all'||menu.category===category)&&(!promoOnly||currentPromo(menu,state))).sort((a,b)=>menuAlphabet.compare(a.name,b.name));
  $('tenantTitle').textContent=q?'Hasil pencarian':promoOnly?'Last Call: Menu Hemat':tenant!=='all'?'Pilihan '+tenant:categoryNames[category];
  $('tenantSub').textContent=visible.length+' produk & layanan · A–Z · Operasional 06.30–17.00';
  $('searchHint').textContent=q?visible.length+' pilihan ditemukan untuk “'+$('searchInput').value.trim()+'”.':'Coba cari ‘bubur’, ‘croissant’, atau ‘print’.';
  $('clearSearch').hidden=!q;$('resetFilter').hidden=!q&&category==='all'&&tenant==='all'&&!promoOnly;
  $('menuList').innerHTML=visible.length?visible.map(menu=>menuRow(menu,state)).join(''):'<div class="no-result">Pilihan belum ditemukan.<br>Coba kata lain atau reset filter.</div>';
  document.querySelectorAll('.category-bar [data-category]').forEach(button=>{const active=button.dataset.category===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
  document.querySelectorAll('.tenant[data-tenant]').forEach(card=>{card.hidden=!!q&&!menus[card.dataset.tenant].some(menu=>menuMatchesQuery(menu,q))});
  $('partnerSelect').value=tenant;
}
function chooseCategory(value){if(!Object.hasOwn(categoryNames,value))return;category=value;renderMenu()}
function resetFilters(){promoOnly=false;tenant='all';category='all';$('searchInput').value='';renderMenu()}
function searchMenus(){renderMenu()}
function clearSearch(){$('searchInput').value='';renderMenu();$('searchInput').focus()}
function chooseTenant(value){if(value!=='all'&&!partnerNames.includes(value))return;tenant=value;category='all';renderMenu()}
function choosePartnerFilter(value){if(value!=='all'&&!partnerNames.includes(value))return;tenant=value;renderMenu()}
function saveCart(){
  if(currentUser?.role!=='buyer')return;
  try{const all=readLocal(cartKey,{});all[currentUser.email]={items:cart,slot};localStorage.setItem(cartKey,JSON.stringify(all))}catch{cartMessage='Keranjang belum dapat disimpan. Pastikan penyimpanan browser aktif.';}
}
function restoreCart(){
  cart=[];cartMessage='';slot=slotList[0];if(currentUser?.role!=='buyer')return;
  const saved=readLocal(cartKey,{})[currentUser.email];if(!saved)return;
  if(slotList.includes(saved.slot))slot=saved.slot;
  for(const item of Array.isArray(saved.items)?saved.items:[]){try{const menu=menuCatalog.find(menu=>menu.id===item.menuId);if(!menu||!Number.isSafeInteger(item.qty)||item.qty<1)continue;const price=menu.service?servicePrice(menu.id,item.details):item.promotion==='last-call'&&Number.isSafeInteger(item.price)&&item.price>0?item.price:menu.price;cart.push({...item,cartId:item.cartId||crypto.randomUUID(),tenant:menu.tenant,name:menu.name,price});}catch{cartMessage='Detail layanan lama tidak valid. Pilih layanan kembali.';}}
}
function reconcileCart(state){
  if(!state)return false;
  const remaining=Object.fromEntries(menuCatalog.filter(menu=>!menu.service).map(menu=>[menu.id,state.inventory[menu.id].stock])),promoRemaining=Object.fromEntries(Object.entries(state.promos).map(([id,promo])=>[id,promo.stock]));let changed=false;const notes=[];
  cart=cart.flatMap(item=>{const menu=menuCatalog.find(menu=>menu.id===item.menuId),status=menu&&menuStatus(menu,state);if(!status?.available){notes.push((status?.kind==='empty'?'Produk habis: ':'Tidak tersedia: ')+item.name+' dihapus dari tas.');changed=true;return [];}
    const problem=promoItemProblem(item,menu,state);if(problem){notes.push(problem);changed=true;return [];}
    if(!menu.service){const qty=Math.min(item.qty,remaining[menu.id],item.promotion==='last-call'?promoRemaining[menu.id]:Infinity);remaining[menu.id]-=qty;if(item.promotion==='last-call')promoRemaining[menu.id]-=qty;if(qty!==item.qty){notes.push(item.name+': jumlah disesuaikan menjadi '+qty+' sesuai '+(item.promotion==='last-call'?'stok promo':'stok')+' terbaru.');changed=true;}if(!qty)return [];item.qty=qty;return [item];}return [item];});
  if(changed){cartMessage=notes.join(' ');saveCart();}return changed;
}
function addMenu(id){
  if(currentUser?.role!=='buyer')return showToast('Masuk sebagai pembeli untuk memesan.');
  const menu=menuCatalog.find(menu=>menu.id===id),state=safeState();if(!menu)return;
  const status=menuStatus(menu,state);if(!status.available)return showToast(status.kind==='empty'?'Produk habis: '+menu.name+'.':menu.name+' tidak tersedia.');
  if(menu.service)return openServiceDialog(menu.id);
  const promo=currentPromo(menu,state);if(promo&&promoCartQuantity(id)>=promo.stock)return showToast('Stok promo habis atau seluruh kuota promo sudah di tas.');
  if(cartQuantity(id)>=state.inventory[id].stock)return showToast('Jumlah '+menu.name+' sudah mencapai stok yang tersedia.');
  const promotion=promo?'last-call':undefined,found=cart.find(item=>item.menuId===id&&item.promotion===promotion);if(found)found.qty++;else cart.push({cartId:crypto.randomUUID(),menuId:id,tenant:menu.tenant,name:menu.name,price:promo?.price||menu.price,qty:1,...(promo?{promotion,promoDate:jakartaDate(),originalPrice:menu.price}:{})});choosePromoSlot(state);
  cartMessage='';saveCart();renderCart();renderMenu();showToast(menu.name+' ditambahkan');
}
function addFrom(name,index){const menu=menus[name]?.[index];if(menu)addMenu(menu.id)}
$('menuList').addEventListener('click',event=>{const button=event.target.closest('[data-add-menu]');if(button&&!button.disabled)addMenu(button.dataset.addMenu)});
function renderCatalogDetails(){
  $('menuCount').textContent=menuCatalog.length;
  document.querySelectorAll('[data-tenant-menu-count]').forEach(element=>{const name=element.dataset.tenantMenuCount;element.textContent='Lihat '+menus[name].length+(name===partnerNames[3]?' layanan':' menu')});
  $('inventoryPartner').innerHTML='<option value="all">Semua mitra kampus</option>'+partnerNames.map(name=>`<option>${escapeHTML(name)}</option>`).join('');
}
function increaseItem(index){
  if(currentUser?.role!=='buyer'||!cart[index])return;
  const item=cart[index],menu=menuCatalog.find(menu=>menu.id===item.menuId),state=safeState();if(reconcileCart(state)){renderCart();renderMenu();return;}
  if(!menuStatus(menu,state).available)return showToast('Item tidak tersedia.');
  if(item.promotion==='last-call'&&promoCartQuantity(item.menuId)>=state.promos[item.menuId].stock)return showToast('Jumlah sudah mencapai stok promo yang tersedia.');
  if(!menu.service&&cartQuantity(item.menuId)>=state.inventory[item.menuId].stock)return showToast('Jumlah tidak boleh melebihi stok '+menu.name+'.');
  if(menu.service&&item.qty>=100)return showToast('Maksimal 100 paket layanan per item.');item.qty++;cartMessage='';saveCart();renderCart();renderMenu();
}
function removeItem(index){if(currentUser?.role!=='buyer'||!cart[index])return;if(cart[index].qty>1)cart[index].qty--;else cart.splice(index,1);cartMessage='';saveCart();renderCart();renderMenu()}
function emptyCart(){cart=[];cartMessage='';saveCart();renderCart();renderMenu()}
function groupedCart(){const groups=new Map();cart.forEach((item,index)=>{if(!groups.has(item.tenant))groups.set(item.tenant,[]);groups.get(item.tenant).push({...item,index})});return Array.from(groups,([name,items])=>({name,items,subtotal:items.reduce((sum,item)=>sum+item.price*item.qty,0)}))}
function serviceDetailHTML(item){
  if(!item.details)return '';
  const labels={color:'Cetak',pages:'Halaman',sheets:'Lembar',copies:'Rangkap',sides:'Sisi',format:'Format',cover:'Cover',size:'Ukuran',fileName:'File'};
  return `<small class="service-detail">${Object.entries(item.details).filter(([key])=>labels[key]).map(([key,value])=>escapeHTML(labels[key])+': '+escapeHTML(value)).join(' · ')}${item.details.fileName?'<br>Simulasi lokal · File belum dikirim sungguhan.':''}</small>`;
}
function renderCart(){
  const count=cart.reduce((sum,item)=>sum+item.qty,0),total=cart.reduce((sum,item)=>sum+item.price*item.qty,0),groups=groupedCart();
  $('cartCount').textContent=count;$('cartTenant').textContent=count?count+' item/paket dari '+groups.length+' mitra kampus':'';
  $('empty').style.display=count?'none':'block';$('summary').classList.toggle('show',!!count||!!cartMessage);
  $('cartWarning').textContent=cartMessage;$('cartWarning').hidden=!cartMessage;
  $('items').innerHTML=groups.map(group=>`<section class="cart-group"><h4>${escapeHTML(group.name)}</h4>${group.items.map(item=>`<div class="cart-item"><div class="cart-item-head"><span>${escapeHTML(item.name)}${promoReceiptHTML(item)}${serviceDetailHTML(item)}</span><b>${rupiah(item.price*item.qty)}</b></div><div class="quantity"><button aria-label="Kurangi ${escapeHTML(item.name)}" onclick="removeItem(${item.index})">−</button><span>${item.qty}</span><button aria-label="Tambah ${escapeHTML(item.name)}" onclick="increaseItem(${item.index})">+</button></div>${item.details?'<small class="package-note">Jumlah di atas = paket layanan dengan detail yang sama.</small>':''}</div>`).join('')}<div class="cart-subtotal"><span>Subtotal mitra kampus</span><b>${rupiah(group.subtotal)}</b></div></section>`).join('')+(count?'<button class="link-btn" onclick="emptyCart()">Kosongkan pesanan</button>':'');
  $('total').textContent=rupiah(total);renderSlots(safeState());
}
function slotInfo(state,partner,time){
  const config=state.partners[partner],override=config.slots[time],capacity=override?.capacity||config.capacity;
  const used=state.orders.filter(order=>jakartaDate(order.createdAt)===jakartaDate()&&order.slot===time&&order.items.some(item=>(oldPartners[item.tenant]||item.tenant)===partner)).length;
  const closed=!!override?.closed,full=used>=capacity,near=!full&&capacity-used<=Math.max(1,Math.ceil(capacity*.2));
  return {capacity,used,closed,kind:closed?'closed':full?'full':near?'near':'available',label:closed?'Ditutup':full?'Penuh':near?'Hampir penuh':'Tersedia',available:!closed&&!full};
}
function renderSlots(state){
  const partners=[...new Set(cart.map(item=>item.tenant))],hasPromo=cart.some(item=>item.promotion==='last-call');
  $('slots').innerHTML=slotList.map(time=>{const infos=state?partners.map(name=>slotInfo(state,name,time)):[],unavailable=!state||infos.some(info=>!info.available)||hasPromo&&!lastCallSlot(time),kind=!state?'closed':infos.some(info=>info.closed)?'closed':infos.some(info=>info.kind==='full')?'full':infos.some(info=>info.kind==='near')?'near':'available';
    return `<button class="slot slot-${kind}${slot===time?' selected':''}" data-slot="${time}" aria-pressed="${slot===time}" ${unavailable?'disabled':''}>${time}<small>${hasPromo&&!lastCallSlot(time)?'Lewat / promo berakhir':{closed:'Ditutup',full:'Penuh',near:'Hampir penuh',available:'Tersedia'}[kind]}</small></button>`}).join('');
  const valid=state&&slotList.includes(slot)&&partners.every(name=>slotInfo(state,name,slot).available)&&(!hasPromo||lastCallSlot(slot));
  $('slotAvailability').innerHTML=state?`<b>Slot ${slot} · Hari ini</b>${hasPromo?'<p>Menu Hemat: ambil dalam slot yang belum berakhir, sebelum 17.00 WIB.</p>':''}`+partners.map(name=>{const info=slotInfo(state,name,slot);return `<p>${escapeHTML(name)}: <span class="slot-label-${info.kind}">${info.label}</span> · ${info.used}/${info.capacity} pesanan</p>`}).join(''):'Penyimpanan operasional belum dapat dibaca.';
  $('checkoutButton').disabled=checkoutBusy||!cart.length||!valid;
}
$('slots').addEventListener('click',event=>{const button=event.target.closest('[data-slot]');if(!button||button.disabled)return;slot=button.dataset.slot;saveCart();renderSlots(safeState())});
function refreshBusiness(){const state=safeState();reconcileCart(state);renderMenu();renderCart();renderOrders();if(state?.lastResetAt!==undefined){if($('lastOrderNotice').hidden===false&&!state.orders.some(order=>order.queueNumber===$('lastOrderNumber').textContent))$('lastOrderNotice').hidden=true;}}
async function checkout(){
  if(checkoutBusy)return;
  if(currentUser?.role!=='buyer')return showToast('Masuk sebagai pembeli untuk membuat pesanan.');
  const fresh=safeState();if(!fresh)return showToast('Pesanan belum bisa disimpan. Data operasional tidak dapat dibaca.');
  if(reconcileCart(fresh)){renderCart();renderMenu();showToast('Stok berubah. Periksa jumlah terbaru di tas sebelum checkout.');return;}
  if(!cart.length)return showToast('Pilih produk atau layanan terlebih dahulu.');
  checkoutBusy=true;$('checkoutButton').disabled=true;
  const buyer={...currentUser},selectedSlot=slot,snapshot=structuredClone(cart),partners=[...new Set(snapshot.map(item=>item.tenant))];
  try{
    const order=await withDataLock(ordersKey,()=>{
      if(currentUser?.role!=='buyer'||currentUser.sessionId!==buyer.sessionId)throw Error('Sesi pembeli berubah. Masuk kembali.');
      const state=readOrderState();if(snapshot.some(item=>item.promotion==='last-call')&&!lastCallSlot(selectedSlot))throw Error('Promo Last Call berakhir atau slot sudah lewat. Ambil sebelum 17.00 WIB.');if(!slotList.includes(selectedSlot))throw Error('Pilih slot antara 06.30 dan 17.00.');
      for(const name of partners){const info=slotInfo(state,name,selectedSlot);if(info.closed)throw Error('Slot waktu ditutup: '+name+'. Pilih slot lain.');if(!info.available)throw Error('Slot waktu penuh: '+name+'. Pilih slot lain.');}
      const quantities={},promoQuantities={};for(const item of snapshot){const menu=menuCatalog.find(menu=>menu.id===item.menuId);if(!menu)throw Error('Item tidak dikenali.');const status=menuStatus(menu,state);if(!status.available)throw Error((status.kind==='empty'?'Produk habis: ':'Tidak tersedia: ')+menu.name+'.');const problem=promoItemProblem(item,menu,state);if(problem)throw Error(problem);if(item.promotion==='last-call')promoQuantities[menu.id]=(promoQuantities[menu.id]||0)+item.qty;if(item.price!==(menu.service?servicePrice(menu.id,item.details):item.promotion==='last-call'?state.promos[menu.id].price:menu.price))throw Error('Harga berubah. Tambahkan item kembali.');quantities[menu.id]=(quantities[menu.id]||0)+item.qty;}
      for(const [id,qty]of Object.entries(promoQuantities)){if(qty>state.promos[id].stock)throw Error('Stok promo berubah. Periksa jumlah terbaru di tas.');state.promos[id].stock-=qty;}
      for(const [id,qty]of Object.entries(quantities)){const inventory=state.inventory[id];if(inventory.stock!==null){if(qty>inventory.stock)throw Error('Stok berubah. Periksa jumlah terbaru di tas.');inventory.stock-=qty;}}
      const number=Math.max(state.lastQueueNumber,...state.orders.map(order=>order.queueSequence),0)+1,createdAt=new Date().toISOString();
      const order={id:crypto.randomUUID(),queueSequence:number,queueNumber:queueNumber(number),buyerName:buyer.name,buyerEmail:buyer.email,items:snapshot,total:snapshot.reduce((sum,item)=>sum+item.price*item.qty,0),slot:selectedSlot,status:'waiting',createdAt,statusHistory:[{status:'waiting',at:createdAt}]};
      saveOrderState({...state,lastQueueNumber:number,orders:[...state.orders,order]});return order;
    });
    snapshot.forEach(item=>{const active=cart.find(candidate=>candidate.cartId===item.cartId);if(active)active.qty-=item.qty});cart=cart.filter(item=>item.qty>0);cartMessage='';saveCart();buyerFilter='all';refreshBusiness();
    $('lastOrderNumber').textContent=order.queueNumber;$('lastOrderDetails').innerHTML=orderCard(order,false);$('lastOrderNotice').hidden=false;navigateTo('pesanan-saya');showToast('Pesanan '+order.queueNumber+' berhasil dibuat.');
  }catch(error){cartMessage=/^(Slot waktu|Pilih slot|Produk habis|Tidak tersedia|Stok|Harga|Promo|Sesi pembeli)/.test(error.message)?error.message:'Pesanan belum tersimpan. Periksa penyimpanan browser lalu coba lagi; item di tas tetap ada.';refreshBusiness();showToast(cartMessage);}
  finally{checkoutBusy=false;renderSlots(safeState())}
}
function numberField(name,label,max=5000){return `<label>${label}<input name="${name}" type="number" min="1" max="${max}" step="1" value="1" required></label>`}
function selectField(name,label,values){return `<label>${label}<select name="${name}">${values.map(value=>`<option>${value}</option>`).join('')}</select></label>`}
function openServiceDialog(id){
  serviceMenuId=id;const menu=menuCatalog.find(menu=>menu.id===id);$('serviceTitle').textContent=menu.name;$('serviceError').textContent='';
  const color=selectField('color','Pilihan cetak',['Hitam-putih','Warna']),copies=numberField('copies','Jumlah rangkap',100);
  const fields={fotokopi:color+numberField('sheets','Jumlah lembar')+copies,'print-dokumen':'<label class="full-field">File simulasi<input name="file" type="file" required></label><p id="serviceFileName" class="file-notice full-field">Belum ada file dipilih. File belum dikirim sungguhan; hanya nama file disimpan.</p>'+color+selectField('sides','Sisi cetak',['Satu sisi','Dua sisi'])+copies,'scan-dokumen':numberField('pages','Jumlah halaman')+selectField('format','Format hasil',['PDF','JPG']),'jilid-spiral':numberField('pages','Jumlah halaman')+selectField('cover','Warna cover',['Pink','Biru','Hitam','Putih','Transparan'])+copies,laminating:selectField('size','Ukuran',['A4','A3'])+numberField('sheets','Jumlah lembar')};
  $('serviceFields').innerHTML=fields[id];updateServicePreview();$('serviceDialog').showModal();
}
function closeServiceDialog(){$('serviceDialog').close();const button=document.querySelector(`[data-add-menu="${serviceMenuId}"]`);button?.focus({preventScroll:true});serviceMenuId=null;}
function getServiceDetails(){const data=new FormData($('serviceForm')),details={};for(const [key,value]of data){if(key==='file'){if(value.name)details.fileName=value.name;}else details[key]=['pages','sheets','copies'].includes(key)?Number(value):value;}return details;}
function servicePrice(id,details,preview=false){
  if(!details||typeof details!=='object')throw Error('Isi detail layanan.');
  const integer=(key,max=5000)=>{if(!Number.isSafeInteger(details[key])||details[key]<1||details[key]>max)throw Error('Jumlah harus berupa angka bulat positif, maksimal '+max+'.');return details[key]},choice=(key,values)=>{if(!values.includes(details[key]))throw Error('Pilih '+key+' yang valid.');return details[key]};
  if(id==='fotokopi')return integer('sheets')*integer('copies',100)*(choice('color',['Hitam-putih','Warna'])==='Warna'?1500:500);
  if(id==='print-dokumen'){if(!preview&&(typeof details.fileName!=='string'||!details.fileName.trim()))throw Error('Pilih file simulasi terlebih dahulu.');choice('sides',['Satu sisi','Dua sisi']);return integer('copies',100)*(choice('color',['Hitam-putih','Warna'])==='Warna'?5000:2000);}
  if(id==='scan-dokumen'){choice('format',['PDF','JPG']);return integer('pages')*1000;}
  if(id==='jilid-spiral'){choice('cover',['Pink','Biru','Hitam','Putih','Transparan']);return Math.ceil(integer('pages')/100)*8000*integer('copies',100);}
  if(id==='laminating')return integer('sheets')*(choice('size',['A4','A3'])==='A3'?8000:4000);
  throw Error('Layanan tidak dikenali.');
}
function updateServicePreview(){if(!serviceMenuId)return;try{$('servicePrice').textContent='Harga per paket: '+rupiah(servicePrice(serviceMenuId,getServiceDetails(),true))+(serviceMenuId==='print-dokumen'?' · Tarif simulasi per file/rangkap.':'')}catch{$('servicePrice').textContent='Isi detail dengan angka dan pilihan yang valid.'}}
$('serviceForm').addEventListener('input',updateServicePreview);
$('serviceForm').addEventListener('change',event=>{if(event.target.name==='file')$('serviceFileName').textContent=(event.target.files[0]?.name||'Belum ada file dipilih')+' · Simulasi lokal. File belum dikirim sungguhan.';updateServicePreview()});
$('serviceForm').addEventListener('submit',event=>{
  event.preventDefault();if(currentUser?.role!=='buyer')return;
  try{const menu=menuCatalog.find(menu=>menu.id===serviceMenuId),details=getServiceDetails(),price=servicePrice(menu.id,details);if(!menuStatus(menu,safeState()).available)throw Error(menu.name+' tidak tersedia.');
    const existing=cart.find(item=>item.menuId===menu.id&&JSON.stringify(item.details)===JSON.stringify(details));if(existing){if(existing.qty>=100)throw Error('Maksimal 100 paket layanan.');existing.qty++;}else cart.push({cartId:crypto.randomUUID(),menuId:menu.id,tenant:menu.tenant,name:menu.name,price,qty:1,details});
    cartMessage='';saveCart();renderCart();renderMenu();closeServiceDialog();showToast(menu.name+' ditambahkan');
  }catch(error){$('serviceError').textContent=error.message;}
});
function renderManagement(state){
  if(!isAdmin())return;renderPromoAdmin(state);
  const config=state.partners[adminPartner],info=slotInfo(state,adminPartner,adminSlot);
  $('adminSlotControls').innerHTML=`<div class="slot-controls"><label>Mitra kampus<select id="adminPartner" onchange="adminPartner=this.value;renderManagement(readOrderState())">${partnerNames.map(name=>`<option ${name===adminPartner?'selected':''}>${escapeHTML(name)}</option>`).join('')}</select></label><label>Kapasitas standar per slot<input id="defaultCapacity" type="number" min="1" max="1000" step="1" value="${config.capacity}"></label><button class="category" onclick="saveDefaultCapacity()">Simpan kapasitas standar</button><label>Slot 10 menit<select id="adminSlot" onchange="adminSlot=this.value;renderManagement(readOrderState())">${slotList.map(time=>`<option ${time===adminSlot?'selected':''}>${time}</option>`).join('')}</select></label><label>Kapasitas slot ini<input id="specificCapacity" type="number" min="1" max="1000" step="1" value="${info.capacity}"></label><button class="category" onclick="saveSpecificSlot()">Simpan kapasitas slot</button><button class="category ${info.closed?'':'slot-close'}" onclick="toggleAdminSlot()">${info.closed?'Buka slot':'Tutup slot'}</button></div><p class="management-note">${escapeHTML(adminPartner)} · ${adminSlot}: <b>${info.label}</b> · ${info.used}/${info.capacity} pesanan. Kapasitas standar berlaku untuk slot tanpa pengaturan khusus.</p><div class="admin-slot-map">${slotList.map(time=>{const item=slotInfo(state,adminPartner,time);return `<button class="slot slot-${item.kind}${time===adminSlot?' selected':''}" data-admin-time="${time}" aria-pressed="${time===adminSlot}">${time}<small>${item.label} · ${item.used}/${item.capacity}</small></button>`}).join('')}</div>`;
  $('inventoryPartner').value=inventoryPartner;
  $('adminInventory').innerHTML=menuCatalog.filter(menu=>inventoryPartner==='all'||menu.tenant===inventoryPartner).sort((a,b)=>menuAlphabet.compare(a.name,b.name)).map(menu=>{const stock=state.inventory[menu.id];return `<article class="inventory-card"><span class="dish-type">${escapeHTML(menu.tenant)}</span><h3>${escapeHTML(menu.name)}</h3>${stockBadge(menu,state)}${menu.service?'<p>Layanan · Tanpa stok angka</p>':`<div class="stock-controls"><button class="category" data-stock-id="${menu.id}" data-delta="-1" aria-label="Kurangi stok ${escapeHTML(menu.name)}" ${stock.stock===0?'disabled':''}>−</button><label>Stok<input id="stock-${menu.id}" type="number" min="0" max="100000" step="1" value="${stock.stock}"></label><button class="category" data-stock-id="${menu.id}" data-delta="1" aria-label="Tambah stok ${escapeHTML(menu.name)}">+</button><button class="category" data-stock-save="${menu.id}">Simpan</button></div>`}<button class="availability-button category" data-active-id="${menu.id}" aria-pressed="${stock.active}">${stock.active?'Tandai tidak tersedia':'Aktifkan kembali'}</button></article>`}).join('');
}
$('adminSlotControls').addEventListener('click',event=>{const button=event.target.closest('[data-admin-time]');if(button){adminSlot=button.dataset.adminTime;renderManagement(readOrderState())}});
async function mutateBusiness(task,message){
  if(!isAdmin())return;
  try{await withDataLock(ordersKey,()=>{if(!isAdmin())throw Error('Masuk sebagai admin.');const state=readOrderState();task(state);saveOrderState(state)});refreshBusiness();showToast(message)}catch(error){showToast(error.message||'Perubahan belum tersimpan.')}
}
function capacityValue(id){const value=Number($(id).value);if(!$(id).value||!Number.isSafeInteger(value)||value<1||value>1000)throw Error('Kapasitas harus 1–1000 pesanan.');return value;}
function saveDefaultCapacity(){if(!isAdmin())return;try{const value=capacityValue('defaultCapacity'),name=adminPartner;return mutateBusiness(state=>{state.partners[name].capacity=value},'Kapasitas standar diperbarui.')}catch(error){showToast(error.message)}}
function saveSpecificSlot(){if(!isAdmin())return;try{const value=capacityValue('specificCapacity'),name=adminPartner,time=adminSlot;return mutateBusiness(state=>{state.partners[name].slots[time]={capacity:value,closed:!!state.partners[name].slots[time]?.closed}},'Kapasitas slot diperbarui.')}catch(error){showToast(error.message)}}
function toggleAdminSlot(){if(!isAdmin())return;const name=adminPartner,time=adminSlot;return mutateBusiness(state=>{const partner=state.partners[name],existing=partner.slots[time];partner.slots[time]={capacity:existing?.capacity||partner.capacity,closed:!existing?.closed}},'Status slot diperbarui.')}
$('adminInventory').addEventListener('click',event=>{
  if(!isAdmin())return;const button=event.target.closest('button');if(!button)return;
  if(button.dataset.stockId){const id=button.dataset.stockId,delta=Number(button.dataset.delta);mutateBusiness(state=>{state.inventory[id].stock=Math.max(0,state.inventory[id].stock+delta)},'Stok diperbarui.')}
  if(button.dataset.stockSave){const id=button.dataset.stockSave,value=Number($('stock-'+id).value);if(!$('stock-'+id).value||!Number.isSafeInteger(value)||value<0||value>100000)return showToast('Stok harus angka bulat 0–100000.');mutateBusiness(state=>{state.inventory[id].stock=value},'Stok diperbarui.')}
  if(button.dataset.activeId){const id=button.dataset.activeId;mutateBusiness(state=>{state.inventory[id].active=!state.inventory[id].active},'Ketersediaan diperbarui.')}
});
function openResetDialog(){if(isAdmin())$('resetDialog').showModal()}
async function resetDemoToday(){
  if(!isAdmin())return;
  await mutateBusiness(state=>{Object.assign(state,initialBusiness());state.orders=state.orders.filter(order=>jakartaDate(order.createdAt)!==jakartaDate());state.lastResetAt=new Date().toISOString()},'Data demo hari ini berhasil direset. Nomor ANT tetap berlanjut.');$('resetDialog').close();
}

function escapeHTML(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function jakartaDate(value=new Date()){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));
  return ['year','month','day'].map(type=>parts.find(part=>part.type===type).value).join('-');
}
function orderDate(value){return new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value))+' WIB'}
function queueNumber(number){return 'ANT-'+String(number).padStart(3,'0')}
function isAdmin(){return currentUser?.role==='admin'&&currentUser.email===adminEmail}
function withDataLock(key,task){return navigator.locks?navigator.locks.request(key,task):Promise.resolve().then(task)}
function validateOrderState(state){
  if(!state||state.version!==2||!Number.isSafeInteger(state.lastQueueNumber)||state.lastQueueNumber<0||!Array.isArray(state.orders))throw Error('Invalid order storage');
  const ids=new Set(),numbers=new Set();
  for(const order of state.orders){
    if(!order||typeof order.id!=='string'||!/^[\w-]+$/.test(order.id)||ids.has(order.id)||!Number.isSafeInteger(order.queueSequence)||order.queueSequence<1||numbers.has(order.queueSequence)||order.queueNumber!==queueNumber(order.queueSequence)||typeof order.buyerName!=='string'||typeof order.buyerEmail!=='string'||typeof order.slot!=='string'||!Number.isFinite(Date.parse(order.createdAt))||!orderStates.includes(order.status)||!Array.isArray(order.items)||!order.items.length||!Number.isSafeInteger(order.total)||order.total<0||!Array.isArray(order.statusHistory)||!order.statusHistory.length)throw Error('Invalid order');
    if(order.items.some(item=>!item||typeof item.name!=='string'||typeof item.tenant!=='string'||!Number.isSafeInteger(item.price)||item.price<0||!Number.isSafeInteger(item.qty)||item.qty<1)||order.total!==order.items.reduce((sum,item)=>sum+item.price*item.qty,0)||order.statusHistory.some(event=>!event||!orderStates.includes(event.status)||!Number.isFinite(Date.parse(event.at)))||order.statusHistory.at(-1).status!==order.status)throw Error('Invalid order detail');
    if(order.items.some(item=>item.promotion!==undefined&&(item.promotion!=='last-call'||!Number.isSafeInteger(item.originalPrice)||item.originalPrice<=item.price||!/^\d{4}-\d{2}-\d{2}$/.test(item.promoDate))))throw Error('Invalid promo receipt');
    ids.add(order.id);numbers.add(order.queueSequence);
  }
  return state;
}
function readOrderState(){
  const raw=localStorage.getItem(ordersKey);
  if(raw===null){if(localStorage.getItem(legacyOrdersKey)!==null)throw Error('Order migration needed');return hydrateState({version:2,lastQueueNumber:0,orders:[]})}
  return hydrateState(validateOrderState(JSON.parse(raw)));
}
function readOrders(){return readOrderState().orders}
function saveOrderState(state){validateOrderState(state);validateBusiness(state);localStorage.setItem(ordersKey,JSON.stringify(state))}
function migrateOrders(){
  if(localStorage.getItem(ordersKey)!==null){saveOrderState(readOrderState());return}
  const raw=localStorage.getItem(legacyOrdersKey);if(raw===null){saveOrderState(readOrderState());return;}
  const legacy=JSON.parse(raw);if(!Array.isArray(legacy))throw Error('Invalid legacy history');
  const accounts=readAccounts();
  const orders=legacy.slice().sort((a,b)=>Date.parse(a.createdAt)-Date.parse(b.createdAt)||(a.sequence||0)-(b.sequence||0)).map((old,index)=>{
    if(!old||!Array.isArray(old.groups)||!old.groups.length||typeof old.owner!=='string')throw Error('Invalid legacy order');
    const items=old.groups.flatMap(group=>{if(!Array.isArray(group.items))throw Error('Invalid legacy items');return group.items.map(item=>({tenant:group.name,name:item.name,price:item.price,qty:item.qty}))});
    const status=old.groups.every(group=>['picked','completed'].includes(group.status))?'completed':old.groups.every(group=>['ready','picked','completed'].includes(group.status))?'ready':'preparing';
    const account=accounts.find(account=>account.email===old.owner),number=index+1;
    return {id:old.id,queueSequence:number,queueNumber:queueNumber(number),buyerName:account?.name||'Pembeli (pesanan lama)',buyerEmail:old.owner,items,total:items.reduce((sum,item)=>sum+item.price*item.qty,0),slot:old.slot,status,createdAt:old.createdAt,statusHistory:[{status,at:old.createdAt}],legacyReference:old.reference};
  });
  saveOrderState(hydrateState({version:2,lastQueueNumber:orders.length,orders}));
}
function groupOrderItems(order){
  const groups=new Map();order.items.forEach(item=>{if(!groups.has(item.tenant))groups.set(item.tenant,[]);groups.get(item.tenant).push(item)});
  return Array.from(groups,([name,items])=>({name,items,subtotal:items.reduce((sum,item)=>sum+item.price*item.qty,0)}));
}
function statusBadge(status){return `<span class="order-status status-${status}"><span aria-hidden="true">●</span> ${statusLabels[status]}</span>`}
function orderCard(order,admin){
  const groups=groupOrderItems(order),updated=order.statusHistory.at(-1);
  return `<article class="history-card" data-receipt-id="${order.id}"><div class="history-card-head"><div><span class="eyebrow">NOMOR ANTREAN</span><h3 class="receipt-number">${order.queueNumber}</h3><p>${orderDate(order.createdAt)}</p>${admin?`<p class="receipt-buyer"><b>${escapeHTML(order.buyerName)}</b><br>${escapeHTML(order.buyerEmail)}</p>`:''}</div><div class="history-total">${statusBadge(order.status)}<strong>${rupiah(order.total)}</strong><span>Slot ambil ${escapeHTML(order.slot)}</span></div></div><div class="history-groups">${groups.map(group=>`<section class="history-tenant"><h4>${escapeHTML(group.name)}</h4><ul class="history-items">${group.items.map(item=>`<li><span>${item.qty}× ${escapeHTML(item.name)}${promoReceiptHTML(item)}${serviceDetailHTML(item)}</span><b>${rupiah(item.price*item.qty)}</b></li>`).join('')}</ul><div class="history-subtotal"><span>Subtotal mitra kampus</span><b>${rupiah(group.subtotal)}</b></div></section>`).join('')}</div><div class="receipt-footer"><p>Status diperbarui ${orderDate(updated.at)}</p>${order.legacyReference?`<p>Nomor pesanan lama: ${escapeHTML(order.legacyReference)}</p>`:''}${admin&&order.status!=='completed'?`<button class="status-action" data-order-id="${order.id}" data-current-status="${order.status}">${statusActions[order.status]} <span aria-hidden="true">→</span></button>`:''}</div></article>`;
}
function chooseOrderFilter(filter){if(!['all',...orderStates].includes(filter))return;buyerFilter=filter;renderOrders()}
function chooseAdminFilter(filter){if(!isAdmin()||!['all',...orderStates].includes(filter))return;adminFilter=filter;renderOrders()}
function renderFilterButtons(attribute,filter){document.querySelectorAll('['+attribute+']').forEach(button=>{const active=button.getAttribute(attribute)===filter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))})}
function renderOrders(){
  $('orderHistory').innerHTML='';$('adminOrders').innerHTML='';$('adminStats').innerHTML='';
  $('buyerStorageError').hidden=true;$('adminStorageError').hidden=true;
  if(!currentUser)return;
  let orders,state;
  try{state=readOrderState();orders=state.orders}
  catch{const error=$(isAdmin()?'adminStorageError':'buyerStorageError');error.textContent='Pesanan belum bisa dibaca. Pastikan penyimpanan browser aktif. Data lama tidak ditimpa.';error.hidden=false;return}
  if(isAdmin()){
    renderManagement(state);
    const today=orders.filter(order=>jakartaDate(order.createdAt)===jakartaDate());
    $('adminDate').textContent=new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',dateStyle:'full'}).format(new Date())+' · WIB';
    $('adminStats').innerHTML=[['Total pesanan hari ini',today.length],...orderStates.map(status=>[statusLabels[status],today.filter(order=>order.status===status).length])].map(([label,value])=>`<div class="queue-stat"><span>${label}</span><strong>${value}</strong><small>Hari ini · WIB</small></div>`).join('');
    const visible=orders.filter(order=>adminFilter==='all'||order.status===adminFilter).sort((a,b)=>a.queueSequence-b.queueSequence||Date.parse(a.createdAt)-Date.parse(b.createdAt));
    $('adminOrderCount').textContent=visible.length+' pesanan · Diurutkan menurut nomor antrean';
    renderFilterButtons('data-admin-filter',adminFilter);
    $('adminOrders').innerHTML=visible.length?visible.map(order=>orderCard(order,true)).join(''):'<div class="queue-empty"><b>Belum ada pesanan untuk status ini.</b><p>Pesanan pembeli akan muncul setelah checkout.</p></div>';
  }else if(currentUser.role==='buyer'){
    const mine=orders.filter(order=>order.buyerEmail===currentUser.email),visible=mine.filter(order=>buyerFilter==='all'||order.status===buyerFilter).sort((a,b)=>b.queueSequence-a.queueSequence);
    $('buyerOrderCount').textContent=mine.length+' pesanan milikmu · Status diperbarui oleh admin';
    renderFilterButtons('data-buyer-filter',buyerFilter);
    $('orderHistory').innerHTML=visible.length?visible.map(order=>orderCard(order,false)).join(''):`<div class="queue-empty"><b>${mine.length?'Belum ada pesanan dengan status ini.':'Belum ada pesanan.'}</b><p>${mine.length?'Pilih status lain untuk melihat pesananmu.':'Pilih menu favoritmu dan buat pesanan pertamamu.'}</p>${mine.length?'':'<a class="button primary" href="#menu">Pilih menu <span>↗</span></a>'}</div>`;
  }
}
async function advanceOrderStatus(id,expectedStatus){
  if(!isAdmin())return;
  try{
    const result=await withDataLock(ordersKey,()=>{
      if(!isAdmin())return null;
      const state=readOrderState(),order=state.orders.find(order=>order.id===id);
      if(!order||order.status!==expectedStatus||order.status==='completed')return null;
      const next=orderStates[orderStates.indexOf(order.status)+1];order.status=next;order.statusHistory.push({status:next,at:new Date().toISOString()});
      saveOrderState(state);return {number:order.queueNumber,status:next};
    });
    renderOrders();if(result)showToast(result.number+': '+statusLabels[result.status]+'.');
    const button=document.querySelector(`[data-order-id="${id}"]`);if(button)button.focus({preventScroll:true});
  }catch{showToast('Status belum tersimpan. Coba lagi.');renderOrders()}
}
$('adminOrders').addEventListener('click',event=>{const button=event.target.closest('[data-order-id]');if(!button||button.disabled||!isAdmin())return;button.disabled=true;advanceOrderStatus(button.dataset.orderId,button.dataset.currentStatus)});
window.addEventListener('storage',event=>{if(event.key===ordersKey||event.key===null)refreshBusiness();if(event.key===cartKey&&currentUser?.role==='buyer'){restoreCart();refreshBusiness()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshLastCallClock()});
let queueDay=jakartaDate();setInterval(()=>{const day=jakartaDate();if(day!==queueDay){queueDay=day;refreshBusiness()}if(currentUser&&Date.now()>=currentUser.expiresAt)logout()},60000);
function navigateTo(id){
  history.replaceState(null,'','#'+id);const element=$(id);if(!element)return;
  element.scrollIntoView({behavior:'instant'});const heading=element.querySelector('h1,h2')||element;heading.tabIndex=-1;heading.focus({preventScroll:true});
}
function renderAccount(){
  $('loginScreen').hidden=!!currentUser;$('appShell').hidden=!currentUser||currentUser.role!=='buyer';$('adminShell').hidden=!isAdmin();
  $('userActions').hidden=!currentUser||currentUser.role!=='buyer';$('accountName').textContent=currentUser?'Halo, '+currentUser.name:'';
}
function setAuthMode(mode){
  authMode=mode;const register=mode==='register';
  $('authTitle').textContent=register?'Buat akun':'Selamat datang!';$('nameField').hidden=!register;$('confirmField').hidden=!register;
  $('authDescription').textContent=(register?'Buat akun':'Masuk')+' untuk memilih produk atau layanan dan mengatur waktu pengambilan pesananmu.';
  $('authPassword').placeholder=register?'Minimal 6 karakter':'Masukkan kata sandimu';$('authPassword').minLength=register?6:1;
  $('authName').required=register;$('authConfirm').required=register;$('authEmail').autocomplete=register?'email':'username';$('authPassword').autocomplete=register?'new-password':'current-password';
  $('loginOptions').hidden=register;$('demoLogin').hidden=register;
  $('loginSwitch').innerHTML=register?"Sudah punya akun? <button type='button' onclick=\"setAuthMode('login')\">Masuk</button>":"Baru di Antreless? <button type='button' onclick=\"setAuthMode('register')\">Buat akun</button>";
  $('authSubmit').textContent=register?'Buat akun':'Masuk';$('authError').textContent='';$('authPassword').value='';$('authConfirm').value='';
  $('authPassword').type='password';$('passwordToggle').textContent='Lihat';$('passwordToggle').setAttribute('aria-label','Tampilkan kata sandi');$('passwordToggle').setAttribute('aria-pressed','false');
  (register?$('authName'):$('authEmail')).focus();
}
function openForgotDialog(){if(!$('forgotDialog').open)$('forgotDialog').showModal()}
function closeForgotDialog(){$('forgotDialog').close();$('forgotLink').focus()}
function togglePassword(){const show=$('authPassword').type==='password';$('authPassword').type=show?'text':'password';$('passwordToggle').textContent=show?'Sembunyikan':'Lihat';$('passwordToggle').setAttribute('aria-label',show?'Sembunyikan kata sandi':'Tampilkan kata sandi');$('passwordToggle').setAttribute('aria-pressed',String(show))}
async function passwordHash(password,salt){const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:120000,hash:'SHA-256'},material,256);return Array.from(new Uint8Array(bits),x=>x.toString(16).padStart(2,'0')).join('')}
async function initializeAccounts(){
  const adminSalt='antreless-admin-demo-v1',demoSalt='antreless-buyer-demo-v1';
  const [adminHash,demoHash]=await Promise.all([passwordHash('admin',adminSalt),passwordHash('demo123',demoSalt)]);
  await withDataLock(accountKey,()=>{
    const accounts=readAccounts();
    const buyers=accounts.filter(account=>account&&typeof account.email==='string'&&account.email!==adminEmail).map(account=>({...account,role:'buyer'}));
    if(!buyers.some(account=>account.email===buyerDemoEmail))buyers.push({name:'Pembeli Demo',email:buyerDemoEmail,salt:demoSalt,hash:demoHash,role:'buyer',demo:true});
    localStorage.setItem(accountKey,JSON.stringify([...buyers,{name:'Admin Antreless',email:adminEmail,salt:adminSalt,hash:adminHash,role:'admin'}]));
  });
}
function writeSession(user,remember){
  const now=Date.now(),session={name:user.name,email:user.email,role:user.role,demo:!!user.demo,remember:!!remember,sessionId:crypto.randomUUID(),createdAt:now,expiresAt:now+(remember?30:0.5)*86400000};
  localStorage.setItem(sessionKey,JSON.stringify(session));sessionStorage.setItem(sessionTabKey,session.sessionId);sessionStorage.removeItem(sessionKey);return session;
}
function startSession(user,remember=$('rememberMe').checked){
  closeLastCall();promoOnly=false;currentUser=writeSession(user,remember);buyerFilter='all';adminFilter='all';$('lastOrderNotice').hidden=true;
  restoreCart();refreshBusiness();renderAccount();navigateTo(isAdmin()?'dashboard-admin':'beranda');showToast('Berhasil masuk. Halo, '+user.name+'!');maybeShowLastCall();
}
async function initializeApp(){
  await initializeAccounts();
  try{await withDataLock(ordersKey,migrateOrders)}catch{ /* Preserve unreadable history for recovery. */ }
  const localSession=readLocal(sessionKey,null),session=localSession||readSession(sessionKey,null),accounts=readAccounts();
  const account=session&&accounts.find(account=>account.email===session.email);
  // Derive access from the registered account, never from a role supplied at signup.
  const sameTab=session&&!session.sessionId||session?.remember||session?.sessionId===sessionStorage.getItem(sessionTabKey);
  if(account&&account.hash&&account.salt&&(account.role!=='admin'||session.role==='admin')&&sameTab&&(!session.expiresAt||Date.now()<session.expiresAt)){
    currentUser=session.expiresAt?{...session,name:account.name,role:account.role}:writeSession(account,!!localSession);
    $('rememberMe').checked=!!currentUser.remember;restoreCart();refreshBusiness();renderAccount();
    if(isAdmin())navigateTo('dashboard-admin');
    else if(location.hash==='#pesanan-saya')navigateTo('pesanan-saya');
    else if(location.hash==='#dashboard-admin')navigateTo('beranda');
  }else{if(!session||!account||session.expiresAt&&Date.now()>=session.expiresAt){localStorage.removeItem(sessionKey);sessionStorage.removeItem(sessionKey)}renderAccount();renderOrders()}
  await maybeShowLastCall();
}
async function submitAuth(event){
  event.preventDefault();if(authBusy)return;
  const mode=authMode,name=$('authName').value.trim(),email=$('authEmail').value.trim().toLowerCase(),password=$('authPassword').value,confirm=$('authConfirm').value;
  $('authError').textContent='';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){$('authError').textContent='Masukkan format email yang benar.';$('authEmail').focus();return}
  if(mode==='register'&&email===adminEmail){$('authError').textContent='Email ini khusus akun admin. Gunakan email lain untuk mendaftar.';$('authEmail').focus();return}
  if(mode==='register'&&password.length<6){$('authError').textContent='Kata sandi minimal 6 karakter.';$('authPassword').focus();return}
  if(!password){$('authError').textContent='Masukkan kata sandimu.';$('authPassword').focus();return}
  if(mode==='register'&&(!name||name.length>40)){$('authError').textContent='Isi nama panggilan, maksimal 40 karakter.';$('authName').focus();return}
  if(mode==='register'&&password!==confirm){$('authError').textContent='Kata sandi dan konfirmasi belum sama.';$('authConfirm').focus();return}
  authBusy=true;$('authSubmit').disabled=true;$('authSubmit').textContent='Memproses…';
  try{
    await appReady;let user;
    if(mode==='register'){
      const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join(''),hash=await passwordHash(password,salt);
      user=await withDataLock(accountKey,()=>{
        const accounts=readAccounts();
        if(accounts.some(account=>account.email===email))throw Error('Email ini sudah terdaftar. Pilih Masuk.');
        const buyer={name,email,salt,hash,role:'buyer'};localStorage.setItem(accountKey,JSON.stringify([...accounts,buyer]));return buyer;
      });
    }else{
      const accounts=readAccounts();user=accounts.find(account=>account.email===email);
      if(!user||!user.salt||!user.hash||await passwordHash(password,user.salt)!==user.hash)throw Error('Email atau kata sandi belum cocok. Kalau belum punya akun, pilih Buat akun.');
    }
    startSession(user);
  }catch(error){const message=error instanceof Error?error.message:'';$('authError').textContent=message.startsWith('Email ini')||message.startsWith('Email atau kata sandi')?message:'Tidak dapat menyimpan atau memeriksa akun. Pastikan penyimpanan browser aktif lalu coba lagi.'}
  finally{authBusy=false;$('authSubmit').disabled=false;$('authSubmit').textContent=authMode==='register'?'Buat akun':'Masuk'}
}
async function loginBuyerDemo(){
  if(authBusy)return;authBusy=true;$('demoLogin').disabled=true;
  try{await appReady;const account=readAccounts().find(account=>account.email===buyerDemoEmail);startSession({...account,role:'buyer'})}
  catch{$('authError').textContent='Tidak dapat membuka akun demo. Pastikan penyimpanan browser aktif.'}
  finally{authBusy=false;$('demoLogin').disabled=false}
}
function logout(){
  try{localStorage.removeItem(sessionKey);sessionStorage.removeItem(sessionKey);sessionStorage.removeItem(sessionTabKey)}catch{}
  closeLastCall();promoOnly=false;currentUser=null;cart=[];cartMessage='';renderCart();renderMenu();if($('serviceDialog').open)$('serviceDialog').close();$('lastOrderNotice').hidden=true;renderAccount();renderOrders();setAuthMode('login');
  $('authEmail').value='';$('authPassword').value='';$('rememberMe').checked=false;history.replaceState(null,'',location.pathname+location.search);window.scrollTo(0,0);showToast('Kamu sudah keluar.');$('authEmail').focus();
}
$('authForm').addEventListener('submit',submitAuth);
renderCatalogDetails();renderMenu();renderCart();renderAccount();renderOrders();
const appReady=initializeApp();
appReady.catch(()=>{$('authError').textContent='Akun belum dapat dimuat. Jalankan melalui localhost dan pastikan penyimpanan browser aktif.'});


scheduleLastCallClock();


