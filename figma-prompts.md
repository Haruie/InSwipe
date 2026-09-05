# InSwipe — Figma UI/UX Prompts

Two products, one brand:
- **Student mobile app** — iOS, 390×844
- **Company web dashboard** — desktop, 1440×1024

Three prompts, run in order. Each is self-contained (it restates the design system) so
it still works if Figma loses context between sessions.

- **Prompt A — Foundations.** Run once. Variables, type styles, core components.
- **Prompt B — Student mobile app.** 33 screens.
- **Prompt C — Company web dashboard + landing page.** 23 screens.

Run B and C in separate files or pages, both consuming Prompt A's library. If your Figma
tool chokes on the length of B or C, split at the `---- SECTION ----` markers and run
each section as a follow-up in the same conversation.

Full product context lives in `CLAUDE.md`.

---

## The model these prompts are built on

```
STUDENT (mobile)                          COMPANY (web)
─────────────────                         ─────────────
Sign up — email / Google / LinkedIn
   ↓
Resume upload → AI parses → review        Post a detailed job card
   OR manual profile entry                       ↓
   ↓                                      Job enters student decks
Swipe deck, best fit first ──────────────→ Applicants dashboard, ranked
   right = apply + optional AI-drafted     Each shows what they FIT and
           note; resume auto-attached      what they LACK for THIS job,
   left  = pass                            plus raw resume + AI summary
   star  = save                            read against the requirements
   ↓                                              ↓
Track applications; see real statuses      Company selects a candidate
   ↓                                              ↓
        ┌──────── INBOX UNLOCKS ────────┐
        │  Only on selection. The        │
        │  COMPANY sends first.          │
        └────────────────────────────────┘
```

**The inbox is the reward.** Nothing before selection is a conversation. That constraint
should be visible in the UI, not merely enforced by it.

---

# PROMPT A — Design Foundations

