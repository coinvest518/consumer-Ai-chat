-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User metrics table
create table public.user_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  daily_limit integer not null default 5,
  chats_used integer not null default 0,
  is_pro boolean not null default false,
  last_purchase timestamp with time zone,
  last_updated timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS (Row Level Security)
alter table public.user_metrics enable row level security;

-- Create policy for user_metrics
create policy "Users can view and update their own metrics"
  on public.user_metrics
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Chat history table with messages as JSONB for flexibility
create table public.chat_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id uuid not null default uuid_generate_v4(),
  message text not null,
  response text not null,
  message_type text not null default 'chat',
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.chat_history enable row level security;

-- Create policy for chat_history
create policy "Users can view and create their own chat history"
  on public.chat_history
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Emails table for tracking sent/scheduled emails
create table public.emails (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  sender text,
  recipients jsonb not null,
  subject text not null,
  body text not null,
  status text not null default 'pending',
  metadata jsonb,
  scheduled_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.emails enable row level security;

-- Create policy for emails
create policy "Users can view and create their own emails"
  on public.emails
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Template usage tracking
create table public.template_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  template_id text not null,
  credit_cost integer not null,
  credits_remaining integer not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.template_usage enable row level security;

-- Create policy for template_usage
create policy "Users can view and create their own template usage"
  on public.template_usage
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Purchase history
create table public.purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  amount decimal(10,2) not null,
  credits integer not null,
  stripe_session_id text,
  status text not null default 'completed',
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.purchases enable row level security;

-- Create policy for purchases
create policy "Users can view their own purchases"
  on public.purchases
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create indexes for performance
create index chat_history_user_id_idx on public.chat_history(user_id);
create index chat_history_session_id_idx on public.chat_history(session_id);
create index user_metrics_user_id_idx on public.user_metrics(user_id);
create index emails_user_id_idx on public.emails(user_id);
create index emails_scheduled_time_idx on public.emails(scheduled_time) where status = 'pending';
create index template_usage_user_id_idx on public.template_usage(user_id);
create index purchases_user_id_idx on public.purchases(user_id);
create index purchases_stripe_session_idx on public.purchases(stripe_session_id) where stripe_session_id is not null;
