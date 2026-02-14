# Progress tracking

Let's work on a feature where we don't only see like the weekly trainings, but we also can track progress. So for like the upcoming week, I want to see what trainings I should do with my dog for every day. UX below. And I want to be able to track results. So whenever I did or did not do a training, I want to indicate that in the app, give a score, and add some additional notes on the session.

## Design

For this, we need another aggregate. Uh we have dogs, we have plans, and we have trainings, but I want to introduce a new kind of uh aggregate uh which is called a session. A session can be like a plan session in the future, or it could already have been completed or be in the past. And it links, of course, to uh training and uh optionally uh uh training plan, and it always links back to a dog because uh that's like the the foreign key.

Sessions are Calculated on the fly when we are navigating through the date picker of a dog's upcoming sessions. So we don't pre-compute all the future sessions, we only uh show them when we request like a week uh through the UI (backend endpoint computes them when requesting future sessions in the calendar, based on the dog ID's and its associated training plans). And then again, and then we only persist the sessions if we mark them as completed or skipped. So we don't have to pre-populate the database with all the future sessions, we only create them when we mark them as completed or skipped.

## UX

Mobile-first, you want vertical, date-centric, single-action flows. Grid calendars die on phones.

1) Top-level: week strip + agenda

This should be the default.

<  Feb 2026  >

Mon   Tue   Wed   Thu   Fri   Sat   Sun
 9     10    11    12    13   [14]   15
       •           •           ★

--------------------------------
Sat 14 February 2026

Leash training
Status: Completed   Score: 4/10
Note: “Distracted by dogs”
[ Edit ]

Focus training
Status: Planned
[ Check off ]

Why

Horizontal week strip = fast date switching

Vertical agenda = unlimited items

One day = one mental context

Acceptance-level rules

Tap a date → agenda swaps instantly

Today is auto-selected on open

Dot/marker under date = at least one completed/skipped session

Star/badge = missed or low-score session (future analytics hook)

2) Check-off flow (bottom sheet)

Never navigate away.

──────── Training ────────
Leash training
Sat 14 Feb 2026

Status
(•) Completed
( ) Skipped

Score
[ 1 ][ 2 ][ 3 ][ 4 ][ 5 ]
[ 6 ][ 7 ][ 8 ][ 9 ][10 ]

Notes
────────────────────
Distracted by dogs
────────────────────

[ Save ]

Rules

Score appears only when Completed

One primary action: Save

Save = upsert session

3) Session card (collapsed vs expanded)

Collapsed (default):

Leash training        4/10 ✓

Expanded (tap):

Leash training        ✓ Completed
Score: 4/10
Note: Distracted by dogs
[ Edit ]   [ Remove ]

Rules

No edit affordances unless expanded

Remove = delete session (revert to planned)

4) Navigation hierarchy (keep it boring)
Dog
 └── Plan
      └── Progress (this screen)

No deep drill-down unless you later add analytics.

5) What not to do

❌ Month grid as primary view

❌ Inline editing inside a crowded list

❌ Separate “notes” screen

❌ Forcing score input

6) Mental model you’re reinforcing

Plans predict

Days happen

Sessions record reality

The UI should feel like:

“What happened today?”
not
“Let me manage a training database.”