```
Create a design system foundation page for "InSwipe", an AI-powered internship
matchmaking platform with a student mobile app and a company web dashboard. Set
everything up as reusable Figma variables, text styles and components with variants.
Do not design screens yet — foundations only.

BRAND
InSwipe. Personality: 60% professional, 20% social, 10% playful, 10% AI. Credible to a
corporate recruiter, engaging to a 20-year-old student. Reference quality: Linear's
precision, Stripe's restraint, Notion's warmth. Explicitly NOT: Bootstrap admin panels,
corporate-blue enterprise dashboards, dense grey data tables, or a dating-app clone.

Design a simple wordmark and an app icon mark for "InSwipe" — the mark should suggest
forward motion or a swipe without being literal about it. Provide the mark in primary
indigo, in white for dark grounds, and as a monochrome version.

COLOR VARIABLES — collection named "color"

Primary:
  primary/600   #4338CA   pressed
  primary/500   #4F46E5   base brand accent
  primary/300   #A5B4FC
  primary/100   #EEF0FF   tint fill for selected chips and badges

Neutrals:
  ink/900       #0F1117   primary text (near-black, never pure black)
  ink/700       #374151   secondary text
  ink/500       #6B7280   muted text, captions
  ink/300       #9CA3AF   placeholder, disabled
  border        #E8E8EF
  surface       #FFFFFF   cards, sheets, inputs
  background    #F7F7FB   app canvas
  overlay       #0F1117 at 55%

Semantic — each has exactly ONE meaning, never reused:
  fit/600       #15803D
  fit/500       #16A34A   requirement met · strong fit · the Apply action
  fit/100       #DCFCE7
  gap/600       #C2410C
  gap/500       #EA580C   missing skill · a gap to close — a nudge, NOT an error
  gap/100       #FFEDD5
  pass/500      #DC2626   the Pass action ONLY — never for errors or gaps
  save/500      #F59E0B   save / star ONLY
  lock/500      #6B7280   locked states

AI accent — sparingly: resume parsing, fit analysis, note drafting, selection moment,
landing hero only:
  ai/gradient   linear 135°, #6C5CE7 → #A78BFA

The colour split is deliberate: green = you have this, orange = you don't have it YET,
red = pass, amber = saved. Orange must never read as an error. A gap is a to-do.

TYPOGRAPHY — Inter throughout.

Desktop:
  display/xl 72/76 w700 -2%      heading/md 24/32 w600
  display/lg 56/62 w700 -1.5%    heading/sm 20/28 w600
  heading/xl 40/48 w700 -1%      body/lg 17/26 w400
  heading/lg 32/40 w600 -0.5%    body/md 15/24 w400
  body/sm 14/20 w400             label/md 14/20 w600
  label/sm 13/18 w600            caption 12/16 w500 +2% uppercase

Mobile (suffix "/m"):
  heading/xl/m 32/38 w700 -1%    heading/lg/m 24/30 w700
  heading/md/m 20/26 w600        body/md/m 15/22 w400
  body/sm/m 13/19 w400           label/sm/m 13/18 w600

Nothing below 12px anywhere.

SPACING — 4px base: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
RADIUS — sm 8, md 12, lg 16, xl 20, 2xl 28, full 999
ELEVATION — soft and low:
  shadow/sm   0 1px 3px  rgba(15,17,23,0.06)
  shadow/md   0 4px 12px rgba(15,17,23,0.08)
  shadow/lg   0 12px 32px rgba(15,17,23,0.12)
  shadow/card 0 8px 24px rgba(15,17,23,0.10)   swipe cards only
ICONS — Lucide, 1.75px stroke, 20px default, 24px in navigation.

COMPONENTS — auto-layout, full variant sets including default / hover / pressed /
focused / disabled. Focus is always a 2px primary/500 ring at 2px offset, never the
browser default.

  Button        primary, secondary, ghost, danger, icon-only · sm 36h, md 44h, lg 52h
  Input         44h mobile / 40h desktop, label above, helper text, error state
  Textarea      min 96h, with an optional character counter
  FileDropzone  dashed border, upload icon, "Drop your resume or browse"
                states: idle, hover, uploading (progress), success, error
  Chip          selectable: default / selected (primary/100 fill, primary/500 border
                and text) / disabled / removable (with x)
  Tag           read-only: neutral, primary, fit (green fill), gap (orange outline)
  Avatar        24/32/40/56/80, image or initials, optional online dot
  CompanyLogo   rounded square, radius md, 32/44/64
  FitScore      THE signature component. Variants:
                  pill — inline badge "92% fit", fit/100 bg, fit/600 text, radius full
                  ring — circular progress, score centred, sizes 48/72/120
                  bar  — labelled horizontal bar for breakdown rows
                Bands: ≥85% fit/500 "Strong fit" · 70-84% primary/500 "Good fit"
                       · <70% ink/500 "Stretch"
  FitRow        green check + requirement + one plain sentence of evidence
  GapRow        orange hollow circle + missing skill + one actionable sentence
  FitBreakdown  composite: FitScore ring + 4 FitScore bars + FitRows + GapRows.
                Used on BOTH products with the voice swapped.
  StatusTag     Applied (neutral) · Under review (primary) · Shortlisted (primary
                filled) · Selected (fit green) · Not selected (ink/300)
  ResumeCard    file icon + filename + size + uploaded date, with View and Replace
  AISummaryCard subtle AI-gradient left border, sparkle icon, "AI SUMMARY" caption
                label, body text, and a "How this was generated" info affordance
  LockedState   padlock + heading + explanatory line
  ProgressBar   4h, radius full
  Toast         ink/900 at 88%, white text, radius lg
  Modal         centred, radius 2xl, shadow/lg
  BottomSheet   mobile, radius 2xl top corners, drag handle
  EmptyState    icon + heading + one line + optional action
  Skeleton      shimmer blocks in border color

Lay foundations out on one page, grouped and labelled: Brand, Color, Type, Spacing,
Radius, Elevation, Icons, Components. Label every swatch with its variable name and hex.
```

---

# PROMPT B — Student Mobile App

