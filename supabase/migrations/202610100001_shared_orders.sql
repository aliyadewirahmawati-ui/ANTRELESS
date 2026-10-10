begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
create function private.business_time() returns timestamptz
language sql volatile set search_path = '' as $$ select clock_timestamp(); $$;
revoke all on function private.business_time() from public,anon,authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 80),
  role text not null default 'buyer' check (role in ('buyer','admin')),
  created_at timestamptz not null default now()
);
create table public.kantin (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 100),
  pickup_location text not null default 'Detail lokasi belum diisi' check (length(pickup_location) between 1 and 300),
  opens_at time not null default '06:30',
  closes_at time not null default '17:00',
  accepting_orders boolean not null default false,
  is_demo boolean not null default true,
  check (opens_at < closes_at)
);
create table public.kantin_admins (
  kantin_id uuid not null references public.kantin(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key(kantin_id,user_id)
);
create index kantin_admins_user on public.kantin_admins(user_id);
create table public.menu (
  id uuid primary key default gen_random_uuid(),
  kantin_id uuid not null references public.kantin(id),
  name text not null check (length(name) between 1 and 120),
  category text not null check (length(category) between 1 and 60),
  kind text not null check (kind in ('food','drink')),
  active boolean not null default false,
  is_verified boolean not null default false,
  confirmation_note text not null default 'Perlu konfirmasi' check (length(confirmation_note)<=500),
  created_at timestamptz not null default now()
);
create index menu_kantin on public.menu(kantin_id);
create table public.menu_variants (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menu(id),
  name text not null check (length(name) between 1 and 80),
  price bigint check (price between 1 and 100000000),
  price_verified boolean not null default false,
  stock integer not null default 0 check (stock between 0 and 1000000),
  active boolean not null default false,
  check (not price_verified or price is not null),
  unique(menu_id,name)
);
create index variants_menu on public.menu_variants(menu_id);
create table public.promos (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null unique references public.menu_variants(id),
  price bigint not null check (price between 1 and 100000000),
  starts_at time not null default '15:00',
  ends_at time not null default '17:00',
  daily_quota integer not null check (daily_quota between 0 and 1000000),
  remaining_stock integer not null check (remaining_stock between 0 and 1000000),
  stock_date date not null default (private.business_time() at time zone 'Asia/Jakarta')::date,
  active boolean not null default false,
  check (starts_at >= '15:00' and ends_at <= '17:00' and starts_at < ends_at),
  check (remaining_stock <= daily_quota)
);
create table public.checkout_requests (
  buyer_id uuid not null references public.profiles(id),
  id uuid not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key(buyer_id,id)
);
create table public.queue_counters (
  kantin_id uuid not null references public.kantin(id),
  day date not null,
  last_number integer not null check (last_number > 0),
  primary key(kantin_id,day)
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  checkout_id uuid not null,
  buyer_id uuid not null references public.profiles(id),
  buyer_name text not null,
  kantin_id uuid not null references public.kantin(id),
  kantin_name text not null,
  pickup_location text not null,
  queue_day date not null,
  queue_number integer not null,
  status text not null default 'waiting' check (status in ('waiting','preparing','ready','completed','cancelled')),
  total bigint not null check (total > 0),
  estimated_ready_at timestamptz,
  admin_note text not null default '' check (length(admin_note)<=500),
  cancellation_reason text not null default '' check (length(cancellation_reason)<=500),
  stock_restored boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key(buyer_id,checkout_id) references public.checkout_requests(buyer_id,id),
  unique(kantin_id,queue_day,queue_number),
  unique(buyer_id,checkout_id,kantin_id)
);
create index orders_buyer on public.orders(buyer_id,created_at desc);
create index orders_kantin on public.orders(kantin_id,status,created_at desc);
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  variant_id uuid not null references public.menu_variants(id),
  menu_name text not null,
  variant_name text not null,
  quantity integer not null check (quantity between 1 and 99),
  unit_price bigint not null check (unit_price > 0),
  original_price bigint not null check (original_price > 0),
  price_mode text not null check (price_mode in ('regular','promo')),
  promo_id uuid references public.promos(id),
  promo_day date,
  unique(order_id,variant_id,price_mode)
);
create index items_order on public.order_items(order_id);
create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  status text not null check (status in ('waiting','preparing','ready','completed','cancelled')),
  changed_by uuid not null references public.profiles(id),
  note text not null default '',
  changed_at timestamptz not null default now()
);
create index history_order on public.order_status_history(order_id,changed_at);

