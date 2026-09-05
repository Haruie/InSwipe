# InSwipe

> AI-powered internship matchmaking. Students swipe. Companies choose. The AI explains why.

**Status:** Student app built and running in `student-app/`. Company web dashboard
designed in Figma, not yet built. Backend to follow.
**Products:** A student mobile app and a company web dashboard. Two surfaces, one brand.

| Where | What |
|---|---|
| `student-app/` | The working student app — Vite + React + TS + Tailwind, mock data |
| `figma-build-guide.md` | Paste-by-paste Figma Make prompts |
| `figma-prompts.md` | Full screen-by-screen design spec |
| Student designs | https://dun-rival-31434366.figma.site |
| Company designs | https://chisel-thumb-04330911.figma.site |

---

## 1. What InSwipe is

An internship matchmaking platform that pairs the discovery mechanics of a swipe app
with the utility of a hiring tool. Students discover opportunities by swiping through
job cards ordered best-fit-first. Companies post detailed jobs and review a ranked
dashboard of everyone who applied. An AI scores every student–job pair and — crucially
— **explains the score in both directions**: what the student brings, and what they lack.

**Short version:** AI-powered matchmaking between students and internships.

**Taglines:** *Don't just apply. Find your fit.* · *Swipe in. Stand out.* ·
*Your skills. Their needs. One match.*

The swipe is engagement packaging. The product is the explainable fit score.

---

## 2. The core loop

```
STUDENT (mobile app)                       COMPANY (web dashboard)
────────────────────                       ───────────────────────
Sign up (email / Google / LinkedIn)
        ↓
Upload resume → AI parses → review         Post a detailed job card
   OR fill profile manually                        ↓
        ↓                                   Job enters student decks
Swipe deck, best fit first ───────────────→ Applicants dashboard for that job
   right = apply (+ optional note)                 ↓
   left  = pass                             Ranked by fit. Each applicant shows
   star  = save for later                   what they FIT and what they LACK,
        ↓                                   scored against THIS job.
Resume auto-attaches to the application     Raw resume + AI summary available.
        ↓                                          ↓
Track applications and their status         Company selects a candidate
        ↓                                          ↓
        └────────── INBOX UNLOCKS ─────────────────┘
                         ↓
              Company sends the first message
                         ↓
                   Conversation → interview → internship
```

---

## 3. Hard rules

These are invariants. Do not violate them without an explicit decision to change the product.

1. **Companies never swipe.** No card deck anywhere on the company side. Companies
   evaluate a ranked list. The company product is a decision tool, not a mirror of the
   student app.
2. **The inbox is gated on selection.** No conversation can exist without a company
   having selected that student for that job. Enforce this at the database level, not
   in application code. It is the single rule the whole product hangs on.
3. **The company sends the first message.** Students cannot open a thread.
4. **Never show a score without an explanation.** Every percentage has a path to the
   reasoning behind it. AI is never a black box (see §5).
5. **Fit is always scoped to a job.** There is no global "student score". A candidate
   is 94% for *this* role and 61% for another. Both sides always see a per-job verdict.
6. **Gaps are to-dos, not failures.** Missing skills are shown in orange and phrased
   as next steps. Orange must never read as an error state.
7. **Every gesture has a button.** The swipe deck must be fully operable without
   gestures, for accessibility and for desktop.
8. **Applying is quiet. Being selected is loud.** The celebration belongs at selection.
   If applying gets fanfare, selection has nowhere left to escalate.

---

## 4. Colour meanings

Four semantic colours, each with exactly one meaning. Drift weakens all four.

| Colour | Meaning | Never used for |
|---|---|---|
| Green `#16A34A` | You have this / requirement met / strong fit | Generic success chrome |
| Orange `#EA580C` | You don't have this *yet* / gap to close | Errors, warnings, danger |
| Red `#DC2626` | The pass action | Errors, gaps, anything else |
| Amber `#F59E0B` | Saved / starred | Anything else |

Primary accent is indigo `#4F46E5`. Full token set in `figma-prompts.md` → Prompt A.

---

## 5. The fit score

The percentage must mean something. It is computed from weighted, inspectable criteria
so that both sides can be shown *why*.

### Weights

| Dimension | Weight | How it's computed |
|---|---:|---|
| Required skills coverage | 40% | Proportion of the job's required skills the student has, weighted by evidence strength (see below) |
| Project & experience evidence | 20% | Whether projects/experience actually demonstrate the required skills, not just list them |
| Preferences match | 15% | Work mode, location, stipend expectation vs. what the job offers |
| Preferred skills coverage | 10% | Proportion of the job's nice-to-have skills held |
| Role interest alignment | 10% | Student's stated role interests vs. the job's role category |
| Availability | 5% | Start window and duration compatibility |

### Evidence strength

A skill is not binary. Rank the evidence behind each claimed skill:

- **Strong** — used in a project with a live link or repo, or in prior work experience
- **Moderate** — used in a project without verifiable links, or named in the resume with context
- **Weak** — self-declared only, no supporting evidence

