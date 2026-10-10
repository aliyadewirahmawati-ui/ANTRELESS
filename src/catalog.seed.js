// Transcribed reference data, NOT photo-verified or ready for real transactions.
const id=(group,n)=>`${group}0000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
export const seedKantin=[{id:id(0,1),name:'Kantin Demo',pickup_location:'Detail lokasi belum diisi',opens_at:'06:30:00',closes_at:'17:00:00',accepting_orders:false,is_demo:true}];
const rows=[
 ['Mie Ayam Polos','Mie',12000],['Mie Ayam Bakso','Mie',15000],['Indomie Rebus','Mie',6000],['Indomie Goreng','Mie',6000],['Indomie Rebus + Telur','Mie',10000],['Indomie Goreng + Telur','Mie',10000],['Pop Mie','Mie',8000],
 ['Nasi Goreng + Telur','Nasi Goreng',12000],['Nasi Goreng Cikur + Telur','Nasi Goreng',12000],['Nasi Goreng Sambal Matah + Telur','Nasi Goreng',12000],['Nasi Goreng Sosis + Telur','Nasi Goreng',15000],['Nasi Goreng Ayam + Telur','Nasi Goreng',15000],['Nasi Goreng Saus Keju + Telur','Nasi Goreng',13000],['Nasi Goreng Spesial','Nasi Goreng',18000],['Nasi Goreng Korea','Nasi Goreng',13000],
 ['Aneka Sajian Prasmanan','Makanan',null,null,'Referensi mulai Rp8.000; admin wajib mengisi pilihan dan harga final.'],['Lontong Kari','Makanan',12000],['Ayam Geprek + Nasi','Ayam',15000],['Ayam Katsu + Nasi','Ayam',15000],['Ayam Pop Corn + Nasi','Ayam',15000],['Aneka Seblak','Makanan',null,null,'Referensi mulai Rp8.000; admin wajib mengisi pilihan dan harga final.'],
 ['Ikan Nila/Kembung + Nasi','Makanan',15000,['Nila','Kembung']],['Nasi Kuning Komplit','Makanan',12000],['Nasi Uduk Komplit','Makanan',12000],['Lotek/Karedok','Makanan',12000,['Lotek','Karedok']],['Lotek/Karedok + Nasi','Makanan',15000,['Lotek','Karedok']],['Karedok Lontong Tahu','Makanan',16000],['Ketoprak','Makanan',12000],['Rujak Ulek','Makanan',16000],
 ['Soto Ayam + Nasi','Soto',null],['Ayam Sambal Cikur + Nasi','Ayam',null],['Ayam Sadas + Nasi','Ayam',null],['Ayam Serundeng + Nasi','Ayam',null],['Ayam Teriyaki + Nasi','Ayam',15000],['Ayam Saus Keju + Nasi','Ayam',null],['Ayam Bakar + Nasi','Ayam',null],
 ['Susu Murni','Susu Murni',null,[['Original',8000],['Melon',10000],['Coklat',10000],['Strawberry',10000],['Tiramisu',10000],['Vanilla',10000],['Orange',10000],['Lychee',10000]]],
 ['Jus Mangga','Minuman',10000],['Jus Strawberry','Minuman',10000],['Jus Jambu','Minuman',10000],['Jus Alpukat','Minuman',10000],['Jus Sirsak','Minuman',10000],
 ['Lychee Tea/Peach Tea','Minuman',8000,['Lychee Tea','Peach Tea']],['Bubble Gum/Cotton Candy','Minuman',10000,['Bubble Gum','Cotton Candy']],['Thai Tea/Green Tea','Minuman',8000,['Thai Tea','Green Tea']]
];
export const seedMenus=[];
export const seedVariants=[];
let variantIndex=0;
rows.forEach(([name,category,price,options,note],index)=>{
  const menuId=id(1,index+1);
  seedMenus.push({id:menuId,kantin_id:seedKantin[0].id,name,category,kind:['Minuman','Susu Murni'].includes(category)?'drink':'food',active:false,is_verified:false,
    confirmation_note:note||'Perlu konfirmasi: foto sumber, harga, varian, dan kepemilikan kantin belum diverifikasi.'});
  const choices=options||[[price==null?'Pilihan belum dikonfigurasi':'Standar',price]];
  choices.forEach(option=>{const [name,amount]=Array.isArray(option)?option:[option,price];seedVariants.push({id:id(2,++variantIndex),menu_id:menuId,name,price:amount,price_verified:false,stock:0,active:false});});
});