create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- Role is deliberately never copied from user-supplied signup metadata.
  insert into public.profiles(id,display_name,role)
  values(new.id,left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'Pembeli'),80),'buyer');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.handle_new_user();
-- Existing Supabase users also receive buyer profiles, without replacing roles.
insert into public.profiles(id,display_name)
select id,left(coalesce(nullif(trim(raw_user_meta_data->>'display_name'),''),'Pembeli'),80)
from auth.users on conflict(id) do nothing;

create function private.is_admin(p_kantin uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.kantin_admins where kantin_id=p_kantin and user_id=(select auth.uid()));
$$;
create function private.can_read_order(p_order uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.orders o where o.id=p_order and (o.buyer_id=(select auth.uid()) or private.is_admin(o.kantin_id)));
$$;

alter table public.profiles enable row level security;
alter table public.kantin enable row level security;
alter table public.kantin_admins enable row level security;
alter table public.menu enable row level security;
alter table public.menu_variants enable row level security;
alter table public.promos enable row level security;
alter table public.checkout_requests enable row level security;
alter table public.queue_counters enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

create policy own_profile on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy public_kantin on public.kantin for select to anon,authenticated using (true);
create policy own_admin_assignment on public.kantin_admins for select to authenticated using (user_id=(select auth.uid()));
create policy public_menu on public.menu for select to anon,authenticated using (true);
create policy public_variants on public.menu_variants for select to anon,authenticated using (true);
create policy public_promos on public.promos for select to anon,authenticated using (true);
create policy allowed_orders on public.orders for select to authenticated using (buyer_id=(select auth.uid()) or private.is_admin(kantin_id));
create policy allowed_items on public.order_items for select to authenticated using (private.can_read_order(order_id));
create policy allowed_history on public.order_status_history for select to authenticated using (private.can_read_order(order_id));
-- No direct INSERT/UPDATE/DELETE policies: mutations must pass through validated RPCs.
revoke all on public.profiles,public.kantin,public.kantin_admins,public.menu,public.menu_variants,public.promos,
  public.checkout_requests,public.queue_counters,public.orders,public.order_items,public.order_status_history from anon,authenticated;
grant select on public.kantin,public.menu,public.menu_variants,public.promos to anon,authenticated;
grant select on public.profiles,public.kantin_admins,public.orders,public.order_items,public.order_status_history to authenticated;