Required-skill coverage is weighted by this, so a student who *built* something with
React outranks one who merely listed it. This is the core defence against resume padding
and the main reason projects matter to the product.

### What the UI shows

The four breakdown bars shown to users group the six dimensions:

- **Skills** = required (40) + preferred (10) → shown out of 50, normalised to a percentage
- **Experience** = project & experience evidence (20)
- **Interests** = role interest alignment (10)
- **Preferences** = preferences (15) + availability (5)

### Bands

`≥85%` strong fit (green) · `70–84%` good fit (indigo) · `<70%` stretch (grey).

Both sides read the same underlying object, phrased from opposite points of view.
Student: *"React — you've used it in 2 projects, and it's a core requirement here."*
Company: *"React — 2 shipped projects using your exact frontend stack."*

---

## 6. Student app (mobile)

### Onboarding

Sign up with email, Google or LinkedIn. **No phone OTP** — email is needed anyway for
notifications, LinkedIn OAuth doubles as light identity verification, and SMS in India
carries DLT registration overhead for no gain.

Then a fork, with the resume path recommended:

- **Upload resume (recommended).** AI parses it into a structured profile. The student
  is then shown **exactly what was extracted** and must confirm it. Low-confidence
  fields are flagged for review. This confirmation screen is not optional — parsing is
  imperfect, and unreviewed bad data poisons every fit score downstream.
- **Manual entry.** Four steps: basic info, skills, projects, preferences.

### Navigation — five tabs

`Discover` · `Applications` · `Saved` · `Inbox` · `Profile`

Inbox shows a padlock instead of a badge until the student's first selection.

### Discover

A card stack ordered best-fit-first, with the ordering stated in the UI. Each card
carries company, role, fit percentage, location and work mode, stipend, duration, and a
skills row where **met requirements are green tags and missing ones are orange outline
tags** — the fit/gap idea is legible before the student taps in.

- **Swipe right / Apply** → opens the note sheet (below)
- **Swipe left / Pass**
- **Star / Save** for later
- **Tap** → job detail

### The application note

Swiping right opens a compact sheet containing an **AI-drafted note**, generated from
the student's profile against that job's requirements. Two actions: *Send with note* and
*Send without*. The note is editable and skippable in one tap.

Deliberate: making the note mandatory would kill the discovery loop. Students stall,
the deck stops feeling like a deck. Optional-but-prefilled gets notes from the students
who care without taxing the ones who don't.

**The student's resume is automatically attached to every application.** No separate
upload step per job.

### Job detail

Full requirements and description, the fit block with the four breakdown bars, and
requirements split into "You meet these" (green) and "You're missing these" (orange).
A link to the **company profile** lives here — reachable from the detail screen only,
never from the swipe card, so it can't interrupt the deck.

### Fit breakdown

A bottom sheet. *What you bring* — green rows with specific evidence. *What to work on*
— orange rows, each phrased as a next step, with an option to add the skill to a
**learning list**. The learning list aggregates gaps across all applications and ranks
them by demand: *"Docker — wanted by 6 of your applications."* This turns rejection into
direction and gives students a reason to return.

### Applications

Every application with a visible status: `Applied` → `Under review` → `Shortlisted` →
`Selected` / `Not selected`. **Students see rejections.** It is kinder than silent
limbo and frees them to move on.

### Inbox

Locked until first selection, and the locked state is designed rather than empty — it
explains what unlocks it and shows the student's active application count, so it reads
as anticipation. Once unlocked: conversation list, chat threads, a system card at the
top of each thread naming the job and fit score, and AI-suggested opening replies.

---

## 7. Company web dashboard

### Onboarding

Work email required — domain matching is how the Verified badge is earned. Three steps:
company profile, team & culture, verification.

### Navigation — left sidebar

`Dashboard` · `My Jobs` · `Applicants` · `Inbox` · `Company Profile` · `Settings`

### Posting a job

A multi-step form with a **live preview of the student-facing swipe card** pinned
alongside. Required and preferred skills are entered separately and visually
distinguished, because required drives the fit score and preferred drives the gap list.
The final step explains the trade-off: stricter requirements mean fewer but
better-fitting applicants.

### The applicants dashboard — the centrepiece

Per job, ranked best-fit-first. Each row shows rank number, avatar, name, education, a
fit ring with a one-line rationale, and — the key detail — **two labelled skill rows**:

```
Fits:   React · JavaScript · REST APIs · Git
Lacks:  Docker · PostgreSQL
```

Sortable (best fit / recent / name), filterable (skill, availability, work mode,
university, graduation year, minimum fit). Soft dividers label a "Strong fits" group and
an "Also applied" tail, so the ranking reads as a judgement rather than a raw sort. A
compare view puts three candidates side by side.

### Candidate review

A right-hand drawer over the dimmed list, so the reviewer never loses their place. It
contains the same fit breakdown as the student sees, re-voiced for a recruiter, plus:

- The **raw resume PDF**, viewable in place
- An **AI resume summary written against this job's requirements** — not a generic
  summary, but a point-by-point read of the resume through the lens of what this role
  actually needs
- Skills with matches highlighted, projects with repo links, experience, education,
  availability and preferences

