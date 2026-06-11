revoke execute on function public.workshop_valid_moderator(text, text)
from public, anon, authenticated;

create index if not exists workshop_questions_session_status_created_idx
on public.workshop_questions(session_id, status, created_at desc);

create index if not exists workshop_followups_group_created_idx
on public.workshop_followups(group_id, created_at desc)
where group_id is not null;