```
Design the InSwipe student mobile app. iOS, frames 390×844, safe areas respected (59px
status bar, 34px home indicator). Design system: Inter, primary #4F46E5, background
#F7F7FB, surface #FFFFFF, text #0F1117, fit green #16A34A, gap orange #EA580C, pass red
#DC2626, save amber #F59E0B, radii 12/16/20, soft low shadows. 60% professional,
20% social, 10% playful, 10% AI.

HOW THE PRODUCT WORKS — design to this exactly
A student signs up with email, Google or LinkedIn, then either uploads a resume that AI
reads into a profile, or fills it in manually. They swipe through job cards ordered
best-fit-first: right to apply, left to pass, star to save. Swiping right opens a short
sheet with an AI-drafted note they can send, edit or skip in one tap; their resume
attaches automatically. Every job shows which requirements they already meet and which
they lack. They apply to many jobs and track real statuses, including rejections. THE
INBOX STAYS LOCKED until a company selects them, and the COMPANY sends the first
message. Being selected is the payoff the whole app builds toward.

Every gesture needs a visible button equivalent. Design accessible states throughout.

---- SECTION 1: SIGN UP AND PROFILE BUILDING ----

1. Splash — dark violet gradient (#1B1730 → #3B2A6E). InSwipe mark + wordmark top-left.
   Headline "Swipe in. Stand out." with the second line in #A78BFA. Sub-line
   "AI-powered matching between students and the companies hiring them."
   Primary "Get Started", text link "I already have an account".

2. Intro carousel — 3 screens, page dots, Skip top-right. Large graphic, short heading,
   one sentence each:
   (a) "Your resume, understood" — AI reading a resume into a profile
   (b) "Jobs ranked by how well you fit" — the card deck
   (c) "Get selected, then talk" — a padlock opening into a chat

3. Sign up / Sign in — segmented control. Fields: Full name, Email, Password with
   show/hide. Primary CTA. Divider "or continue with". Two prominent OAuth buttons:
   Google and LinkedIn, full-width with logos — LinkedIn labelled "Continue with
   LinkedIn — imports your profile". No phone option. Terms footnote. Include the
   disabled CTA state and one field-level error state.

4. THE FORK — "How would you like to build your profile?"
   Two large stacked option cards, generous and tappable:
     (a) PRIMARY, visually dominant, subtle AI gradient border, sparkle icon:
         "Upload your resume" — "We'll read it and build your profile in seconds.
         You can edit everything after." Badge: "Fastest — about 30 seconds"
     (b) Secondary, plain surface: "Fill it in manually" — "Enter your details
         yourself. About 5 minutes."
   Make (a) clearly recommended without disabling (b).

5. Resume upload — a FileDropzone filling most of the screen: "Drop your resume here or
   browse". Accepted formats line (PDF, DOC, DOCX · max 5MB). A privacy reassurance:
   "Your resume is sent only to companies you apply to."

6. Resume parsing — a full-screen AI moment. An animated document-to-profile visual on
   the AI gradient. A checklist revealing line by line:
     ✓ Reading your resume
     ✓ Extracting skills
     ✓ Finding your projects
     ⟳ Ranking opportunities for you
   Under ~8 seconds of implied duration. No fake progress bars that stall.

7. Review extracted profile — CRITICAL SCREEN, design it carefully.
   Header: "Here's what we found" / "Check it over — you can change anything."
   Everything extracted, as editable cards with inline edit affordances:
     - Basic info: name, email, phone, university, degree, graduation year
     - Skills: extracted skills as removable chips, plus "+ Add skill"
     - Projects: name, description, tech tags, links
     - Experience: role, company, dates
     - Education
   Low-confidence fields get a dotted orange underline and a small "Confirm?" tag.
   Show at least two fields flagged that way — the state has to be visible.
   Sticky footer: "Looks good — continue" primary.

8. Manual profile — step 1 of 4, Basic info. Progress bar, back arrow. Circular photo
   uploader with camera badge, Full name, University (searchable), Degree, Field of
   study, Graduation year.

9. Manual profile — step 2 of 4, Skills. Search field, popular skills as chips in a
   wrapped grid, "Add custom skill", live count ("6 selected"), selected pinned at top.
   Minimum 3.

10. Manual profile — step 3 of 4, Projects. Empty state: "Projects are how companies see
    what you can actually build." Then an add-project bottom sheet: Name, Description,
    Tech stack chips, GitHub URL, Live demo URL, Your contribution. Then a filled state
    with 2 project cards.

11. Manual profile — step 4 of 4, Preferences. Role interests as chips (Frontend,
    Backend, Full Stack, AI/ML, Data Science, UI/UX, Product, Marketing, Finance,
    Research). Work mode segmented (Remote / Hybrid / On-site). Preferred locations
    multi-select. Duration segmented (1 / 2 / 3 / 6 months). Stipend chips (Unpaid,
    ₹5k+, ₹10k+, ₹20k+, ₹30k+, Flexible). CTA "Find my opportunities".

12. Add a resume later — for students who chose manual entry: a prompt card on the
    profile screen, "Add your resume — companies see it with every application."

Both paths converge on Discover.

---- SECTION 2: DISCOVER — THE CORE SCREEN ----

13. Discover.
    Top bar: InSwipe mark + wordmark left; notification bell and avatar right.
    Title "Opportunities for you". Sub-line "Ranked by how well you fit — best first."
    State the ordering in the UI; it is a feature, not an implementation detail.

    Card stack: top card fully visible, two behind it scaled 4% and 8% down, offset 8px
    and 16px, reduced opacity.

    THE JOB CARD (radius 20, shadow/card, ~62% of available height):
      - Top 50%: company-context image with a soft gradient scrim
      - FitScore pill top-right — "92% fit"
      - CompanyLogo tile overlapping the image at bottom-left
      - Company name + "Verified" badge
      - Location + work mode with a pin icon
      - Role title, prominent (heading/md/m)
      - One truncated line of description
      - A skills row where requirements the student MEETS are green fit tags and ones
        they LACK are orange outline gap tags — the fit/gap idea must be legible on the
        card itself, before they tap in
      - Footer: duration (calendar icon) · stipend (rupee icon)
      - A small "Tap for full requirements" affordance
    Tapping anywhere opens screen 17.

    Action row: three circular buttons — Pass (X, red outline, 56px), Save (star, amber,
    48px, centred and slightly smaller), Apply (check, green filled, 56px). Caption
    labels beneath: PASS · SAVE · APPLY.

14. Discover — drag states. Three variants of the top card:
    (a) dragging right ~80px: rotated +8°, green scrim, large circular check badge,
        "APPLY" stamp fading in
    (b) dragging left ~80px: rotated -8°, red scrim, X badge, "PASS" stamp
    (c) starred: amber toast "Saved to your list" above the action row

15. Discover — empty and loading. Empty: "You're all caught up." / "New opportunities
    matched to your profile land here daily." Secondary "Adjust preferences".
    Loading: a skeleton card in the stack position.

16. Filter sheet — reachable from Discover: role, work mode, location, duration, stipend,
    minimum fit percentage. "Reset" and "Show 24 opportunities" actions.

---- SECTION 3: JOB DETAIL, FIT, AND APPLYING ----

17. Job detail — scrollable. This is where a student decides.
    Hero image, back and save buttons overlaid. CompanyLogo, company name, verified
    badge, and a chevron — TAPPING THE COMPANY OPENS THE COMPANY PROFILE (screen 20).
    Role title. Meta row: location · work mode · duration · stipend.

    THE FIT BLOCK — visually distinct, subtle AI gradient border, sparkle icon,
    label "YOUR FIT":
      - Large FitScore ring, 92%, with the band label "Strong fit" beneath
      - Four FitScore bars: Skills 95% · Experience 82% · Interests 94% · Preferences 100%
      - Full-width button "See what you fit and what's missing" → screen 18

    Then, in this order:
      About the role — full description
      What you'll do — bulleted responsibilities
      Requirements — split into two clearly separated groups with headers:
        "You meet these" — green check rows
        "You're missing these" — orange hollow rows
        Required and preferred requirements labelled distinctly within each group
      Who you'll work with — a small team snippet
      About the company — logo, size, industry, and a "View company profile" row

    Sticky bottom bar: "Save" secondary + "Apply" primary.

18. Fit breakdown — a bottom sheet at ~85% height, drag handle, over the dimmed detail
    screen. This screen is why the product is worth using. Make it read as specific,
    earned insight — never generic marketing copy.

    Header "Your fit for this role", small 92% ring at the right, and a one-line note
    on how it's calculated with an info affordance: "Based on required skills, project
    evidence, your preferences and availability."

    Section "WHAT YOU BRING" — four FitRows, green check, bold factor, one sentence:
      ✓ React — "You've used React in 2 projects. It's a core requirement here."
      ✓ JavaScript — "Directly matches the primary language for this role."
      ✓ Project evidence — "Your AI Expense Tracker shows the API work this team does daily."
      ✓ Work preference — "You want hybrid. This role is hybrid in Bangalore."

    Divider.

    Section "WHAT TO WORK ON" — three GapRows, orange hollow circles. Every gap phrased
    as a next step, never a rejection:
      ○ Docker — "Preferred, not required. A weekend project would cover it."
      ○ PostgreSQL — "Listed as preferred. Your SQL experience already transfers."
      ○ TypeScript — "Wanted by 6 of your applications. Worth learning next."
    Below the section, a secondary button: "Add these to my learning list".

    Footer note: "Your fit updates as you add skills and projects."

19. THE APPLICATION NOTE SHEET — appears on swipe right or tapping Apply.
    A compact bottom sheet, roughly half height. Design it to be dismissible in one tap;
    it must not feel like a form standing between the student and the next card.

    Header: "Applying to Frontend Developer Intern at TechNova"
    A small AI-gradient label "AI-drafted — edit or send as is" with a sparkle icon.
    A textarea, PRE-FILLED with a generated note that references specifics:
      "I've built two React projects, including an expense tracker that handles a
       third-party API — close to the frontend work described here. I'm available from
       June for three months and I'm looking for exactly this kind of hybrid role in
       Bangalore."
    A character counter and a small "Regenerate" text action with a refresh icon.

    Below the textarea, a ResumeCard in a compact read-only state:
      "Aarav_Sharma_Resume.pdf will be sent with your application" — with a "Change" link.

    Two buttons, side by side, equal visual weight so skipping is not a lesser path:
      "Send without note" secondary  |  "Send with note" primary

    Also design an empty variant of this sheet where the student has cleared the text,
    showing the placeholder "Add a note (optional)".

20. Company profile — reachable ONLY from the job detail screen, never from the swipe
    card. Cover image, CompanyLogo, name, verified badge, tagline. About, industry,
    company size, founded, location, website. Culture tags. Tech stack chips. Team
    member cards with photos and roles. A grid of their other open roles, each with the
    student's fit percentage. A "Back to job" affordance.

21. Application confirmation — after sending. A modal, restrained: a check mark,
    "Applied to Frontend Developer Intern at TechNova", one line "TechNova will review
    your application. You'll hear here if they select you." A secondary line
    "12 applications active".
    Buttons: "Keep swiping" primary, "View my applications" secondary.
    NO confetti. Applying is cheap; the celebration belongs at selection.

---- SECTION 4: TRACKING, INBOX AND PROFILE ----

Bottom tab bar on all of these — five tabs: Discover, Applications, Saved, Inbox,
Profile. Active tab primary/500 with a filled icon, inactive ink/300. Unread badge on
Inbox. Before any selection has ever happened, the Inbox icon carries a small padlock
instead of a badge.

22. Applications — the tracking screen. A summary strip at top: "12 applications ·
    2 selected · 1 not selected". Filter chips: All, Active, Under review, Selected,
    Not selected.
    Each row: CompanyLogo, company name, role, FitScore pill, StatusTag, "Applied 3 days
    ago", and a small note icon if they sent one.
    Selected rows are elevated with a fit-green left border and an "Open chat" action.
    Not-selected rows are dimmed, with the status shown plainly and a quiet
    "See similar roles" link — closure plus a next step.
    Show a realistic mix: 2 Selected, 3 Under review, 1 Shortlisted, 5 Applied,
    1 Not selected.

23. Application detail — tapping a row: the job summary, the note they sent, the resume
    attached, the fit breakdown as it stood at application time, and a status timeline
    (Applied 12 Sep → Under review 14 Sep → Selected 16 Sep) with future steps greyed.

24. Applications — empty state. "No applications yet. Swipe right on opportunities you
    want." Primary "Start swiping".

25. Saved — starred jobs as a list with FitScore pills, a remove action and an "Apply"
    shortcut per row. Empty: "Nothing saved. Tap the star on any card to keep it for
    later."

26. INBOX — LOCKED STATE. Design this carefully; most students see it first and often.
    A centred LockedState: padlock illustration, "Your inbox unlocks when a company
    selects you", and "Companies review everyone who applies. When one picks you, they'll
    message you here." A reassuring stat: "You have 12 active applications." Secondary
    button "View applications". It must read as anticipation, not a dead end.

27. Inbox — populated. Conversation list: CompanyLogo with online dot, company name, the
    role beneath in muted text, last message truncated, timestamp, unread badge in
    primary/500. Search at top.

28. Chat thread — CompanyLogo + company name + role in the header, back arrow, overflow
    menu. Incoming bubbles in surface white with a soft shadow, outgoing in primary/500
    with white text, radius 16 with one corner tightened. Timestamps under grouped
    messages. A date divider. A typing indicator.
    At the top of the thread, a system card: "TechNova selected you for Frontend
    Developer Intern · 92% fit" with a link to the job.
    The FIRST message is always from the company — design the thread so the student's
    first bubble is a reply.
    Input bar: attachment icon, text field, send button that activates on input.
    Above the input, a horizontally scrolling row of three AI-suggested reply chips with
    a sparkle icon.

29. Selection celebration — full-screen overlay, AI gradient, restrained confetti (small,
    sparse, brand colours — not a party popper).
      "You've been selected!"
      Student avatar and CompanyLogo paired with a connecting spark
      "TechNova wants to talk about Frontend Developer Intern"
      FitScore ring
      Primary "Read their message", text link "Later"
    Under 3 seconds of implied animation. This is the emotional peak of the app —
    earn it, don't overplay it.

30. Profile — view mode. Cover gradient, avatar, name, degree + university, graduation
    year, edit button. A "Profile strength 80%" card with a progress bar and one specific
    suggestion ("Add a GitHub link — students with one get selected 2× more often").
    Sections: Skills (chips, with an evidence indicator on skills backed by a project),
    Projects (expandable, tech tags, links), Experience, Education, Preferences summary.
    A ResumeCard with View and Replace. GitHub / portfolio / LinkedIn link row.

31. Profile — edit mode. Same layout, fields active, chips removable, "Add" affordances,
    sticky Save bar.

32. Learning list — gaps collected from jobs, ranked by demand across the student's
    applications: "Docker — wanted by 6 of your applications", each with a progress
    toggle (Not started / Learning / Done) and a "Find roles that don't need this" link.
    This turns rejection into direction and gives students a reason to return.

33. Notifications — grouped by day: you were selected, a new message, your application
    status changed, a company viewed your profile, new opportunities matching you.

STATES SHEET — one page with: skeleton loading for the discover card, applications list
and inbox; every empty state together; an error state ("Couldn't load opportunities —
Retry"); and the pressed and disabled variants of the three swipe action buttons.

DELIVERY — all screens on one page, left to right in flow order, grouped and labelled by
section, with arrows tracing the core path:
Splash → Sign up → Resume upload → AI review → Discover → Job detail → Fit breakdown →
Note sheet → Applied → Applications → [company selects] → Selection → Inbox → Chat.
```

