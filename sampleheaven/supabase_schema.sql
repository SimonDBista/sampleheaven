-- ====================================================================
-- 🎵 SampleGoldmine — Supabase Database Schema Script
-- ====================================================================
-- This SQL script sets up the entire database structure, RLS policies,
-- automatic triggers, and storage buckets for SampleGoldmine.
-- 
-- How to apply:
-- 1. Go to your Supabase Dashboard (https://supabase.com).
-- 2. Select your project.
-- 3. Click on the "SQL Editor" in the left navigation panel.
-- 4. Create a new query, paste the contents of this file, and click "Run".
-- ====================================================================

-- ====================================================================
-- 🛑 CLEANUP & RESET SCHEMA (Drops all existing tables/buckets first)
-- ====================================================================

-- Disable row level security on all public tables
alter table if exists public.follows disable row level security;
alter table if exists public.product_likes disable row level security;
alter table if exists public.comment_likes disable row level security;
alter table if exists public.comments disable row level security;
alter table if exists public.orders disable row level security;
alter table if exists public.products disable row level security;
alter table if exists public.seller_profiles disable row level security;
alter table if exists public.users disable row level security;

-- Drop Triggers
drop trigger if exists on_auth_user_created on auth.users cascade;
drop trigger if exists on_user_role_updated on public.users cascade;

-- Drop Functions
drop function if exists public.handle_new_user() cascade;
drop function if exists public.handle_user_role_updated() cascade;

-- Drop Tables
drop table if exists public.follows cascade;
drop table if exists public.product_likes cascade;
drop table if exists public.comment_likes cascade;
drop table if exists public.comments cascade;
drop table if exists public.orders cascade;
drop table if exists public.products cascade;
drop table if exists public.seller_profiles cascade;
drop table if exists public.users cascade;

-- Drop Storage Policies
drop policy if exists "Allow public read access for avatars" on storage.objects;
drop policy if exists "Allow users to upload their own avatar" on storage.objects;
drop policy if exists "Allow users to update their own avatar" on storage.objects;
drop policy if exists "Allow users to delete their own avatar" on storage.objects;

drop policy if exists "Allow public read access for payment QRs" on storage.objects;
drop policy if exists "Allow users to upload their own payment QR" on storage.objects;
drop policy if exists "Allow users to update their own payment QR" on storage.objects;
drop policy if exists "Allow users to delete their own payment QR" on storage.objects;

drop policy if exists "Allow public read access for samples" on storage.objects;
drop policy if exists "Allow sellers to upload samples" on storage.objects;
drop policy if exists "Allow sellers to update their own samples" on storage.objects;
drop policy if exists "Allow sellers to delete their own samples" on storage.objects;

-- ====================================================================

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- ====================================================================
-- 1. Database Tables
-- ====================================================================

-- A. Users Profile Table (synced with auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null unique,
  role text check (role in ('Buyer', 'Seller', 'Admin')),
  is_verified boolean not null default false,
  is_suspended boolean not null default false,
  profile_picture_url text default '',
  created_at timestamptz not null default now()
);

-- B. Seller Profiles Table
create table if not exists public.seller_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text not null,
  instagram_username text default '',
  profile_picture_url text default '',
  qr_image_url text default '',
  updated_at timestamptz not null default now()
);

-- C. Products Table (Beats, Sample Packs, One-Shots)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  type text not null check (type in ('Beat', 'Pack', 'One-Shot')),
  genre text not null,
  price numeric not null default 0.00 check (price >= 0),
  file_url text not null,
  tags text[] not null default '{}',
  bpm integer check (bpm is null or bpm > 0),
  scale_key text,
  cover_art_url text,
  downloads integer not null default 0 check (downloads >= 0),
  created_at timestamptz not null default now(),
  
  -- Business Rule: One-Shot samples MUST be free
  constraint check_oneshot_price check (
    (type = 'One-Shot' and price = 0) or (type != 'One-Shot')
  )
);

-- D. Orders Table (Manual payment approval model)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.users(id) on delete cascade,
  seller_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  payment_method text not null check (payment_method in ('eSewa', 'Khalti', 'Bank Transfer')),
  product_type text,
  payment_proof_url text default '',
  created_at timestamptz not null default now()
);

-- E. Comments Table (Discussion feature on detail page)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- F. Comment Likes (Many-to-Many join table)
create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  primary key (comment_id, user_id)
);

-- G. Product Likes / Bookmarks (Many-to-Many join table)
create table if not exists public.product_likes (
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  primary key (product_id, user_id)
);

-- H. Follows Table (Followers and Creators)
create table if not exists public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  followed_id uuid not null references public.users(id) on delete cascade,
  primary key (follower_id, followed_id),
  constraint cannot_follow_self check (follower_id <> followed_id)
);

-- ====================================================================
-- 2. Automatic Database Triggers
-- ====================================================================

-- Trigger A: Automatically insert a public user record when a user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_username text;
begin
  -- Set default username from metadata or email
  default_username := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );

  -- Avoid username conflicts by appending dynamic digits if username exists
  while exists (select 1 from public.users where username = default_username) loop
    default_username := default_username || floor(random() * 10)::text;
  end loop;

  insert into public.users (id, email, username, role, is_verified, is_suspended, created_at)
  values (
    new.id,
    new.email,
    default_username,
    null, -- Role remains NULL until explicitly selected via role selection page
    false,
    false,
    coalesce(new.created_at, now())
  );
  return new;
end;
$$ language plpgsql security definer;

