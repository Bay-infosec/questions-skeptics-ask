create extension if not exists pgcrypto;

create table if not exists public.workshop_sessions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  active boolean not null default true,
  moderator_code_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workshop_groups (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workshop_sessions(id) on delete cascade,
  name text not null,
  leader_name text,
  access_code_hash text not null,
  sort_order integer not null default 0,
  unique (session_id, name)
);

create table if not exists public.workshop_poll_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workshop_sessions(id) on delete cascade,
  attendee_id uuid not null,
  choice text not null check (char_length(choice) between 1 and 180),
  created_at timestamptz not null default now(),
  unique (session_id, attendee_id)
);

create table if not exists public.workshop_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workshop_sessions(id) on delete cascade,
  attendee_id uuid not null,
  question text not null check (char_length(question) between 3 and 1200),
  status text not null default 'new' check (status in ('new', 'featured', 'answered')),
  created_at timestamptz not null default now()
);

create table if not exists public.workshop_followups (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workshop_sessions(id) on delete cascade,
  attendee_id uuid not null,
  group_id uuid references public.workshop_groups(id) on delete set null,
  next_steps text[] not null default '{}',
  first_name text,
  phone text,
  instagram text,
  email text,
  preferred_contact text,
  spiritual_interest text not null,
  prayer_request text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, attendee_id)
);

alter table public.workshop_sessions enable row level security;
alter table public.workshop_groups enable row level security;
alter table public.workshop_poll_responses enable row level security;
alter table public.workshop_questions enable row level security;
alter table public.workshop_followups enable row level security;

revoke all on public.workshop_sessions from anon, authenticated;
revoke all on public.workshop_groups from anon, authenticated;
revoke all on public.workshop_poll_responses from anon, authenticated;
revoke all on public.workshop_questions from anon, authenticated;
revoke all on public.workshop_followups from anon, authenticated;

create or replace function public.workshop_get_public(p_slug text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', s.id,
    'title', s.title,
    'subtitle', s.subtitle,
    'groups', coalesce((
      select jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name, 'leader_name', g.leader_name) order by g.sort_order)
      from public.workshop_groups g where g.session_id = s.id
    ), '[]'::jsonb)
  )
  from public.workshop_sessions s
  where s.slug = p_slug and s.active = true
  limit 1;
$$;