---

# PROMPT C — Company Web Dashboard + Landing Page

```
Design the InSwipe company-side web experience and the public landing page. Desktop
frames 1440×1024, 1280 content max-width, 12-column grid, 24px gutters. Also produce
tablet (768) variants of the dashboard and the applicants screen. Design system: Inter,
primary #4F46E5, background #F7F7FB, surface #FFFFFF, text #0F1117, fit green #16A34A,
gap orange #EA580C, radii 12/16/20, soft low shadows.

CRITICAL CONSTRAINT
Companies DO NOT swipe. There is no card deck anywhere on the company side. This is not
a mirror of the student app. A company does three things: post a detailed job, review
everyone who applied to it, and select the ones that fit. Design for scanning, comparison
and decision-making — efficient and dense enough for real work, but never a grey
enterprise admin panel. Think Linear or Vercel, not Jira.

THE RULE THAT SHAPES EVERYTHING
For every applicant, on every job, the company sees BOTH what the candidate fits AND what
they lack, scored against that specific job's requirements — plus the candidate's raw
resume and an AI summary of that resume read against those same requirements. Not a
generic profile. A per-job verdict. This is the product.

Selecting a candidate is what unlocks their inbox, and the company sends the first
message. Make that consequence visible wherever selection happens.

---- SECTION 1: PUBLIC LANDING PAGE ----

1. Landing page (/) — one long scrolling frame, may exceed 1024 height.
   Nav: InSwipe mark + wordmark left; How it works, For students, For companies, Pricing;
   Sign in and a primary "Get started" right.
   Hero: "Find the internship that fits you." in display/xl. Sub-line "AI-powered
   matchmaking between students and the companies looking for their next intern."
   Two CTAs: "I'm a student" (primary) and "I'm hiring" (secondary). To the right, a
   floating mockup of the student job card at a slight angle with a 92% fit pill,
   subtly glowing.
   Section 2 — how it works, two parallel columns converging:
     Students: upload resume → AI builds profile → swipe jobs → apply
     Companies: post a job → see ranked applicants → select → talk
     Both converge on one "Conversation starts" node.
   Section 3 — for students: the swipe deck and fit breakdown as product screenshots,
   three benefit bullets.
   Section 4 — for companies: the ranked applicants dashboard as a product screenshot,
   three benefit bullets, emphasising "see exactly what each applicant fits and lacks".
   Section 5 — full-bleed stat band on the AI gradient: jobs posted, students,
   selections made, average time to first conversation.
   Section 6 — logos of companies hiring. Section 7 — final CTA band. Footer.

2. Company sign up / sign in — split screen: form left, testimonial or product visual
   right. Fields: work email (with a note "Use your company email — it's how you get
   verified"), company name, password. Google SSO option.

3. Company onboarding — 3 steps, progress rail on the left.
   (a) Company profile: logo upload, name, one-line tagline, description, industry,
       company size, founded year, website, HQ location.
   (b) Team & culture: culture tags, tech stack chips, team member cards.
   (c) Verification: domain verification explainer, pending state, "Verified" badge
       preview, and a note that verified companies get more applicants.

---- SECTION 2: THE APP SHELL ----

Every internal screen shares a persistent left sidebar (240px, surface white, 1px right
border):
  CompanyLogo + name at top with the verified badge
  Nav: Dashboard · My Jobs · Applicants · Inbox · Company Profile
  Active item: primary/100 fill, primary/500 text and icon, radius md
  Bottom: Settings, Help, account row with avatar
Top bar (64h): current page title, global search, notification bell with badge, primary
"Post a job" button.

4. Company dashboard.
   Greeting row: "Good morning, Priya" with the date.
   Four stat cards with icon, large number, label and trend delta: Active jobs 3 ·
   New applicants 47 · Awaiting review 12 · Active conversations 5.
   Main column — "Needs your attention": jobs each showing a count of unreviewed
   applicants and a "Review applicants" primary action. Then a compact activity feed
   (a student applied, a candidate replied, an application went stale).
   Right column — a hiring funnel (Applied → Reviewed → Selected → In conversation →
   Interview → Offer) as a stepped funnel with counts; and "Strongest applicants this
   week", three mini-rows with FitScore rings.

5. My Jobs — a list of job cards, not a table. Each: role title, StatusTag (Active /
   Draft / Closed / Filled), posted date, an inline stat strip (views, applicants,
   selected, in conversation), a primary "Review applicants" action and an overflow menu
   (edit, duplicate, pause, close). Filter chips and a sort control. Include the empty
   state: "No jobs posted yet."

6. POST A JOB — a multi-step form with a LIVE PREVIEW pinned on the right showing exactly
   how the card will look in a student's swipe deck, updating as they type. This preview
   is what makes companies write good job cards.
   Step 1 Role basics: title, role category, description, responsibilities (repeatable rows).
   Step 2 Requirements: required skills (chips) and preferred skills (chips), visually
     distinguished — required drives the fit score, preferred drives the gap list, and the
     UI should say so. Experience expectations, minimum year of study.
   Step 3 Logistics: work mode, location, duration, start window, stipend range, number
     of openings, application deadline.
   Step 4 Review & publish, with the full card preview and a "How this affects matching"
     note explaining that stricter requirements mean fewer but better-fitting applicants.
   Design step 2 fully populated with the preview alongside.

7. Job detail (company view) — header with title, StatusTag, edit and share; a stat
   strip; the full job content; and a tab bar (Overview / Applicants / Selected /
   Analytics) leading into screen 8.

---- SECTION 3: THE APPLICANTS DASHBOARD — THE CENTREPIECE ----

8. Applicants for a job — the single most important company screen.
   Context header: "Frontend Developer Intern · 24 applicants · ranked by fit".

   Control bar: sort dropdown (Best fit — default, Most recent, Name), filter chips
   (skill, availability, work mode, university, graduation year, minimum fit %), search
   field, view toggle (List / Compare), and a "Has note" filter toggle.

   The ranked list, best fit first. Each row is a rich card, 110-130px tall, surface
   white, radius 16, hover lifts it with shadow/md:
     - Rank number in large muted type at the far left (1, 2, 3…)
     - Avatar with online dot
     - Name, then degree · university · graduation year beneath
     - TWO labelled skill rows — make this split unmissable, it is the product:
         Fits:   green fit tags for requirements they meet
         Lacks:  orange outline gap tags for requirements they miss
     - Meta line: "3 projects · GitHub · Portfolio · Resume attached"
     - A note indicator when the student wrote one — a quote icon with the first few
       words, expanding on hover
     - FitScore ring on the right with a one-line rationale beneath ("Strong React and
       API project evidence")
     - Actions: "View profile" secondary, "Select" primary
   Show at least 7 rows with a realistic spread: 94, 89, 86, 81, 74, 68, 61.
   Score bands must make ranking legible without reading numbers — greens at the top,
   indigo in the middle, muted grey at the bottom.

   Insert a soft divider after the top group labelled "Strong fits", and another before
   the tail labelled "Also applied", so the ranking reads as a judgement, not a raw sort.

9. Applicants — empty and loading. Empty: "No applicants yet. Students who apply to this
   role appear here, ranked by how well they fit." Loading: four skeleton rows.

10. CANDIDATE PROFILE — a right-hand drawer (600px) over the dimmed list, so the reviewer
    never loses their place in the ranking. The most information-dense screen in the
    product; keep it scannable.

    Header: avatar, name, degree, university, graduation year, location, FitScore ring
    with band label.

    If the student sent a note, show it first, in a quoted block — it is the most
    human thing on the screen and should not be buried.

    A FitBreakdown block scoped to THIS job, mirroring the student's screen 18 with the
    voice swapped:
      Four FitScore bars: Skills 95 · Experience 82 · Interests 94 · Preferences 100
      "WHAT THEY BRING" — four green FitRows written for a recruiter:
        ✓ React — "2 shipped projects using your exact frontend stack."
        ✓ JavaScript — "Primary language across their portfolio."
        ✓ API experience — "Their expense tracker consumes and handles a third-party API."
        ✓ Availability — "Free from June. Matches your 3-month window."
      "WHAT THEY LACK" — three orange GapRows, honest and specific:
        ○ Docker — "No exposure. You listed it as preferred, not required."
        ○ PostgreSQL — "Has MySQL experience. Would transfer with a short ramp."
        ○ TypeScript — "Not evidenced in any project."

    THE RESUME BLOCK — two things side by side or stacked:
      (a) An AISummaryCard: "AI SUMMARY — read against this role". Three or four short
          paragraphs summarising the resume specifically through the lens of THIS job's
          requirements, not a generic profile summary. Include a line noting anything in
          the resume that the structured profile missed. An info affordance explains
          "Generated from the resume against your listed requirements."
      (b) A ResumeCard with the filename, and a prominent "View original PDF" action
          that opens screen 11. Companies must always be able to read the raw document.

    Then: Skills (matching ones highlighted green, each with its evidence strength),
    Projects (expandable, tech tags, repo links), Experience, Education, Availability,
    Preferences.

    Sticky footer: "Save for later" secondary, "Select candidate" primary, and a quiet
    "Not a fit" text action. A small line above the buttons: "Selecting notifies the
    candidate and opens a conversation."

11. Resume viewer — the raw PDF in an embedded viewer, on a dimmed backdrop. A right rail
    keeps the job's requirements checklist visible alongside, with met requirements
    ticked, so the reviewer can read the document against the role without switching
    context. Download and close actions.

12. Candidate profile — full-page variant for deeper review, same content, more room.

13. Compare view — three candidates side by side in columns, aligned rows for fit score,
    skills they fit, skills they lack, projects, availability, preferences and note, so
    differences read horizontally at a glance.

14. Select confirmation — a modal: "Select Aarav Sharma?" with a line: "This notifies
    Aarav, unlocks their inbox and opens a conversation. You'll send the first message."
    Cancel / Confirm.

15. Selection confirmed — deliberately restrained, more so than the student app: a centred
    modal on a soft AI gradient, CompanyLogo and candidate avatar paired, "Selected —
    94% fit", and a message composer inline with an AI-drafted opener the recruiter can
    edit: "Send first message" primary, "Back to applicants" secondary. Minimal confetti
    or none. This is a workplace tool.

16. Applicants — the reviewed state. The same list after actions: selected rows carry a
    green "Selected" StatusTag with a muted treatment; not-a-fit rows are collapsed and
    dimmed with an "Undo" affordance. Reviewing a long list must feel like visible
    progress.

---- SECTION 4: THE REST ----

17. All Applicants — across every job, filterable by job. Each row: candidate, the job
    they applied to, fit score, StatusTag, applied date, last activity.

18. Pipeline — a kanban board: Applied · Reviewed · Selected · In conversation ·
    Interview · Offer · Hired. Compact candidate cards (avatar, name, job, fit score)
    reading as draggable. Column headers carry counts. Include a drag-in-progress state
    with a lifted shadow and a highlighted target column.

19. Inbox — two-pane plus a context rail. Conversation list left (280px): avatar,
    candidate name, the job beneath, last message, timestamp, unread badge. Active thread
    centre, bubbles matching the student app inverted (the company's own in primary/500).
    Right rail (300px): a condensed candidate summary — fit ring, top fits, top gaps,
    resume link, link to the full profile — so the recruiter keeps context while typing.
    A "Schedule interview" action in the thread header.
    Design a new-thread state where the composer holds an AI-drafted opening message,
    since the company always messages first.

20. Company profile — the public-facing page exactly as students see it, since it is what
    convinces them to apply: cover, logo, name, verified badge, tagline, description,
    industry, size, location, website, culture tags, tech stack, team member cards, and a
    grid of open jobs. Include an "Edit" affordance and a "Preview as student" toggle.

21. Analytics — per job: impressions, apply rate, average applicant fit, time to first
    selection, a skill-demand chart, and a genuinely useful insight card: "Docker is
    filtering out 8 otherwise-strong candidates. Consider moving it to preferred."

22. Settings — team members with roles and invitations, notification preferences, billing
    placeholder, company verification status.

23. Notifications — new applicant, a strong-fit applicant (≥85%), a candidate replied, a
    job is about to expire.

STATES SHEET — skeleton loading for the applicants list, dashboard and inbox; every empty
state; an error state; and hover, active, focused and disabled variants for the applicant
row, the Select button and the sidebar nav item.

DELIVERY — all screens on one page, left to right in flow order, grouped and labelled by
section, with arrows tracing the core path:
Dashboard → My Jobs → Post a job → Applicants (ranked) → Candidate profile → Resume +
AI summary → Select → Inbox → Chat.
```