-- Bind Trigger A
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Trigger B: Automatically create a seller profile when a user's role is updated to 'Seller'
create or replace function public.handle_user_role_updated()
returns trigger as $$
begin
  if new.role = 'Seller' and (old.role is null or old.role != 'Seller') then
    insert into public.seller_profiles (user_id, display_name, instagram_username, profile_picture_url, qr_image_url, updated_at)
    values (
      new.id,
      new.username,
      '',
      '',
      '',
      now()
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Bind Trigger B
drop trigger if exists on_user_role_updated on public.users;
create trigger on_user_role_updated
  after update on public.users
  for each row execute procedure public.handle_user_role_updated();

-- ====================================================================
-- 3. Enable Row Level Security (RLS)
-- ====================================================================

alter table public.users enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.comments enable row level security;
alter table public.comment_likes enable row level security;
alter table public.product_likes enable row level security;
alter table public.follows enable row level security;

-- ====================================================================
-- 4. RLS Security Policies
-- ====================================================================

-- A. Users Table Policies
create policy "Allow public read access to users" 
  on public.users for select using (true);

create policy "Allow users to update their own row" 
  on public.users for update using (auth.uid() = id);

-- B. Seller Profiles Table Policies
create policy "Allow public read access to seller profiles" 
  on public.seller_profiles for select using (true);

create policy "Allow users to insert their own seller profile" 
  on public.seller_profiles for insert with check (auth.uid() = user_id);

create policy "Allow users to update their own seller profile" 
  on public.seller_profiles for update using (auth.uid() = user_id);

-- C. Products Table Policies
create policy "Allow public read access to products" 
  on public.products for select using (true);

create policy "Allow verified sellers to upload products" 
  on public.products for insert with check (
    auth.uid() = seller_id and exists (
      select 1 from public.users where id = auth.uid() and role in ('Seller', 'Admin')
    )
  );

create policy "Allow sellers to update their own products" 
  on public.products for update using (auth.uid() = seller_id);

create policy "Allow sellers to delete their own products" 
  on public.products for delete using (auth.uid() = seller_id);

-- D. Orders Table Policies
create policy "Allow buyers and sellers to view their orders" 
  on public.orders for select using (
    auth.uid() = buyer_id or auth.uid() = seller_id
  );

create policy "Allow buyers to create pending orders" 
  on public.orders for insert with check (auth.uid() = buyer_id);

create policy "Allow sellers to update order details/status" 
  on public.orders for update using (auth.uid() = seller_id);

-- E. Comments Table Policies
create policy "Allow public read access to comments" 
  on public.comments for select using (true);

create policy "Allow authenticated users to write comments" 
  on public.comments for insert with check (auth.uid() = user_id);

create policy "Allow comment authors to delete their comments" 
  on public.comments for delete using (auth.uid() = user_id);

-- F. Comment Likes Policies
create policy "Allow public read access to comment likes" 
  on public.comment_likes for select using (true);

create policy "Allow users to like comments" 
  on public.comment_likes for insert with check (auth.uid() = user_id);

create policy "Allow users to unlike comments" 
  on public.comment_likes for delete using (auth.uid() = user_id);

-- G. Product Likes Policies
create policy "Allow public read access to product likes" 
  on public.product_likes for select using (true);

create policy "Allow users to like products" 
  on public.product_likes for insert with check (auth.uid() = user_id);

create policy "Allow users to unlike products" 
  on public.product_likes for delete using (auth.uid() = user_id);

-- H. Follows Policies
create policy "Allow public read access to follows" 
  on public.follows for select using (true);

create policy "Allow users to follow creators" 
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "Allow users to unfollow creators" 
  on public.follows for delete using (auth.uid() = follower_id);

-- ====================================================================
-- 5. Storage Buckets and Policies
-- ====================================================================
-- Note: Buckets are created in the storage.buckets table.
-- Files should be uploaded to the path format: "{auth.uid()}/{filename}" 
-- to enforce the security folder-level restrictions defined below.

-- Initialize Buckets
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('payment_qrs', 'payment_qrs', true),
  ('samples', 'samples', true)
on conflict (id) do nothing;

-- Storage Policies: Avatars
create policy "Allow public read access for avatars" 
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Allow users to upload their own avatar" 
  on storage.objects for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Allow users to update their own avatar" 
  on storage.objects for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Allow users to delete their own avatar" 
  on storage.objects for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage Policies: Payment QR Codes
create policy "Allow public read access for payment QRs" 
  on storage.objects for select using (bucket_id = 'payment_qrs');

create policy "Allow users to upload their own payment QR" 
  on storage.objects for insert with check (
    bucket_id = 'payment_qrs' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Allow users to update their own payment QR" 
  on storage.objects for update using (
    bucket_id = 'payment_qrs' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Allow users to delete their own payment QR" 
  on storage.objects for delete using (
    bucket_id = 'payment_qrs' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage Policies: Samples / Audio Files
create policy "Allow public read access for samples" 
  on storage.objects for select using (bucket_id = 'samples');

create policy "Allow sellers to upload samples" 
  on storage.objects for insert with check (
    bucket_id = 'samples' and auth.uid()::text = (storage.foldername(name))[1] and exists (
      select 1 from public.users where id = auth.uid() and role in ('Seller', 'Admin')
    )
  );

create policy "Allow sellers to update their own samples" 
  on storage.objects for update using (
    bucket_id = 'samples' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Allow sellers to delete their own samples" 
  on storage.objects for delete using (
    bucket_id = 'samples' and auth.uid()::text = (storage.foldername(name))[1]
  );