create or replace function public.workshop_submit_poll(p_slug text, p_choice text, p_attendee_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_session_id uuid;
begin
  select id into v_session_id from public.workshop_sessions where slug = p_slug and active = true;
  if v_session_id is null then raise exception 'Workshop unavailable'; end if;
  if char_length(trim(p_choice)) not between 1 and 180 then raise exception 'Invalid response'; end if;
  insert into public.workshop_poll_responses(session_id, attendee_id, choice)
  values (v_session_id, p_attendee_id, trim(p_choice))
  on conflict (session_id, attendee_id) do update set choice = excluded.choice, created_at = now();
end;
$$;

create or replace function public.workshop_submit_question(p_slug text, p_question text, p_attendee_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_session_id uuid;
begin
  select id into v_session_id from public.workshop_sessions where slug = p_slug and active = true;
  if v_session_id is null then raise exception 'Workshop unavailable'; end if;
  if char_length(trim(p_question)) not between 3 and 1200 then raise exception 'Invalid question'; end if;
  insert into public.workshop_questions(session_id, attendee_id, question)
  values (v_session_id, p_attendee_id, trim(p_question));
end;
$$;

create or replace function public.workshop_submit_followup(
  p_slug text,
  p_attendee_id uuid,
  p_next_steps text[],
  p_first_name text,
  p_phone text,
  p_instagram text,
  p_email text,
  p_preferred_contact text,
  p_group_id uuid,
  p_spiritual_interest text,
  p_prayer_request text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_session_id uuid;
begin
  select id into v_session_id from public.workshop_sessions where slug = p_slug and active = true;
  if v_session_id is null then raise exception 'Workshop unavailable'; end if;
  if nullif(trim(p_spiritual_interest), '') is null then raise exception 'Spiritual interest is required'; end if;
  if p_group_id is not null and not exists (
    select 1 from public.workshop_groups where id = p_group_id and session_id = v_session_id
  ) then raise exception 'Invalid group'; end if;
  insert into public.workshop_followups(
    session_id, attendee_id, group_id, next_steps, first_name, phone, instagram,
    email, preferred_contact, spiritual_interest, prayer_request
  ) values (
    v_session_id, p_attendee_id, p_group_id, coalesce(p_next_steps, '{}'),
    nullif(trim(p_first_name), ''), nullif(trim(p_phone), ''), nullif(trim(p_instagram), ''),
    nullif(trim(p_email), ''), nullif(trim(p_preferred_contact), ''), trim(p_spiritual_interest),
    nullif(trim(p_prayer_request), '')
  )
  on conflict (session_id, attendee_id) do update set
    group_id = excluded.group_id,
    next_steps = excluded.next_steps,
    first_name = excluded.first_name,
    phone = excluded.phone,
    instagram = excluded.instagram,
    email = excluded.email,
    preferred_contact = excluded.preferred_contact,
    spiritual_interest = excluded.spiritual_interest,
    prayer_request = excluded.prayer_request,
    updated_at = now();
end;
$$;

create or replace function public.workshop_valid_moderator(p_slug text, p_access_code text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from public.workshop_sessions
  where slug = p_slug and active = true
    and moderator_code_hash = extensions.crypt(p_access_code, moderator_code_hash)
  limit 1;
$$;

create or replace function public.workshop_get_poll_results(p_slug text, p_access_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_session_id uuid;
declare v_choices text[] := array[
  'I often worry about my future.',
  'I feel pressure to succeed.',
  'I sometimes feel alone even around people.',
  'I am still figuring out who I am.',
  'I wonder what my purpose is.',
  'I feel like something is missing.',
  'Other'
];
begin
  v_session_id := public.workshop_valid_moderator(p_slug, p_access_code);
  if v_session_id is null then raise exception 'Invalid access code'; end if;
  return jsonb_build_object(
    'total', (select count(*) from public.workshop_poll_responses where session_id = v_session_id),
    'results', (
      select jsonb_agg(jsonb_build_object('choice', c.choice, 'count', (
        select count(*) from public.workshop_poll_responses r where r.session_id = v_session_id and r.choice = c.choice
      )) order by c.ordinality)
      from unnest(v_choices) with ordinality c(choice, ordinality)
    )
  );
end;
$$;

create or replace function public.workshop_get_moderator_data(p_slug text, p_access_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_session_id uuid;
begin
  v_session_id := public.workshop_valid_moderator(p_slug, p_access_code);
  if v_session_id is null then raise exception 'Invalid access code'; end if;
  return jsonb_build_object(
    'metrics', jsonb_build_object(
      'poll_responses', (select count(*) from public.workshop_poll_responses where session_id = v_session_id),
      'questions', (select count(*) from public.workshop_questions where session_id = v_session_id),
      'followups', (select count(*) from public.workshop_followups where session_id = v_session_id),
      'contact_requests', (select count(*) from public.workshop_followups where session_id = v_session_id and 'I''d like someone to contact me.' = any(next_steps))
    ),
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'question', question, 'status', status, 'created_at', created_at)
        order by case status when 'featured' then 0 when 'new' then 1 else 2 end, created_at desc)
      from public.workshop_questions where session_id = v_session_id
    ), '[]'::jsonb),
    'next_steps', (
      select jsonb_agg(jsonb_build_object('label', step, 'count', (
        select count(*) from public.workshop_followups f where f.session_id = v_session_id and step = any(f.next_steps)
      )))
      from unnest(array[
        'I trusted Christ tonight.',
        'I want to explore Christianity.',
        'I''d like someone to contact me.',
        'I''d like prayer.',
        'I''d like to read the Bible with someone.',
        'I''d like to join Explore Jesus.',
        'I still have questions.',
        'I''m not ready yet.'
      ]) step
    )
  );
end;
$$;

create or replace function public.workshop_update_question_status(
  p_slug text, p_access_code text, p_question_id uuid, p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_session_id uuid;
begin
  v_session_id := public.workshop_valid_moderator(p_slug, p_access_code);
  if v_session_id is null then raise exception 'Invalid access code'; end if;
  if p_status not in ('new', 'featured', 'answered') then raise exception 'Invalid status'; end if;
  update public.workshop_questions set status = p_status
  where id = p_question_id and session_id = v_session_id;
end;
$$;

create or replace function public.workshop_get_leader_data(p_slug text, p_access_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_session_id uuid;
declare v_group_id uuid;
begin
  select s.id, g.id into v_session_id, v_group_id
  from public.workshop_sessions s
  join public.workshop_groups g on g.session_id = s.id
  where s.slug = p_slug and s.active = true
    and g.access_code_hash = extensions.crypt(p_access_code, g.access_code_hash)
  limit 1;
  if v_group_id is null then raise exception 'Invalid access code'; end if;
  return jsonb_build_object(
    'group', (
      select jsonb_build_object('id', id, 'name', name, 'leader_name', leader_name)
      from public.workshop_groups where id = v_group_id
    ),
    'responses', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'next_steps', next_steps, 'first_name', first_name, 'phone', phone,
        'instagram', instagram, 'email', email, 'preferred_contact', preferred_contact,
        'spiritual_interest', spiritual_interest, 'prayer_request', prayer_request,
        'created_at', created_at
      ) order by created_at desc)
      from public.workshop_followups where session_id = v_session_id and group_id = v_group_id
    ), '[]'::jsonb)
  );
end;
$$;

revoke execute on function public.workshop_valid_moderator(text, text) from public, anon, authenticated;

grant execute on function public.workshop_get_public(text) to anon, authenticated;
grant execute on function public.workshop_submit_poll(text, text, uuid) to anon, authenticated;
grant execute on function public.workshop_submit_question(text, text, uuid) to anon, authenticated;
grant execute on function public.workshop_submit_followup(text, uuid, text[], text, text, text, text, text, uuid, text, text) to anon, authenticated;
grant execute on function public.workshop_get_poll_results(text, text) to anon, authenticated;
grant execute on function public.workshop_get_moderator_data(text, text) to anon, authenticated;
grant execute on function public.workshop_update_question_status(text, text, uuid, text) to anon, authenticated;
grant execute on function public.workshop_get_leader_data(text, text) to anon, authenticated;

insert into public.workshop_sessions(slug, title, subtitle, moderator_code_hash)
values (
  'questions-skeptics-ask',
  'Questions Skeptics Ask About Christianity',
  'Identity. Meaning. Hope.',
  extensions.crypt(encode(gen_random_bytes(18), 'hex'), extensions.gen_salt('bf'))
)
on conflict (slug) do nothing;

insert into public.workshop_groups(session_id, name, leader_name, access_code_hash, sort_order)
select s.id, 'Group ' || n, null, extensions.crypt(encode(gen_random_bytes(18), 'hex'), extensions.gen_salt('bf')), n
from public.workshop_sessions s
cross join generate_series(1, 10) n
where s.slug = 'questions-skeptics-ask'
on conflict (session_id, name) do nothing;
