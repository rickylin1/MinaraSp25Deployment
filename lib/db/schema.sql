-- RUN THIS IN NEW SUPABASE PROJECT --

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.calendars enable row level security;
alter table public.events enable row level security;
alter table public.tags enable row level security;
alter table public.event_tags enable row level security;

-- Create tables
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  timezone text default 'UTC'
);

-- create table public.user_connections (
--   user_id uuid references public.profiles(id) on delete cascade not null primary key,
--   provider text not null,
--   access_token text,
--   refresh_token text,
--   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
--   updated_at timestamp with time zone default timezone('utc'::text, now()) not null
-- )

create table public.calendars (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  color text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  location text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  all_day boolean default false,
  calendar_id uuid references public.calendars(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  timezone text not null default 'UTC'
);

create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.event_tags (
  event_id uuid references public.events(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (event_id, tag_id)
);

-- Create RLS policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view their own calendars"
  on public.calendars for select
  using (auth.uid() = user_id);

create policy "Users can create calendars"
  on public.calendars for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own calendars"
  on public.calendars for update
  using (auth.uid() = user_id);

create policy "Users can delete their own calendars"
  on public.calendars for delete
  using (auth.uid() = user_id);

create policy "Users can view their own events"
  on public.events for select
  using (auth.uid() = user_id);

create policy "Users can create events"
  on public.events for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own events"
  on public.events for update
  using (auth.uid() = user_id);

create policy "Users can delete their own events"
  on public.events for delete
  using (auth.uid() = user_id);

-- Create new policy that allows profile creation during signup
create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create functions and triggers
create function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.calendars
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.events
  for each row
  execute procedure public.handle_updated_at();
