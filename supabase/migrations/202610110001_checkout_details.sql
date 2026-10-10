-- Apply after the shared-order migration. No payment gateway or actual charge is enabled here.
begin;
alter table public.checkout_requests add column details jsonb;
alter table public.orders add column payment_method text not null default 'on_pickup'
  check (payment_method in ('on_pickup','demo'));
alter table public.orders add column payment_status text not null default 'unpaid'
  check (payment_status in ('unpaid','demo_confirmed'));
alter table public.orders add column terms_version text;
alter table public.orders add column terms_accepted_at timestamptz;
alter table public.order_items add column customer_requests jsonb not null default '[]'
  check (jsonb_typeof(customer_requests)='array');

create function public.checkout_with_details(p_key uuid,p_items jsonb,p_options jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
  v_buyer uuid:=auth.uid(); v_details jsonb; v_previous jsonb; v_orders jsonb; v_method text;
begin
  if v_buyer is null then raise exception 'Masuk terlebih dahulu.'; end if;
  if not exists(select 1 from public.profiles where id=v_buyer and role='buyer') then
    raise exception 'Hanya pembeli dapat membuat pesanan.';
  end if;
  if p_options is null or jsonb_typeof(p_options)<>'object' or p_options->>'terms_version' is distinct from '2026-10-11' then
    raise exception 'Baca dan setujui panduan pemesanan terlebih dahulu.';
  end if;
  v_method:=p_options->>'payment_method';
  if v_method is null or v_method not in ('on_pickup','demo') then
    raise exception 'Metode pembayaran tidak tersedia. Pembayaran online nyata belum aktif.';
  end if;
  if p_key is null or p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 100 then
    raise exception 'Keranjang tidak valid.';
  end if;
  if exists(select 1 from jsonb_array_elements(p_items) i where
    (i ? 'customer_note' and jsonb_typeof(i->'customer_note')<>'string') or length(coalesce(i->>'customer_note',''))>300) then
    raise exception 'Catatan menu harus berupa teks maksimal 300 karakter.';
  end if;
  select jsonb_build_object('payment_method',v_method,'terms_version',p_options->>'terms_version',
    'items',jsonb_agg(jsonb_build_object('variant_id',i->>'variant_id','price_mode',i->>'price_mode',
      'quantity',i->'quantity','note',btrim(coalesce(i->>'customer_note','')))
      order by i->>'variant_id',i->>'price_mode',btrim(coalesce(i->>'customer_note','')),i->>'quantity'))
    into v_details from jsonb_array_elements(p_items) i;
  perform pg_advisory_xact_lock(hashtextextended(v_buyer::text||':'||p_key::text,0));
  select details into v_previous from public.checkout_requests where buyer_id=v_buyer and id=p_key;
  if found and v_previous is distinct from v_details then
    raise exception 'Kunci checkout sudah digunakan untuk keranjang berbeda (catatan atau pembayaran berubah).';
  end if;
  -- The existing transaction remains authoritative for prices, inventory, hours and queue counters.
  v_orders:=public.checkout(p_key,p_items);
  if v_previous is not null then return v_orders; end if;
  update public.checkout_requests set details=v_details where buyer_id=v_buyer and id=p_key;
  update public.orders set payment_method=v_method,
    payment_status=case when v_method='demo' then 'demo_confirmed' else 'unpaid' end,
    terms_version='2026-10-11',terms_accepted_at=now() where buyer_id=v_buyer and checkout_id=p_key;
  update public.order_items oi set customer_requests=(
    select coalesce(jsonb_agg(jsonb_build_object('quantity',(i->>'quantity')::integer,'note',btrim(i->>'customer_note'))
      order by btrim(i->>'customer_note')),'[]'::jsonb)
    from jsonb_array_elements(p_items) i
    where (i->>'variant_id')::uuid=oi.variant_id and i->>'price_mode'=oi.price_mode and btrim(coalesce(i->>'customer_note',''))<>''
  ) from public.orders o where oi.order_id=o.id and o.buyer_id=v_buyer and o.checkout_id=p_key;
  return (select jsonb_agg(to_jsonb(o) order by o.kantin_id) from public.orders o where buyer_id=v_buyer and checkout_id=p_key);
end $$;

-- Buyers must use the wrapper so notes and acceptance are part of the same atomic transaction.
revoke all on function public.checkout(uuid,jsonb) from public,anon,authenticated;
revoke all on function public.checkout_with_details(uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.checkout_with_details(uuid,jsonb,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
