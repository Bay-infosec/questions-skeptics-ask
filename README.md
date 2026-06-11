# Questions Skeptics Ask

A mobile-first workshop companion built around one QR code. Attendees can answer a live poll, submit anonymous questions, and share optional next steps. Hosts get projector and moderator views, while group leaders see only responses assigned to their group.

## Views

- `/` attendee flow
- `/?view=projector` live poll and QR code
- `/?view=moderator` anonymous questions and workshop metrics
- `/?view=leader` group-specific follow-up

## Local setup

```bash
cp .env.example .env
npm install
npm run dev
```

Apply `supabase/migrations/20260611070000_workshop_qr_system.sql` to a Supabase project, then configure:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_WORKSHOP_SLUG=questions-skeptics-ask
```

## Access codes

The migration creates unusable random seed hashes. Before an event, set one host code and a unique code for each group by replacing the stored bcrypt hashes. Never commit plaintext access codes.
