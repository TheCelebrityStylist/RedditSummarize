create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  reddit_url text not null,
  subreddit text not null,
  thread_title text not null,
  original_post_text text,
  generated_guide jsonb not null,
  comment_count_analyzed integer default 0,
  visibility text default 'private' check (visibility in ('private','public')),
  generation_status text default 'complete' check (generation_status in ('processing','complete','failed')),
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  guest_id text,
  guide_id uuid references public.guides(id) on delete set null,
  reddit_url text not null,
  status text not null check (status in ('complete','failed')),
  error_message text,
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text default 'free',
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.saved_guides (
  user_id uuid references auth.users(id) on delete cascade,
  guide_id uuid references public.guides(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, guide_id)
);

create table if not exists public.webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz default now()
);

alter table public.guides enable row level security;
alter table public.generations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.saved_guides enable row level security;
alter table public.webhook_events enable row level security;

create index if not exists generations_user_created_idx on public.generations(user_id, created_at desc);
create index if not exists generations_guest_created_idx on public.generations(guest_id, created_at desc);
create index if not exists guides_user_created_idx on public.guides(user_id, created_at desc);

create policy "Users can read own guides" on public.guides for select using (auth.uid() = user_id or visibility = 'public');
create policy "Users can update own guides" on public.guides for update using (auth.uid() = user_id);
create policy "Users can read own generations" on public.generations for select using (auth.uid() = user_id);
create policy "Users can read own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users can manage own saved guides" on public.saved_guides for all using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists guides_updated_at on public.guides;
create trigger guides_updated_at before update on public.guides for each row execute procedure public.set_updated_at();

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute procedure public.set_updated_at();
