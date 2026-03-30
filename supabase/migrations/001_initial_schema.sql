-- CornerList initial schema (run in Supabase SQL Editor or via supabase db push)
-- Requires: Supabase Auth enabled

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'host'
    check (role in ('host', 'dj', 'admin')),
  full_name text,
  avatar_url text,
  email text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- genres (seeded)
-- ---------------------------------------------------------------------------
create table public.genres (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

insert into public.genres (slug, name) values
  ('hip-hop', 'Hip-Hop'),
  ('edm', 'EDM'),
  ('pop', 'Pop'),
  ('house', 'House'),
  ('r-and-b', 'R&B'),
  ('latin', 'Latin'),
  ('rock', 'Rock'),
  ('top-40', 'Top 40');

-- ---------------------------------------------------------------------------
-- dj_profiles
-- ---------------------------------------------------------------------------
create table public.dj_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references public.profiles (id) on delete cascade unique,
  stage_name text not null,
  years_experience int check (years_experience is null or years_experience >= 0),
  price_per_hour int not null check (price_per_hour >= 0),
  about text,
  equipment_summary text,
  availability_summary text,
  is_active boolean not null default true,
  rating_average numeric(3, 2),
  rating_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index dj_profiles_active_idx on public.dj_profiles (is_active);
create index dj_profiles_price_idx on public.dj_profiles (price_per_hour);

-- ---------------------------------------------------------------------------
-- dj_genres
-- ---------------------------------------------------------------------------
create table public.dj_genres (
  dj_id uuid not null references public.dj_profiles (id) on delete cascade,
  genre_id uuid not null references public.genres (id) on delete cascade,
  primary key (dj_id, genre_id)
);

-- ---------------------------------------------------------------------------
-- media_assets
-- ---------------------------------------------------------------------------
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  dj_id uuid not null references public.dj_profiles (id) on delete cascade,
  type text not null check (type in ('image', 'video', 'audio', 'link')),
  storage_path text,
  public_url text,
  title text,
  description text,
  created_at timestamptz not null default now()
);

create index media_assets_dj_idx on public.media_assets (dj_id);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  dj_id uuid not null references public.dj_profiles (id) on delete cascade,
  event_date date not null,
  start_time text not null,
  end_time text not null,
  guest_count int,
  event_type text,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'confirmed', 'cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'refunded')),
  stripe_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_host_idx on public.bookings (host_id);
create index bookings_dj_idx on public.bookings (dj_id);
create index bookings_status_idx on public.bookings (status);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  host_id uuid not null references public.profiles (id) on delete cascade,
  dj_id uuid not null references public.dj_profiles (id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create index reviews_dj_idx on public.reviews (dj_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.genres enable row level security;
alter table public.dj_profiles enable row level security;
alter table public.dj_genres enable row level security;
alter table public.media_assets enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

-- profiles: read all (for display names on reviews); update own
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- genres: read-only for authenticated + anon
create policy "Genres are viewable by everyone"
  on public.genres for select
  using (true);

-- dj_profiles: public read active; owner full access
create policy "Active DJ profiles are viewable by everyone"
  on public.dj_profiles for select
  using (is_active = true or auth.uid() = user_id);

create policy "DJs insert own profile"
  on public.dj_profiles for insert
  with check (auth.uid() = user_id);

create policy "DJs update own profile"
  on public.dj_profiles for update
  using (auth.uid() = user_id);

-- dj_genres: follow dj ownership
create policy "DJ genres viewable with profile"
  on public.dj_genres for select
  using (
    exists (
      select 1 from public.dj_profiles d
      where d.id = dj_genres.dj_id
        and (d.is_active = true or d.user_id = auth.uid())
    )
  );

create policy "DJs insert own genre links"
  on public.dj_genres for insert
  with check (
    exists (
      select 1 from public.dj_profiles d
      where d.id = dj_id and d.user_id = auth.uid()
    )
  );

create policy "DJs update own genre links"
  on public.dj_genres for update
  using (
    exists (
      select 1 from public.dj_profiles d
      where d.id = dj_genres.dj_id and d.user_id = auth.uid()
    )
  );

create policy "DJs delete own genre links"
  on public.dj_genres for delete
  using (
    exists (
      select 1 from public.dj_profiles d
      where d.id = dj_genres.dj_id and d.user_id = auth.uid()
    )
  );

-- media_assets
create policy "Media viewable for active DJs"
  on public.media_assets for select
  using (
    exists (
      select 1 from public.dj_profiles d
      where d.id = media_assets.dj_id
        and (d.is_active = true or d.user_id = auth.uid())
    )
  );

create policy "DJs insert own media"
  on public.media_assets for insert
  with check (
    exists (
      select 1 from public.dj_profiles d
      where d.id = dj_id and d.user_id = auth.uid()
    )
  );

create policy "DJs update own media"
  on public.media_assets for update
  using (
    exists (
      select 1 from public.dj_profiles d
      where d.id = media_assets.dj_id and d.user_id = auth.uid()
    )
  );

create policy "DJs delete own media"
  on public.media_assets for delete
  using (
    exists (
      select 1 from public.dj_profiles d
      where d.id = media_assets.dj_id and d.user_id = auth.uid()
    )
  );

-- bookings: host or DJ on the booking
create policy "Host or DJ can view booking"
  on public.bookings for select
  using (
    host_id = auth.uid()
    or exists (
      select 1 from public.dj_profiles d
      where d.id = bookings.dj_id and d.user_id = auth.uid()
    )
  );

create policy "Hosts create bookings"
  on public.bookings for insert
  with check (host_id = auth.uid());

create policy "Host or DJ update booking"
  on public.bookings for update
  using (
    host_id = auth.uid()
    or exists (
      select 1 from public.dj_profiles d
      where d.id = bookings.dj_id and d.user_id = auth.uid()
    )
  );

-- reviews: public read; insert by host on own booking (simplified for Phase 2)
create policy "Reviews viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Hosts insert reviews for own bookings"
  on public.reviews for insert
  with check (
    host_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.host_id = auth.uid() and b.status = 'confirmed'
    )
  );
