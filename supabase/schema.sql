-- deste veritabanı şeması (Supabase / Postgres)
-- Giriş yok: her tarayıcı rastgele bir gizli anahtar üretir; kimlik = sha256(anahtar) ilk 40 hane.
-- Okuma herkese açık; yazma yalnız aşağıdaki RPC'lerle ve yalnız anahtar sahibinin kendi yoluna.

create extension if not exists pgcrypto with schema extensions;

-- ilanlar/<kimlik> ve teklifler/<kimlik> belgeleri
create table if not exists public.docs (
  path text primary key,
  col text not null,
  owner uuid not null default auth.uid(),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint docs_path_bicim check (path ~ '^[A-Za-z0-9_.~:@+-]{1,120}(/[A-Za-z0-9_.~:@+-]{1,120})+$' and length(path) < 300),
  constraint docs_col check (col in ('ilanlar','teklifler')),
  constraint docs_col_path check (split_part(path,'/',1) = col),
  constraint docs_boyut check (octet_length(data::text) < 200000)
);
create index if not exists docs_col_idx on public.docs(col);

create or replace function public.docs_zaman() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists docs_zaman on public.docs;
create trigger docs_zaman before update on public.docs for each row execute function public.docs_zaman();

alter table public.docs enable row level security;
drop policy if exists "herkes okur" on public.docs;
create policy "herkes okur" on public.docs for select to anon, authenticated using (true);

-- ilan fotoğrafları (sıkıştırılmış dataURL, en çok ~170 KB)
create table if not exists public.foto (
  path text primary key,
  data text not null,
  created_at timestamptz not null default now(),
  constraint foto_path check (path ~ '^[a-f0-9]{40}/[A-Za-z0-9_.~:@+-]{1,120}$'),
  constraint foto_boyut check (length(data) < 240000 and data ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$')
);
alter table public.foto enable row level security;
drop policy if exists "foto herkes okur" on public.foto;
create policy "foto herkes okur" on public.foto for select to anon, authenticated using (true);

create or replace function public.kimlik_kodu(p_gizli text) returns text
language sql immutable set search_path = '' as $$ select substr(encode(extensions.digest(p_gizli, 'sha256'), 'hex'), 1, 40) $$;

create or replace function public.belge_yaz(p_kol text, p_data jsonb, p_gizli text) returns text
language plpgsql security definer set search_path = '' as $$
declare v_uid text; v_path text;
begin
  if p_gizli is null or length(p_gizli) < 32 or length(p_gizli) > 200 then raise exception 'gecersiz anahtar' using errcode = '22023'; end if;
  if p_kol not in ('ilanlar', 'teklifler') then raise exception 'gecersiz koleksiyon' using errcode = '22023'; end if;
  if jsonb_typeof(p_data) <> 'object' then raise exception 'gecersiz veri' using errcode = '22023'; end if;
  v_uid := public.kimlik_kodu(p_gizli);
  v_path := p_kol || '/' || v_uid;
  insert into public.docs(path, col, owner, data) values (v_path, p_kol, '00000000-0000-0000-0000-000000000000', p_data)
  on conflict (path) do update set data = excluded.data;
  return v_uid;
end $$;

create or replace function public.foto_yaz(p_id text, p_data text, p_gizli text) returns text
language plpgsql security definer set search_path = '' as $$
declare v_path text;
begin
  if p_gizli is null or length(p_gizli) < 32 or length(p_gizli) > 200 then raise exception 'gecersiz anahtar' using errcode = '22023'; end if;
  v_path := public.kimlik_kodu(p_gizli) || '/' || p_id;
  insert into public.foto(path, data) values (v_path, p_data) on conflict (path) do update set data = excluded.data;
  return v_path;
end $$;

create or replace function public.foto_sil(p_id text, p_gizli text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_gizli is null or length(p_gizli) < 32 then raise exception 'gecersiz anahtar' using errcode = '22023'; end if;
  delete from public.foto where path = public.kimlik_kodu(p_gizli) || '/' || p_id;
end $$;

revoke all on function public.belge_yaz(text, jsonb, text) from public;
revoke all on function public.foto_yaz(text, text, text) from public;
revoke all on function public.foto_sil(text, text) from public;
grant execute on function public.belge_yaz(text, jsonb, text) to anon, authenticated;
grant execute on function public.foto_yaz(text, text, text) to anon, authenticated;
grant execute on function public.foto_sil(text, text) to anon, authenticated;

-- canlı güncellemeler
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;
