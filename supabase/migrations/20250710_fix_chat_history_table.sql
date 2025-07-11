-- Fix chat_history table schema to ensure all required columns exist
-- This migration can be safely run multiple times

-- Drop and recreate the chat_history table to ensure proper schema
drop table if exists public.chat_history;

-- Create chat_history table with all required columns
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

-- Add indexes for better performance
create index idx_chat_history_user_id on public.chat_history(user_id);
create index idx_chat_history_session_id on public.chat_history(session_id);
create index idx_chat_history_created_at on public.chat_history(created_at);

-- Enable RLS (Row Level Security)
alter table public.chat_history enable row level security;

-- Create policy for chat_history
create policy "Users can view and create their own chat history"
  on public.chat_history
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on table public.chat_history to authenticated;
grant select on table public.chat_history to anon;