create function public.checkout(p_key uuid,p_items jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_buyer uuid := auth.uid(); v_payload jsonb; v_existing jsonb; v_priced jsonb := '[]';
  v_now timestamp; v_day date;
  v_line record; v_variant public.menu_variants; v_menu public.menu; v_kantin public.kantin; v_promo public.promos;
  v_price bigint; v_expected bigint; v_total bigint; v_number integer; v_order uuid; v_name text; v_kantin_id uuid;
begin
  if v_buyer is null then raise exception 'Masuk terlebih dahulu.'; end if;
  if p_key is null or p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 100 then
    raise exception 'Keranjang tidak valid.';
  end if;
  if exists(select 1 from jsonb_to_recordset(p_items) as x(variant_id uuid,quantity integer,price_mode text)
    where variant_id is null or quantity is null or quantity not between 1 and 99 or price_mode is null or price_mode not in ('regular','promo')) then
    raise exception 'Item atau jumlah tidak valid.';
  end if;
  select jsonb_agg(to_jsonb(x) order by variant_id,price_mode) into v_payload from
    (select variant_id,sum(quantity)::integer quantity,price_mode from jsonb_to_recordset(p_items)
      as i(variant_id uuid,quantity integer,price_mode text) group by variant_id,price_mode) x;
  if exists(select 1 from jsonb_to_recordset(v_payload) as x(quantity integer) where quantity>99) then raise exception 'Maksimal 99 per pilihan.'; end if;
  -- Serialize retries of the same request. The unique key is scoped to the authenticated buyer.
  perform pg_advisory_xact_lock(hashtextextended(v_buyer::text||':'||p_key::text,0));
  select payload into v_existing from public.checkout_requests where buyer_id=v_buyer and id=p_key;
  if found then
    if v_existing<>v_payload then raise exception 'Kunci checkout sudah digunakan untuk keranjang berbeda.'; end if;
    return (select jsonb_agg(to_jsonb(o) order by o.kantin_id) from public.orders o where buyer_id=v_buyer and checkout_id=p_key);
  end if;
  select display_name into v_name from public.profiles where id=v_buyer;
  if not found then raise exception 'Profil akun belum tersedia.'; end if;
  if (select count(*) from public.menu_variants where id in(select variant_id from jsonb_to_recordset(v_payload) as x(variant_id uuid)))
    <> (select count(distinct variant_id) from jsonb_to_recordset(v_payload) as x(variant_id uuid)) then raise exception 'Menu tidak ditemukan.'; end if;

  -- Lock in a consistent order across all canteens and variants before validation or mutation.
  perform k.id from public.kantin k where k.id in(select m.kantin_id from public.menu m join public.menu_variants v on v.menu_id=m.id
    where v.id in(select variant_id from jsonb_to_recordset(v_payload) as x(variant_id uuid))) order by k.id for update;
  perform m.id from public.menu m where m.id in(select menu_id from public.menu_variants
    where id in(select variant_id from jsonb_to_recordset(v_payload) as x(variant_id uuid))) order by m.id for update;
  perform v.id from public.menu_variants v where v.id in(select variant_id from jsonb_to_recordset(v_payload) as x(variant_id uuid)) order by v.id for update;
  perform p.id from public.promos p where p.variant_id in(select variant_id from jsonb_to_recordset(v_payload) as x(variant_id uuid)) order by p.variant_id for update;
  v_now:=private.business_time() at time zone 'Asia/Jakarta'; v_day:=v_now::date;

  for v_line in select * from jsonb_to_recordset(v_payload) as x(variant_id uuid,quantity integer,price_mode text) loop
    select * into v_variant from public.menu_variants where id=v_line.variant_id;
    select * into v_menu from public.menu where id=v_variant.menu_id;
    select * into v_kantin from public.kantin where id=v_menu.kantin_id;
    if v_kantin.is_demo then raise exception 'Kantin Demo belum menerima transaksi nyata.'; end if;
    if not v_kantin.accepting_orders or v_now::time<v_kantin.opens_at or v_now::time>=v_kantin.closes_at then raise exception 'Kantin tutup atau sedang menjeda pesanan.'; end if;
    if not v_menu.active or not v_menu.is_verified or not v_variant.active or not v_variant.price_verified or v_variant.price is null then
      raise exception 'Menu belum dikonfirmasi atau tidak tersedia.';
    end if;
    v_price:=v_variant.price; v_promo:=null;
    if v_line.price_mode='promo' then
      select * into v_promo from public.promos where variant_id=v_variant.id;
      if not found or not v_promo.active or v_now::time<'15:00' or v_now::time>='17:00' or v_now::time<v_promo.starts_at or v_now::time>=v_promo.ends_at or v_promo.price>=v_variant.price then
        raise exception 'Promo belum aktif atau sudah berakhir.';
      end if;
      if v_promo.stock_date<>v_day then
        update public.promos set remaining_stock=daily_quota,stock_date=v_day where id=v_promo.id returning * into v_promo;
      end if;
      if v_promo.remaining_stock<v_line.quantity then raise exception 'Kuota promo tidak mencukupi.'; end if;
      v_price:=v_promo.price;
    end if;
    -- A quote only checks freshness. Prices and totals still come exclusively from the database.
    select max(expected_unit_price) into v_expected from jsonb_to_recordset(p_items) as x(variant_id uuid,price_mode text,expected_unit_price bigint)
      where variant_id=v_line.variant_id and price_mode=v_line.price_mode;
    if v_expected is not null and v_expected<>v_price then raise exception 'Harga berubah. Periksa harga terbaru di tas lalu coba lagi.'; end if;
    v_priced:=v_priced||jsonb_build_array(jsonb_build_object('variant_id',v_variant.id,'kantin_id',v_kantin.id,
      'menu_name',v_menu.name,'variant_name',v_variant.name,'quantity',v_line.quantity,'unit_price',v_price,
      'original_price',v_variant.price,'price_mode',v_line.price_mode,'promo_id',v_promo.id));
  end loop;

  if exists(select 1 from public.menu_variants v join
    (select variant_id,sum(quantity) quantity from jsonb_to_recordset(v_payload) as x(variant_id uuid,quantity integer) group by variant_id) c on c.variant_id=v.id
    where v.stock<c.quantity) then raise exception 'Stok tidak mencukupi. Periksa keranjang.'; end if;
  insert into public.checkout_requests(buyer_id,id,payload) values(v_buyer,p_key,v_payload);
  for v_kantin_id in select distinct kantin_id from jsonb_to_recordset(v_priced) as x(kantin_id uuid) order by kantin_id loop
    select * into v_kantin from public.kantin where id=v_kantin_id;
    select sum(quantity*unit_price) into v_total from jsonb_to_recordset(v_priced) as x(kantin_id uuid,quantity integer,unit_price bigint) where kantin_id=v_kantin_id;
    insert into public.queue_counters(kantin_id,day,last_number) values(v_kantin_id,v_day,1)
      on conflict(kantin_id,day) do update set last_number=public.queue_counters.last_number+1 returning last_number into v_number;
    insert into public.orders(checkout_id,buyer_id,buyer_name,kantin_id,kantin_name,pickup_location,queue_day,queue_number,total)
      values(p_key,v_buyer,v_name,v_kantin_id,v_kantin.name,v_kantin.pickup_location,v_day,v_number,v_total) returning id into v_order;
    for v_line in select * from jsonb_to_recordset(v_priced) as x(variant_id uuid,kantin_id uuid,menu_name text,variant_name text,
      quantity integer,unit_price bigint,original_price bigint,price_mode text,promo_id uuid) where kantin_id=v_kantin_id loop
      insert into public.order_items(order_id,variant_id,menu_name,variant_name,quantity,unit_price,original_price,price_mode,promo_id,promo_day)
        values(v_order,v_line.variant_id,v_line.menu_name,v_line.variant_name,v_line.quantity,v_line.unit_price,v_line.original_price,v_line.price_mode,v_line.promo_id,case when v_line.price_mode='promo' then v_day end);
      update public.menu_variants set stock=stock-v_line.quantity where id=v_line.variant_id;
      if v_line.price_mode='promo' then update public.promos set remaining_stock=remaining_stock-v_line.quantity where id=v_line.promo_id; end if;
    end loop;
    insert into public.order_status_history(order_id,status,changed_by) values(v_order,'waiting',v_buyer);
  end loop;
  return (select jsonb_agg(to_jsonb(o) order by o.kantin_id) from public.orders o where buyer_id=v_buyer and checkout_id=p_key);
end $$;

create function public.update_order(p_order_id uuid,p_status text,p_eta timestamptz default null,p_note text default '',p_reason text default '') returns public.orders
language plpgsql security definer set search_path = '' as $$
declare v_order public.orders; v_item record; v_kantin uuid;
begin
  select kantin_id into v_kantin from public.orders where id=p_order_id;
  if not found or not private.is_admin(v_kantin) then raise exception 'Tidak berwenang mengelola pesanan ini.'; end if;
  -- Canteen lock matches checkout lock ordering, avoiding cancellation/restock deadlocks.
  perform id from public.kantin where id=v_kantin for update;
  select * into v_order from public.orders where id=p_order_id for update;
  if p_status is null or p_status not in ('waiting','preparing','ready','completed','cancelled') then raise exception 'Status tidak valid.'; end if;
  if length(coalesce(p_note,''))>500 or length(coalesce(p_reason,''))>500 then raise exception 'Catatan terlalu panjang.'; end if;
  if v_order.status in ('completed','cancelled') then raise exception 'Pesanan sudah berakhir.'; end if;
  if p_status<>v_order.status and not (
    (v_order.status='waiting' and p_status in ('preparing','cancelled')) or
    (v_order.status='preparing' and p_status in ('ready','cancelled')) or
    (v_order.status='ready' and p_status in ('completed','cancelled'))) then raise exception 'Urutan perubahan status tidak valid.'; end if;
  if p_eta is not null and p_eta<private.business_time() and p_eta is distinct from v_order.estimated_ready_at then raise exception 'Estimasi harus berupa waktu mendatang.'; end if;
  if p_status='cancelled' then
    if length(trim(coalesce(p_reason,'')))=0 then raise exception 'Alasan pembatalan wajib diisi.'; end if;
    -- Only unstarted (waiting) orders return stock. Prepared food does not return to inventory.
    if v_order.status='waiting' and not v_order.stock_restored then
      perform v.id from public.menu_variants v where v.id in(select variant_id from public.order_items where order_id=p_order_id) order by v.id for update;
      perform p.id from public.promos p where p.id in(select promo_id from public.order_items where order_id=p_order_id) order by p.variant_id for update;
      for v_item in select * from public.order_items where order_id=p_order_id loop
        update public.menu_variants set stock=least(1000000,stock+v_item.quantity) where id=v_item.variant_id;
        if v_item.promo_id is not null then
          update public.promos set remaining_stock=least(daily_quota,remaining_stock+v_item.quantity)
          where id=v_item.promo_id and stock_date=v_item.promo_day;
        end if;
      end loop;
      v_order.stock_restored:=true;
    end if;
  end if;
  update public.orders set status=p_status,estimated_ready_at=p_eta,admin_note=coalesce(p_note,''),
    cancellation_reason=case when p_status='cancelled' then trim(p_reason) else '' end,
    stock_restored=v_order.stock_restored,updated_at=now() where id=p_order_id returning * into v_order;
  insert into public.order_status_history(order_id,status,changed_by,note) values(p_order_id,p_status,auth.uid(),
    case when p_status='cancelled' then trim(p_reason) else coalesce(p_note,'') end);
  return v_order;
end $$;

create function public.save_kantin(p_id uuid,p_name text,p_location text,p_opens time,p_closes time,p_accept boolean,p_demo boolean) returns public.kantin
language plpgsql security definer set search_path = '' as $$
declare v_result public.kantin;
begin
  if p_id is null then
    if not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then raise exception 'Hanya admin dapat membuat kantin.'; end if;
    insert into public.kantin(name,pickup_location,opens_at,closes_at,accepting_orders,is_demo)
      values(trim(p_name),coalesce(nullif(trim(p_location),''),'Detail lokasi belum diisi'),p_opens,p_closes,p_accept,p_demo) returning * into v_result;
    insert into public.kantin_admins(kantin_id,user_id) values(v_result.id,auth.uid());
  else
    if not private.is_admin(p_id) then raise exception 'Kantin ini bukan kewenanganmu.'; end if;
    update public.kantin set name=trim(p_name),pickup_location=coalesce(nullif(trim(p_location),''),'Detail lokasi belum diisi'),
      opens_at=p_opens,closes_at=p_closes,accepting_orders=p_accept,is_demo=p_demo where id=p_id returning * into v_result;
  end if;
  return v_result;
end $$;

create function public.save_menu(p_id uuid,p_kantin uuid,p_name text,p_category text,p_kind text,p_active boolean,p_verified boolean,p_note text) returns public.menu
language plpgsql security definer set search_path = '' as $$
declare v_result public.menu;
begin
  if not private.is_admin(p_kantin) then raise exception 'Kantin ini bukan kewenanganmu.'; end if;
  perform id from public.kantin where id=p_kantin for update;
  if p_id is null then
    insert into public.menu(kantin_id,name,category,kind,active,is_verified,confirmation_note)
      values(p_kantin,trim(p_name),trim(p_category),p_kind,p_active,p_verified,coalesce(p_note,'')) returning * into v_result;
  else
    update public.menu set name=trim(p_name),category=trim(p_category),kind=p_kind,active=p_active,is_verified=p_verified,confirmation_note=coalesce(p_note,'')
      where id=p_id and kantin_id=p_kantin returning * into v_result;
    if not found then raise exception 'Menu tidak ditemukan.'; end if;
  end if;
  return v_result;
end $$;

create function public.save_variant(p_id uuid,p_menu uuid,p_name text,p_price bigint,p_stock integer,p_active boolean,p_verified boolean) returns public.menu_variants
language plpgsql security definer set search_path = '' as $$
declare v_kantin uuid; v_result public.menu_variants;
begin
  select kantin_id into v_kantin from public.menu where id=p_menu;
  if not found or not private.is_admin(v_kantin) then raise exception 'Menu ini bukan kewenanganmu.'; end if;
  perform id from public.kantin where id=v_kantin for update;
  perform id from public.menu where id=p_menu for update;
  if p_id is null then
    insert into public.menu_variants(menu_id,name,price,stock,active,price_verified)
      values(p_menu,trim(p_name),p_price,p_stock,p_active,p_verified) returning * into v_result;
  else
    update public.menu_variants set name=trim(p_name),price=p_price,stock=p_stock,active=p_active,price_verified=p_verified
      where id=p_id and menu_id=p_menu returning * into v_result;
    if not found then raise exception 'Pilihan menu tidak ditemukan.'; end if;
    update public.promos set active=false where variant_id=p_id and (p_price is null or price>=p_price or not p_active or not p_verified);
  end if;
  return v_result;
end $$;

create function public.save_promo(p_variant uuid,p_price bigint,p_quota integer,p_remaining integer,p_starts time,p_ends time,p_active boolean) returns public.promos
language plpgsql security definer set search_path = '' as $$
declare v_kantin uuid; v_menu public.menu; v_variant public.menu_variants; v_result public.promos;
begin
  select m.kantin_id into v_kantin from public.menu m join public.menu_variants v on v.menu_id=m.id where v.id=p_variant;
  if not found or not private.is_admin(v_kantin) then raise exception 'Menu ini bukan kewenanganmu.'; end if;
  perform id from public.kantin where id=v_kantin for update;
  select m.* into v_menu from public.menu m join public.menu_variants v on v.menu_id=m.id where v.id=p_variant for update of m;
  select * into v_variant from public.menu_variants where id=p_variant for update;
  if p_price is null or v_variant.price is null or p_price>=v_variant.price then raise exception 'Harga promo harus lebih rendah dari harga normal.'; end if;
  if p_active and (not v_menu.active or not v_menu.is_verified or not v_variant.active or not v_variant.price_verified or v_variant.stock=0
    or exists(select 1 from public.kantin where id=v_kantin and is_demo)) then raise exception 'Konfirmasi menu, kantin, harga, dan stok sebelum mengaktifkan promo.'; end if;
  insert into public.promos(variant_id,price,daily_quota,remaining_stock,starts_at,ends_at,active)
    values(p_variant,p_price,p_quota,p_remaining,p_starts,p_ends,p_active)
    on conflict(variant_id) do update set price=excluded.price,daily_quota=excluded.daily_quota,
      remaining_stock=excluded.remaining_stock,starts_at=excluded.starts_at,ends_at=excluded.ends_at,active=excluded.active,stock_date=excluded.stock_date
    returning * into v_result;
  return v_result;
end $$;

revoke all on function private.handle_new_user(),private.is_admin(uuid),private.can_read_order(uuid) from public,anon,authenticated;
grant execute on function private.is_admin(uuid),private.can_read_order(uuid) to authenticated;
revoke all on function public.checkout(uuid,jsonb),public.update_order(uuid,text,timestamptz,text,text),
  public.save_kantin(uuid,text,text,time,time,boolean,boolean),public.save_menu(uuid,uuid,text,text,text,boolean,boolean,text),
  public.save_variant(uuid,uuid,text,bigint,integer,boolean,boolean),public.save_promo(uuid,bigint,integer,integer,time,time,boolean) from public,anon,authenticated;
grant execute on function public.checkout(uuid,jsonb),public.update_order(uuid,text,timestamptz,text,text),
  public.save_kantin(uuid,text,text,time,time,boolean,boolean),public.save_menu(uuid,uuid,text,text,text,boolean,boolean,text),
  public.save_variant(uuid,uuid,text,bigint,integer,boolean,boolean),public.save_promo(uuid,bigint,integer,integer,time,time,boolean) to authenticated;

-- Supabase creates this publication. Keep the migration usable in standalone PostgreSQL tests too.
do $$ declare t text; begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') then
    foreach t in array array['kantin','menu','menu_variants','promos','orders','order_items','order_status_history','kantin_admins','profiles'] loop
      if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
        execute format('alter publication supabase_realtime add table public.%I',t);
      end if;
    end loop;
  end if;
end $$;
commit;