Actions: *Select candidate*, *Save for later*, *Not a fit*.

### Selection

Selecting opens a confirmation explaining that this notifies the student and unlocks
their inbox. The company-side celebration is deliberately restrained — this is a
workplace tool. The company then sends the first message.

### Pipeline

`Applied → Reviewed → Selected → In conversation → Interview → Offer → Hired`,
as a kanban board.

### Analytics

Per job: impressions, apply rate, average applicant fit, time to first selection, skill
demand, and actionable insight — *"Docker is filtering out 8 otherwise-strong
candidates. Consider moving it to preferred."*

---

## 8. Where AI appears

| Feature | What it does | Surface |
|---|---|---|
| Resume parsing | Resume → structured profile, with per-field confidence | Student onboarding |
| Fit scoring | Student × job → score, breakdown, fits, gaps, reasons | Both |
| Fit explanation | Plain-language reasoning per factor, voiced per audience | Both |
| Application note draft | Profile + job requirements → a suggested note | Student, on swipe right |
| Resume summary | Resume read against a specific job's requirements | Company, candidate drawer |
| Suggested replies | Conversation openers | Both, in chat |
| Skill demand insight | Aggregated gaps → learning list / job tuning advice | Both |

AI has its own restrained visual identity: a subtle gradient (`#6C5CE7 → #A78BFA`), a
sparkle icon, used only at these touchpoints. Do not badge every component with "AI".

---

## 9. Data model

```
users · student_profiles · company_profiles
resumes              file reference + parsed payload + per-field confidence
skills · student_skills   (with evidence_strength: strong | moderate | weak)
projects · experiences · education
jobs · job_required_skills · job_preferred_skills
swipes               student → job: applied | passed | saved
applications         the applied swipe, plus optional note + resume snapshot + status
selections           company → student, scoped to a job — THIS UNLOCKS THE INBOX
conversations · messages
pipeline_stages
fit_scores           cached per student × job: score, breakdown, fits, gaps, reasons
learning_list        gaps a student chose to track
```

Two things to get right early:

**`fit_scores` is the spine.** One object read by both apps — score, four-part
breakdown, requirements met, requirements missing, and a plain-language reason for each.
The student app renders it as *what you bring / what to work on*; the company app
renders the same rows as *what they bring / what they lack*. Build the API around this
shape and mock data swaps for real AI output without touching either UI.

**`selections` is the gate.** A conversation must not be creatable without a matching
row here. Enforce with a foreign key and a database constraint, not application logic.

---

## 10. Tech

**Design:** Figma. Prompts in `figma-prompts.md`.

**Student app:** mobile. Framework undecided — React Native / Expo is the likely choice
given the web dashboard will be React, letting the two share types and the fit-score
client.

**Company dashboard:** Next.js + React + TypeScript + Tailwind.

**Backend:** undecided. Supabase is a strong candidate — Postgres with row-level
security maps cleanly onto the selection gate, and auth, file storage for resumes, and
realtime for chat all come in the box.

**AI:** Claude for resume parsing, fit reasoning and summarisation. Embeddings for
semantic skill matching so *React* relates to *frontend development* without exact
string equality.

### Phasing

1. Figma designs for both products
2. Company web dashboard with mock data
3. Student app with mock data
4. Backend: schema, auth, the selection gate
5. AI: resume parsing, then fit scoring
6. Chat

---

## 11. Design principles

- **Fit quality over listing quantity.** Show the right opportunities, not all of them.
- **Explain every AI decision.** Never a black box.
- **Both sides are customers.** The company product is not an admin panel.
- **Students are more than resumes.** Projects and evidence outweigh claimed skills.
- **Professional first.** Fun without being childish. A recruiter must take it seriously.
- **Not a dating app clone.** The card is an opportunity, not a person.
- **Not a LinkedIn clone.** Avoid dense tables, corporate blue, tiny type.

Visual target: 60% professional, 20% social, 10% playful, 10% AI.
Quality references: Linear's precision, Stripe's restraint, Notion's warmth.

---

## 12. Rules for AI agents working on this repo

1. Read existing code before changing it. Don't rewrite what works.
2. Reuse components. No duplicates. No giant page-sized components.
3. Keep mock data in a separate layer, never inline in components.
4. Don't add backend dependencies during the design and mock-data phases.
5. Don't change the design direction without discussing it first.
6. Use TypeScript properly. Avoid unnecessary dependencies.
7. Respect the hard rules in §3 — especially the inbox gate.
8. Use realistic mock data. Never `Company 1`, `Test Job`, or lorem ipsum.
   Real-sounding companies, Indian salary ranges and cities, plausible student profiles.
9. Make every interaction demonstrable. No placeholder screens.
10. Every screen needs its loading, empty, error and success states designed.

---

## 13. Open questions

- Does a student see *which* company viewed their profile, or only that someone did?
- Can a company reopen a candidate they marked "Not a fit"?
- Do students get a cap on active applications, to stop spray-and-pray?
- Is there a student-facing company search, or is discovery swipe-only?
- What happens to conversations when a job closes or is filled?