---

## What to check after Figma generates

The output is a starting point, not a finished design. Review against:

1. **Is the fit/gap split unmissable?** On the job card, the detail screen, the applicant
   row, the candidate drawer. If green-versus-orange isn't the first thing your eye lands
   on, the product's entire argument is buried.
2. **Can the note sheet be dismissed in one tap?** If it feels like a form, the swipe loop
   dies at card three.
3. **Does the AI resume review screen make editing easy?** Parsing will be wrong
   sometimes. If fixing it is a chore, students accept bad data and every downstream fit
   score degrades.
4. **Is the AI resume summary job-specific?** If it reads like a generic profile blurb,
   it's wasted — it exists to save a recruiter from reading the PDF cold.
5. **Does the locked inbox read as anticipation or a dead end?** It's the screen most
   students see most often before their first selection.
6. **Did any swipe interaction leak onto the company side?** There shouldn't be one.
7. **Are colours used only for their meanings?** Green = has it. Orange = doesn't yet.
   Red = pass. Amber = saved. Drift weakens all four.
8. **Is the celebration in the right place?** Applying is quiet. Selection is the payoff.
9. **Do both products feel like one brand?** Same type scale, accent, FitScore component
   and fit/gap structure on both sides.

## Backend implications

Data model and the fit-score rubric are specified in `CLAUDE.md` §5 and §9. The two
things to get right early:

**`fit_scores` is the spine.** One object read by both apps — score, four-part breakdown,
requirements met, requirements missing, and a plain-language reason for each. Student app
renders it as *what you bring / what to work on*; company app renders the same rows as
*what they bring / what they lack*. Build the API around this shape and mock data swaps
for real AI output without touching either UI.

**`selections` is the gate.** A conversation must not be creatable without a matching row.
Enforce with a foreign key and a database constraint, not application logic — it is the
one rule the entire product hangs on, and the thing a future refactor is most likely to
break by accident.
