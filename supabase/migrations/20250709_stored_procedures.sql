-- Create a function to handle template usage atomically
create or replace function use_template(
  p_user_id uuid,
  p_template_id text,
  p_credit_cost int
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_remaining_credits int;
  v_template_usage jsonb;
begin
  -- Lock the user metrics row for update
  select (daily_limit - chats_used) into v_remaining_credits
  from user_metrics
  where user_id = p_user_id
  for update;

  -- Check if we have enough credits
  if v_remaining_credits < p_credit_cost then
    raise exception 'Insufficient credits. Required: %, Available: %', p_credit_cost, v_remaining_credits;
  end if;

  -- Update metrics
  update user_metrics
  set chats_used = chats_used + p_credit_cost,
      last_updated = now()
  where user_id = p_user_id;

  -- Insert template usage record
  insert into template_usage (
    user_id,
    template_id,
    credit_cost,
    credits_remaining,
    metadata
  ) values (
    p_user_id,
    p_template_id,
    p_credit_cost,
    v_remaining_credits - p_credit_cost,
    jsonb_build_object(
      'timestamp', now(),
      'previous_remaining', v_remaining_credits
    )
  )
  returning jsonb_build_object(
    'id', id,
    'user_id', user_id,
    'template_id', template_id,
    'credit_cost', credit_cost,
    'credits_remaining', credits_remaining,
    'created_at', created_at
  ) into v_template_usage;

  return v_template_usage;
end;
$$;
