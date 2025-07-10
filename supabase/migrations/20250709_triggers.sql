-- Function to update user metrics on successful purchase
create or replace function handle_purchase_insert()
returns trigger as $$
begin
  -- Only process completed purchases
  if new.status = 'completed' then
    -- Update user metrics
    insert into user_metrics (user_id, daily_limit, chats_used, is_pro, last_purchase, last_updated)
    values (
      new.user_id,
      coalesce((select daily_limit from user_metrics where user_id = new.user_id), 5) + new.credits,
      coalesce((select chats_used from user_metrics where user_id = new.user_id), 0),
      coalesce((select is_pro from user_metrics where user_id = new.user_id), false),
      new.created_at,
      new.created_at
    )
    on conflict (user_id)
    do update set
      daily_limit = user_metrics.daily_limit + excluded.daily_limit - coalesce((select daily_limit from user_metrics where user_id = new.user_id), 5),
      last_purchase = excluded.last_purchase,
      last_updated = excluded.last_updated;

    -- Add purchase record to chat history
    insert into chat_history (
      user_id,
      message,
      response,
      message_type,
      metadata
    ) values (
      new.user_id,
      'Credits purchased',
      format('Added %s credits to your account', new.credits),
      'purchase',
      jsonb_build_object(
        'credits', new.credits,
        'amount', new.amount,
        'stripe_session_id', new.stripe_session_id
      )
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for purchase processing
drop trigger if exists on_purchase_insert on purchases;
create trigger on_purchase_insert
  after insert on purchases
  for each row
  execute function handle_purchase_insert();

-- Function to validate template usage
create or replace function validate_template_usage()
returns trigger as $$
declare
  remaining_credits integer;
begin
  -- Get remaining credits
  select (daily_limit - chats_used) into remaining_credits
  from user_metrics
  where user_id = new.user_id;

  -- Check if enough credits
  if remaining_credits < new.credit_cost then
    raise exception 'Insufficient credits. Required: %, Available: %', new.credit_cost, remaining_credits;
  end if;

  -- Update user metrics
  update user_metrics
  set chats_used = chats_used + new.credit_cost,
      last_updated = now()
  where user_id = new.user_id;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger for template usage validation
drop trigger if exists before_template_usage_insert on template_usage;
create trigger before_template_usage_insert
  before insert on template_usage
  for each row
  execute function validate_template_usage();

-- Function to reset daily usage at midnight UTC
create or replace function reset_daily_usage()
returns void as $$
declare
  last_reset timestamp;
begin
  -- Get last reset time from user_metrics
  select min(last_updated) into last_reset from user_metrics;
  
  -- Only reset if it's been more than a day since the last reset
  if last_reset < current_date then
    update user_metrics
    set chats_used = 0,
        last_updated = now()
    where chats_used > 0;
  end if;
end;
$$ language plpgsql security definer;

-- Create a cron job to reset usage daily
select cron.schedule(
  'reset-daily-usage',  -- name of the cron job
  '0 0 * * *',         -- run at midnight UTC
  $$select reset_daily_usage()$$
);
