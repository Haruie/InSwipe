# InSwipe — Figma Build Guide

A paste-by-paste workbook. Assumes you have never used Figma.

**How this works:** Figma Make is conversational — like chatting with me. You paste a
**primer** once at the top of a file to teach it the design system, then paste **screen
prompts** one at a time in the same conversation. It remembers the primer, so each screen
prompt can stay short.

**Two people, split by product:**
- **Person A → Student mobile app** — files S1 to S5
- **Person B → Company web dashboard** — files C1 to C5

**Both of you paste the same primer.** That is the only thing keeping the two halves
looking like one product. Do not edit it, do not paraphrase it, do not skip it.

Full product context: `CLAUDE.md`. Detailed screen specs: `figma-prompts.md`.

---

## Before you start

1. Open Figma and sign in.
2. Create a new **Make** file. On your dashboard, look for a "Make" option, or
   File → New Make file. If you can't find it, your plan may not include Make — tell me
   and I'll adapt the approach.
3. You'll see a chat box. That's where everything below gets pasted.
4. Paste **THE PRIMER** first. Wait for it to respond.
5. Then paste screen prompts one at a time, waiting for each to finish.

**Start a new Make file for each numbered group (S1, S2, C1…)** and re-paste the primer
at the top of each. Long conversations drift and start forgetting the design system.

**Rules of thumb**
- One prompt at a time. Never paste two screens at once.
- If output looks wrong, don't start over — reply conversationally: *"The card is too
  tall, make it about 60% of the screen height"* or *"Use #4F46E5 for that button, not
  blue."*
- If it drifts off the design system, paste: *"Re-read the design system in my first
  message and correct the colours and type."*
- Screenshot anything you like, and anything that goes badly, and send both to me.

---

# THE PRIMER

Paste this **first, in every new Make file**, both of you. Wait for a reply before
continuing.

```
I'm designing InSwipe, an AI-powered internship matchmaking platform. I'll ask you to
build screens one at a time. First, learn this design system and product model, and
apply them to everything you build for me. Don't build anything yet — just confirm
you've got it.

THE PRODUCT
Students use a mobile app: they upload a resume that AI reads into a profile, then swipe
through internship cards ranked best-fit-first. Swipe right to apply, left to pass, star
to save. Every job shows which requirements they meet and which they lack.
Companies use a web dashboard: they post jobs, then review a ranked list of everyone who
applied, seeing exactly what each candidate fits and lacks for that specific job.
A student's inbox stays LOCKED until a company selects them. Then the company sends the
first message. Being selected is the payoff the whole product builds toward.

BRAND PERSONALITY
60% professional, 20% social, 10% playful, 10% AI. It must feel credible to a corporate
recruiter and engaging to a 20-year-old student. Quality references: Linear's precision,
Stripe's restraint, Notion's warmth.
NOT a Bootstrap admin panel. NOT a corporate-blue enterprise dashboard. NOT dense grey
data tables. NOT a dating app clone.

COLOURS — use these exact values, never invent new ones

  Primary indigo    #4F46E5    buttons, active states, links, brand
  Primary pressed   #4338CA
  Primary tint      #EEF0FF    selected chips, badges, active nav

  Text primary      #0F1117    near-black, never pure black
  Text secondary    #374151
  Text muted        #6B7280
  Text disabled     #9CA3AF
  Border            #E8E8EF
  Surface           #FFFFFF    cards, sheets, inputs
  Background        #F7F7FB    page background, slightly off-white

  Fit green         #16A34A    a requirement the student MEETS, strong fit, Apply action
  Fit green tint    #DCFCE7
  Fit green dark    #15803D    text on green tint

  Gap orange        #EA580C    a skill the student LACKS — a to-do, NOT an error
  Gap orange tint   #FFEDD5

  Pass red          #DC2626    the Pass action ONLY, never for errors
  Save amber        #F59E0B    save / star ONLY

  AI gradient       135°, #6C5CE7 → #A78BFA — used sparingly: AI moments only

CRITICAL COLOUR RULE
Each semantic colour has exactly one meaning. Green means "has this skill". Orange means
"doesn't have it yet". Red means "pass". Amber means "saved". Never reuse them for
anything else. Orange must never look like an error — a gap is a to-do, not a failure.

TYPOGRAPHY — Inter throughout, nothing below 12px

  Desktop:  Hero 72/700 · Page title 40/700 · Section 32/600 · Subsection 24/600
            Card title 20/600 · Body 15/400 · Small 14/400 · Label 14/600
            Caption 12/500 uppercase with letter-spacing
  Mobile:   Page title 32/700 · Section 24/700 · Card title 20/600
            Body 15/400 · Small 13/400 · Label 13/600

SPACING — multiples of 4: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
CORNER RADIUS — small 8 · medium 12 · large 16 · cards 20 · sheets 28 · pills fully round
SHADOWS — soft and low, never harsh:
  subtle  0 1px 3px rgba(15,17,23,0.06)
  card    0 4px 12px rgba(15,17,23,0.08)
  raised  0 8px 24px rgba(15,17,23,0.10)
ICONS — Lucide icons, 1.75px stroke, 20px normally, 24px in navigation

THE FIT SCORE — the signature element, appears everywhere
Every student–job pair has a fit percentage. Three visual forms:
  Pill  — inline badge like "92% fit", green tint background, dark green text, fully round
  Ring  — circular progress with the number centred, sizes 48/72/120px
  Bar   — a labelled horizontal progress bar, for breakdown rows
Colour by band:  85% and above = green · 70-84% = indigo · below 70% = grey
Band labels:     "Strong fit" · "Good fit" · "Stretch"

THE FIT / GAP SPLIT — the most important visual idea in the product
Wherever requirements appear, they split in two and the split must be immediately
obvious at a glance:
  Green filled tags     = requirements the student MEETS
  Orange outlined tags  = requirements the student LACKS
Paired with short plain-English explanations:
  ✓ React — "Used in 2 projects. It's a core requirement here."
  ○ Docker — "Preferred, not required. A weekend project would cover it."
Gaps are always phrased as a next step, never as a rejection.

INTERACTION STATES — design these for every interactive element
Default, hover, pressed, focused, disabled. Focus is always a 2px #4F46E5 ring at 2px
offset — never a default browser outline. Every screen needs its loading, empty and
error states considered.

CONTENT RULES
Use realistic data, never placeholders. Real-sounding Indian and global companies
(TechNova, Zomato, Swiggy, Nexora Labs, PixelForge). Indian cities and stipends in
rupees (₹20,000/month). Believable student names and real project descriptions. Never
"Company 1", "Test Job", or lorem ipsum.

Confirm you've understood, then wait for my first screen request.
```

---

# PERSON A — STUDENT MOBILE APP

Mobile screens, 390 × 844 (iPhone size). Five files.

---

## FILE S1 — Onboarding

New Make file → paste THE PRIMER → then these, one at a time.

**S1.1**
```
Build the InSwipe student app onboarding, mobile 390x844.

Screen 1 — Splash. Dark violet gradient background (#1B1730 to #3B2A6E). The InSwipe
logo mark and wordmark top-left in white. A large headline "Swipe in. Stand out." with
the second line in #A78BFA. Below it, smaller and semi-transparent white: "AI-powered
matching between students and the companies hiring them." At the bottom, a full-width
indigo "Get Started" button and a text link "I already have an account".

Screen 2 — A 3-step intro carousel with page dots and a Skip link top-right. Each has a
large illustrative graphic, a short heading and one sentence:
  1. "Your resume, understood" — AI reading a resume into a profile
  2. "Jobs ranked by how well you fit" — a stack of job cards
  3. "Get selected, then talk" — a padlock opening into a chat
Show all three as separate frames.
```

**S1.2**
```
Screen 3 — Sign up / Sign in, mobile 390x844.
A segmented control at the top switching between Sign Up and Sign In. Fields: Full name,
Email, Password with a show/hide eye icon. A full-width indigo primary button. Then a
divider reading "or continue with", and two full-width outlined buttons with logos:
"Continue with Google" and "Continue with LinkedIn — imports your profile". A small
terms and privacy footnote at the bottom. No phone or SMS option.
Also show two variants: one with the primary button disabled because fields are empty,
and one with an email field in its error state.
```

**S1.3**
```
Screen 4 — The profile-building fork, mobile 390x844.
Heading "How would you like to build your profile?" Two large stacked option cards
filling most of the screen:

The first card is dominant and clearly recommended — a subtle AI gradient border, a
sparkle icon, title "Upload your resume", description "We'll read it and build your
profile in seconds. You can edit everything after." and a small badge "Fastest — about
30 seconds".

The second card is plain white, title "Fill it in manually", description "Enter your
details yourself. About 5 minutes."

Make the first obviously preferred without disabling the second.
```

**S1.4**
```
Screens 5 and 6 — Resume upload and AI parsing, mobile 390x844.

Screen 5 — A large dashed-border drop zone filling most of the screen with an upload
icon, "Drop your resume here or browse", a line reading "PDF, DOC or DOCX · max 5MB",
and a reassurance below: "Your resume is sent only to companies you apply to."
Also show the uploading state with a progress bar.

Screen 6 — A full-screen AI processing moment on the AI gradient background. An animated
document-turning-into-profile visual in the centre. Below it, a checklist revealing line
by line with green checks and one spinner:
  ✓ Reading your resume
  ✓ Extracting skills
  ✓ Finding your projects
  ⟳ Ranking opportunities for you
Keep it calm and premium, not busy.
```

**S1.5**
```
Screen 7 — Review extracted profile, mobile 390x844. This is the most important
onboarding screen, take care with it.

Heading "Here's what we found", subheading "Check it over — you can change anything."
Then everything the AI extracted, as editable cards each with a small pencil edit icon:
  Basic info — name, email, phone, university, degree, graduation year
  Skills — extracted skills as removable chips with small x's, plus a "+ Add skill" chip
  Projects — two project cards with name, description and tech tags
  Experience — one role with company and dates
  Education

IMPORTANT: two of the fields must show a low-confidence state — a dotted orange
underline and a small orange "Confirm?" tag beside them. This shows the student what the
AI wasn't sure about.

A sticky footer with a full-width indigo "Looks good — continue" button.
```

**S1.6**
```
Screens 8 to 11 — Manual profile entry, 4 steps, mobile 390x844. Each has a progress bar
and back arrow at the top, and a sticky Continue button at the bottom.

Step 1 Basic info — a circular photo uploader with a camera badge, then Full name,
University (a searchable field), Degree, Field of study, Graduation year.

Step 2 Skills — a search field, then popular skills as selectable chips in a wrapped
grid, an "Add custom skill" option, a live count reading "6 selected", and the selected
skills pinned in a row at the top. Show some chips selected in indigo tint and some not.

Step 3 Projects — first the empty state: "Projects are how companies see what you can
actually build" with an "Add project" button. Then a filled state with two project cards.
Also show the add-project bottom sheet: Name, Description, Tech stack chips, GitHub URL,
Live demo URL, Your contribution.

Step 4 Preferences — role interest chips (Frontend, Backend, Full Stack, AI/ML, Data
Science, UI/UX, Product, Marketing, Finance, Research), a 3-way segmented control for
work mode (Remote / Hybrid / On-site), a multi-select for preferred locations, a
segmented control for duration (1 / 2 / 3 / 6 months), and stipend chips (Unpaid, ₹5k+,
₹10k+, ₹20k+, ₹30k+, Flexible). Final button reads "Find my opportunities".
```

---

## FILE S2 — Discover (the core screen)

New file → PRIMER → then these. **This is the most important file. Take your time.**

**S2.1**
```
Build the InSwipe student Discover screen, mobile 390x844. This is the app's main screen.

Top bar: the InSwipe mark and wordmark on the left, a notification bell and a circular
avatar on the right.
Below it: title "Opportunities for you" and a smaller grey line "Ranked by how well you
fit — best first."

Then a card stack: one card fully visible, with two more peeking behind it, each scaled
down slightly (4% then 8%) and offset 8px and 16px downward with reduced opacity.

THE JOB CARD — white, 20px radius, soft raised shadow, about 62% of available height:
  Top half: a company office photo with a soft dark gradient scrim over the bottom
  Top-right corner: a fit pill reading "92% fit" — green tint background, dark green text
  Overlapping the photo's bottom-left: a white rounded-square company logo tile
  Then: company name in bold with a small indigo "Verified" badge beside it
  A grey line with a pin icon: "Bangalore · Hybrid"
  Role title, prominent: "Frontend Developer Intern"
  One truncated line of description
  A skills row that is the most important part of the card — requirements the student
  MEETS as green filled tags (React, JavaScript, REST APIs) and requirements they LACK
  as orange outlined tags (Docker, PostgreSQL)
  A bottom row: a calendar icon with "3 months" on the left, a rupee icon with
  "₹20,000/month" on the right
  A small grey line: "Tap for full requirements"

Below the card, three circular action buttons in a row, evenly spaced:
  Pass — a red X, white background, red outline, 56px
  Save — an amber star, white background, 48px, centred and slightly smaller
  Apply — a white check on a green filled circle, 56px
With small uppercase caption labels beneath: PASS · SAVE · APPLY
```

**S2.2**
```
Now three drag-state variants of that same Discover screen, showing what happens
mid-swipe. Same 390x844 frames.

Variant A — dragging right. The top card is shifted right about 80px and rotated +8
degrees. A translucent green overlay covers it. A large green circular badge with a
white check sits in the centre, and the word "APPLY" in bold green beneath it.

Variant B — dragging left. The card is shifted left 80px and rotated -8 degrees, with a
translucent red overlay, a large red circular badge with a white X, and "PASS" in bold
red beneath.

Variant C — just saved. The card is in its normal position, and an amber toast floats
above the action buttons reading "Saved to your list" with a star icon.
```

**S2.3**
```
Two more states of the Discover screen, mobile 390x844.

Empty state — no cards left. A centred illustration or icon, heading "You're all caught
up", a line "New opportunities matched to your profile land here daily", and a secondary
outlined button "Adjust preferences". Keep the top bar and bottom navigation.

Loading state — a grey shimmer skeleton card in the stack position, with skeleton blocks
where the logo, title and tags would be. Keep the action buttons visible but disabled.

Also add the bottom navigation bar to both, and to the earlier Discover screens: five
tabs — Discover, Applications, Saved, Inbox, Profile — with Lucide icons and labels. The
active tab (Discover) is indigo with a filled icon; the others are grey. Show a small
padlock badge on the Inbox tab icon.
```

**S2.4**
```
A filter bottom sheet that slides up from the Discover screen, mobile 390x844.
A drag handle at the top, title "Filter opportunities", and a close X.
Sections with headings: Role (chips), Work mode (segmented), Location (multi-select),
Duration (segmented), Stipend (chips), and Minimum fit (a slider showing 70%).
At the bottom, two buttons side by side: "Reset" outlined and "Show 24 opportunities"
in indigo.
```

---

## FILE S3 — Job detail, fit breakdown, applying

New file → PRIMER → then these. **The second most important file.**

**S3.1**
```
Build the InSwipe job detail screen, mobile 390x844, scrollable — make the frame taller
than 844 to show the full scroll if needed.

Top: a company office hero image with a back arrow and a save star button overlaid in
translucent circles.
Then a white content area that overlaps the image slightly with rounded top corners:
  A company logo tile, company name in bold, a "Verified" badge, and a chevron on the
  right indicating the company is tappable
  Role title, large: "Frontend Developer Intern"
  A meta row with icons: Bangalore · Hybrid · 3 months · ₹20,000/month

THE FIT BLOCK — visually distinct with a subtle AI gradient border and a sparkle icon,
with a small uppercase label "YOUR FIT":
  A large circular fit ring showing 92% with "Strong fit" beneath it
  Four labelled horizontal progress bars:
    Skills Match 95%  ·  Experience 82%  ·  Interests 94%  ·  Preferences 100%
  A full-width outlined button: "See what you fit and what's missing"

Then these sections in order:
  About the role — two paragraphs
  What you'll do — four bulleted responsibilities
  Requirements — split into two clearly separated groups with headings:
      "You meet these" — green check rows: React, JavaScript, REST APIs, Git
      "You're missing these" — orange hollow circle rows: Docker, PostgreSQL
    Label each as Required or Preferred
  About the company — logo, company size, industry, and a tappable "View company profile"
  row with a chevron

A sticky bottom bar with two buttons: "Save" outlined and "Apply" in indigo, the Apply
button wider.
```

**S3.2**
```
Build the fit breakdown bottom sheet, mobile 390x844. It covers about 85% of the screen
and sits over a dimmed version of the job detail screen behind it.

A drag handle at the top. Header row: "Your fit for this role" on the left, a small 92%
fit ring on the right. Below that a small grey line with an info icon: "Based on required
skills, project evidence, your preferences and availability."

Section heading in small uppercase grey: "WHAT YOU BRING"
Four rows, each a green check icon, a bold skill name, and one plain sentence beneath:
  ✓ React — "You've used React in 2 projects. It's a core requirement here."
  ✓ JavaScript — "Directly matches the primary language for this role."
  ✓ Project evidence — "Your AI Expense Tracker shows the API work this team does daily."
  ✓ Work preference — "You want hybrid. This role is hybrid in Bangalore."

A divider.

Section heading: "WHAT TO WORK ON"
Three rows, each an orange hollow circle, a bold skill name, and one encouraging sentence:
  ○ Docker — "Preferred, not required. A weekend project would cover it."
  ○ PostgreSQL — "Listed as preferred. Your SQL experience already transfers."
  ○ TypeScript — "Wanted by 6 of your applications. Worth learning next."

Below that a full-width outlined button: "Add these to my learning list"
And a small grey footer note: "Your fit updates as you add skills and projects."

The tone must feel like genuine helpful insight, never like a rejection.
```

**S3.3**
```
Build the application note sheet, mobile 390x844. This appears when a student swipes
right or taps Apply. It's a bottom sheet covering about half the screen, over a dimmed
background. It must feel quick and skippable, never like a form.

Drag handle at top. Header: "Applying to Frontend Developer Intern at TechNova".
A small pill label with a sparkle icon and AI gradient: "AI-drafted — edit or send as is".

A text area, already filled with this text:
"I've built two React projects, including an expense tracker that handles a third-party
API — close to the frontend work described here. I'm available from June for three
months and I'm looking for exactly this kind of hybrid role in Bangalore."

Below the text area, a character counter on the left and a small "Regenerate" text button
with a refresh icon on the right.

Then a compact resume row with a PDF file icon: "Aarav_Sharma_Resume.pdf will be sent
with your application" and a small "Change" link.

At the bottom, two buttons side by side with EQUAL visual weight so skipping doesn't feel
like the lesser choice:
  "Send without note" — outlined
  "Send with note" — indigo filled

Also show a second variant where the text area is empty, with the placeholder
"Add a note (optional)".
```

**S3.4**
```
Two more screens, mobile 390x844.

Screen A — Application confirmation, a modal over a dimmed background. A green circular
check icon, heading "Applied to Frontend Developer Intern", a line "TechNova will review
your application. You'll hear here if they select you." and a smaller grey line
"12 applications active". Two buttons: "Keep swiping" in indigo and "View my
applications" outlined. Deliberately calm — no confetti, no celebration.

Screen B — Company profile, reached from the job detail screen. A cover image, company
logo, name with verified badge, a one-line tagline. Then: About paragraph, a meta grid
(industry, company size, founded, location, website), culture tags as chips, tech stack
as chips, three team member cards with photos and roles, and a grid of their other open
roles each showing the student's fit percentage. A back button labelled "Back to job".
```

---

## FILE S4 — Applications, inbox and chat

New file → PRIMER → then these.

**S4.1**
```
Build the Applications tracking screen, mobile 390x844, with the five-tab bottom
navigation (Applications active).

At the top, a summary strip: "12 applications · 2 selected · 1 not selected".
Then filter chips in a scrollable row: All, Active, Under review, Selected, Not selected.

Then a list of application rows, each with: a company logo tile, company name, role
title, a fit percentage pill, a status tag, and a grey line "Applied 3 days ago". Show a
small quote icon on rows where the student sent a note.

Status tags with distinct treatments:
  Applied — grey
  Under review — indigo
  Shortlisted — indigo filled
  Selected — green
  Not selected — light grey

Show 8 rows with a realistic mix: 2 Selected, 1 Shortlisted, 3 Under review, 1 Applied,
1 Not selected.
Selected rows are visually elevated with a green left border and an "Open chat" button.
The Not selected row is dimmed with a small "See similar roles" link.

Also produce the empty state: "No applications yet. Swipe right on opportunities you
want." with a "Start swiping" button.
```

**S4.2**
```
Build the application detail screen, mobile 390x844 — what you see tapping an
application row.
A back arrow and the job summary at top: company logo, name, role, fit pill.
Then the note the student sent, in a quoted block.
Then a resume row showing the attached PDF.
Then a condensed fit breakdown as it stood when they applied.
Then a vertical status timeline with dates: "Applied 12 Sep" and "Under review 14 Sep"
completed in indigo with connecting line, then "Shortlisted", "Selected" greyed out as
future steps.
```

**S4.3**
```
Build the Saved tab and the LOCKED Inbox, mobile 390x844, with bottom navigation.

Screen A — Saved. A list of starred jobs, each with a company logo, name, role, fit
pill, a remove X and a small "Apply" button. Also show the empty state: "Nothing saved.
Tap the star on any card to keep it for later."

Screen B — The locked Inbox. This is important — most students see it often before their
first selection, so it must feel like anticipation, not a dead end.
A centred padlock illustration, heading "Your inbox unlocks when a company selects you",
and a line "Companies review everyone who applies. When one picks you, they'll message
you here." Below that a reassuring line "You have 12 active applications." and an
outlined button "View applications". Keep the bottom navigation with the padlock badge
on the Inbox tab.
```

**S4.4**
```
Build the unlocked Inbox and a chat thread, mobile 390x844.

Screen A — Inbox with conversations. A search field at top, then conversation rows: a
company logo with a small green online dot, company name in bold, the role beneath in
smaller grey text, the last message truncated, a timestamp on the right, and an indigo
unread count badge on one row. Show 4 conversations.

Screen B — A chat thread. Header with a back arrow, company logo, company name, the role
in smaller text beneath, and an overflow menu.
At the very top of the message area, a system card: "TechNova selected you for Frontend
Developer Intern · 92% fit" with a link to the job.
Then messages. IMPORTANT: the first message is always from the company. Incoming
messages are white bubbles with a soft shadow on the left; the student's replies are
indigo bubbles with white text on the right. Both 16px radius with one corner tightened.
Show a date divider and timestamps under grouped messages, and a typing indicator with
three dots.
Above the input bar, a horizontally scrolling row of three suggested reply chips with a
small sparkle icon.
The input bar has an attachment icon, a text field, and an indigo send button.
```

**S4.5**
```
Build the selection celebration overlay, mobile 390x844. This is the emotional peak of
the app — make it feel earned but stay professional, not cheesy.

A full-screen overlay on the AI gradient background. Sparse, small confetti pieces in
brand colours — restrained, not a party popper.
Centred: heading "You've been selected!" in large white text.
Below it, the student's circular avatar and the company's logo tile side by side with a
small spark or connecting line between them.
Then "TechNova wants to talk about Frontend Developer Intern".
Then a large white fit ring showing 92%.
At the bottom, a white "Read their message" button and a "Later" text link.
```

---

## FILE S5 — Profile and the rest

New file → PRIMER → then these.

**S5.1**
```
Build the student Profile screen, mobile 390x844, with bottom navigation.
A cover gradient at the top with a circular avatar overlapping it, then name, "B.Tech
Computer Engineering", university, "Graduating 2027", and an edit pencil button.
A "Profile strength 80%" card with a progress bar and one specific suggestion: "Add a
GitHub link — students with one get selected 2× more often."
Then sections:
  Skills — chips, with a small green dot on skills backed by a project
  Projects — two expandable cards with tech tags and GitHub links
  Experience, Education
  Preferences summary
  A resume card with the filename, and View and Replace actions
  A row of GitHub, portfolio and LinkedIn links
Also produce the edit mode: same layout with fields active, chips showing remove x's,
"Add" affordances, and a sticky Save bar at the bottom.
```

**S5.2**
```
Build two more student screens, mobile 390x844.

Screen A — Learning list. Skills the student is missing, collected across all their
applications and ranked by demand. Each row: the skill name, a line like "Wanted by 6 of
your applications", a three-state toggle (Not started / Learning / Done), and a small
"Find roles that don't need this" link. Show 5 skills. This should feel motivating and
practical.

Screen B — Notifications, grouped by day with "Today" and "Yesterday" headers. Rows with
icons: "You've been selected by TechNova", "New message from Nexora Labs", "Your
application status changed", "A company viewed your profile", "5 new opportunities match
your profile". Unread ones have a subtle indigo tint background.
```

---

# PERSON B — COMPANY WEB DASHBOARD

Desktop screens, 1440 × 1024. Five files.

---

## FILE C1 — Landing page and sign up

New Make file → paste THE PRIMER → then these.

**C1.1**
```
Build the InSwipe public landing page, desktop 1440 wide, one long scrolling page.
Content max-width 1280, centred.

Navigation bar: InSwipe mark and wordmark on the left; links How it works, For students,
For companies, Pricing; then "Sign in" and an indigo "Get started" button on the right.

Hero section: a large headline "Find the internship that fits you." at about 72px, a
sub-line "AI-powered matchmaking between students and the companies looking for their
next intern." Two large buttons side by side: "I'm a student" in indigo and "I'm hiring"
outlined. On the right of the hero, a floating mockup of the student's mobile job card
at a slight angle, with a green "92% fit" pill, subtly glowing.

Section 2 — How it works. Two parallel columns that converge:
  Students: upload resume → AI builds profile → swipe jobs → apply
  Companies: post a job → see ranked applicants → select → talk
  Both arrows converge on a single node at the bottom: "Conversation starts"

Section 3 — For students. A split layout: product screenshots of the swipe deck and the
fit breakdown on one side, three benefit bullets on the other.

Section 4 — For companies. A split layout the other way: a screenshot of the ranked
applicants dashboard, and three benefit bullets emphasising "see exactly what each
applicant fits and lacks".

Section 5 — A full-bleed statistics band on the AI gradient with four large numbers:
jobs posted, students, selections made, average time to first conversation.

Section 6 — A row of company logos.
Section 7 — A final call-to-action band, then a footer with link columns.
```

**C1.2**
```
Build the company sign up and onboarding, desktop 1440x1024.

Screen A — Sign up. A split screen: the form on the left half, a testimonial quote with
a customer photo and logo on the right half against a soft gradient. Fields: Work email
with a helper line "Use your company email — it's how you get verified", Company name,
Password. An indigo primary button and a Google SSO option. A link to sign in.

Screen B — Company onboarding, step 1 of 3, with a vertical progress rail on the left
showing all three steps. Step 1 is Company profile: a logo upload drop zone, Company
name, a one-line tagline, a description text area, Industry dropdown, Company size
dropdown, Founded year, Website, HQ location.

Screen C — Step 3, Verification. An explainer about domain verification, the current
"Pending" state with a spinner, a preview of what the Verified badge will look like, and
a note that verified companies receive more applicants.
```

---

## FILE C2 — Dashboard, jobs and posting

New file → PRIMER → then these.

**C2.1**
```
Build the InSwipe company dashboard, desktop 1440x1024.

Every internal screen shares this shell — establish it here:
A persistent left sidebar, 240px wide, white with a 1px right border. At the top, the
company logo, company name and a small verified badge. Navigation items with Lucide
icons: Dashboard, My Jobs, Applicants, Inbox, Company Profile. The active item has an
indigo tint background with indigo text and icon, 12px radius. At the bottom: Settings,
Help, and an account row with an avatar.
A top bar 64px tall: the current page title on the left, a global search field in the
middle, a notification bell with a red badge and an indigo "Post a job" button on the
right.

The dashboard content:
A greeting row: "Good morning, Priya" with today's date beneath.
Four statistic cards across the top, each with an icon, a large number, a label and a
small green trend delta: Active jobs 3 · New applicants 47 · Awaiting review 12 ·
Active conversations 5.

Then a two-column layout.
Left column, "Needs your attention": a list of three job cards, each showing the role
title, a count like "12 applicants awaiting review", and an indigo "Review applicants"
button. Below that, an activity feed with small avatars and timestamps: "Aarav Sharma
applied to Frontend Developer Intern", "Priya Nair replied", "Your Backend Intern
posting expires in 3 days".

Right column: a hiring funnel visualisation with stages and counts stacked vertically —
Applied 47, Reviewed 22, Selected 8, In conversation 5, Interview 2, Offer 1. Below it,
"Strongest applicants this week" — three compact rows with avatars, names and fit rings.
```

**C2.2**
```
Build the My Jobs screen, desktop 1440x1024, using the same sidebar and top bar shell.

A page title "My Jobs" with filter chips (All, Active, Draft, Closed) and a sort
dropdown.
Then a list of job cards — cards, not a table row. Each card: the role title in bold, a
status tag (Active in green, Draft in grey, Closed in light grey), the posted date, and
an inline statistics strip with four small figures: Views 340 · Applicants 24 ·
Selected 3 · In conversation 2. On the right of each card, an indigo "Review applicants"
button and a three-dot overflow menu.
Show 4 job cards with different statuses.
Also produce the empty state: "No jobs posted yet" with a "Post your first job" button.
```

**C2.3**
```
Build the Post a Job form, desktop 1440x1024, using the sidebar shell.

A two-column layout: the form on the left (about 60%) and a LIVE PREVIEW pinned on the
right (about 40%) showing exactly how the job will appear as a card in the student's
mobile swipe deck — rendered inside a small phone frame. This preview is the point of
the screen.

Show step 2 of 4, Requirements, fully filled in. A step indicator across the top: Role
basics · Requirements · Logistics · Review.

The form shows:
  "Required skills" — a chip input with React, JavaScript, REST APIs, Git added. A
  helper line: "These drive the fit score. Be strict — they filter who reaches you."
  "Preferred skills" — a chip input with Docker, PostgreSQL, TypeScript added, styled
  visibly differently from required. A helper line: "Nice to have. These appear as gaps,
  not blockers."
  Experience expectations — a dropdown
  Minimum year of study — a dropdown

The preview panel shows the student-facing card with the company logo, role title,
location, the green and orange skill tags, duration and stipend.

At the bottom: "Back" outlined and "Continue" indigo.
```

---

## FILE C3 — The applicants dashboard (the centrepiece)

New file → PRIMER → then these. **This is the most important file on the company side.**

**C3.1**
```
Build the Applicants dashboard, desktop 1440x1024, using the sidebar shell. This is the
single most important screen in the company product.

Context header: "Frontend Developer Intern" as the page title, with a grey sub-line
"24 applicants · ranked by fit". A tab bar beneath: Overview · Applicants (active) ·
Selected · Analytics.

A control bar: a sort dropdown showing "Best fit", filter chips (Skill, Availability,
Work mode, University, Graduation year, Minimum fit), a search field, a "Has note"
toggle, and a List / Compare view toggle on the right.

Then the ranked list of applicants, best fit first. Each row is a white card about 120px
tall with 16px radius and a soft shadow that lifts on hover.

Each row contains, left to right:
  A large muted rank number (1, 2, 3…)
  A circular avatar with a small green online dot
  A block with: the name in bold, then "B.Tech Computer Engineering · IIT Delhi · 2027"
  in smaller grey
  TWO LABELLED SKILL ROWS — this is the most important part of the screen, make the
  split immediately obvious:
      "Fits:" followed by green filled tags — React, JavaScript, REST APIs, Git
      "Lacks:" followed by orange outlined tags — Docker, PostgreSQL
  A small grey meta line: "3 projects · GitHub · Portfolio · Resume attached"
  A quote icon on rows where the student wrote a note, with the first few words showing
  On the right: a circular fit ring showing the percentage, with a one-line rationale
  beneath it like "Strong React and API project evidence"
  Two buttons: "View profile" outlined and "Select" indigo

Show 7 applicant rows with these fit scores: 94, 89, 86, 81, 74, 68, 61.
The ring colours must follow the bands — green for 85 and above, indigo for 70 to 84,
grey below 70 — so the ranking is legible without reading numbers.

Insert a soft divider with a small label "Strong fits" above the top three, and another
labelled "Also applied" before the bottom two.
```

**C3.2**
```
Build the candidate profile drawer, desktop 1440x1024. It slides in from the right, 600px
wide, over a dimmed version of the applicants list so the reviewer never loses their
place. Show the dimmed list behind it.

Contents, top to bottom:
  A close X and the candidate's avatar, name, "B.Tech Computer Engineering · IIT Delhi ·
  2027", location, and a large fit ring showing 94% with "Strong fit" beneath

  The note the student sent, in a quoted block with a quote mark — placed high because
  it's the most human thing on the screen

  A fit breakdown block: four labelled progress bars — Skills 95 · Experience 82 ·
  Interests 94 · Preferences 100
  Then a heading "WHAT THEY BRING" with four green check rows, written for a recruiter:
    ✓ React — "2 shipped projects using your exact frontend stack."
    ✓ JavaScript — "Primary language across their portfolio."
    ✓ API experience — "Their expense tracker consumes and handles a third-party API."
    ✓ Availability — "Free from June. Matches your 3-month window."
  Then "WHAT THEY LACK" with three orange hollow circle rows:
    ○ Docker — "No exposure. You listed it as preferred, not required."
    ○ PostgreSQL — "Has MySQL experience. Would transfer with a short ramp."
    ○ TypeScript — "Not evidenced in any project."

  THE RESUME BLOCK — two elements:
    An AI summary card with a subtle AI gradient left border, a sparkle icon and a small
    uppercase label "AI SUMMARY — READ AGAINST THIS ROLE". Three short paragraphs
    summarising the resume specifically through the lens of this job's requirements, plus
    a line noting something the structured profile missed. A small info icon.
    A resume file card with a PDF icon, the filename, and a prominent "View original PDF"
    button.

  Then collapsed sections: Skills, Projects, Experience, Education, Availability,
  Preferences.

A sticky footer with a small grey line above the buttons: "Selecting notifies the
candidate and opens a conversation." Then three actions: "Not a fit" as a quiet text
button on the left, "Save for later" outlined, and "Select candidate" in indigo.
```

**C3.3**
```
Build the resume viewer, desktop 1440x1024. A large modal over a dimmed background.
On the left, about 65% width, an embedded PDF viewer showing a realistic one-page student
resume with page controls.
On the right, a 35% rail titled "This role's requirements" listing the job's required and
preferred skills as a checklist — met ones with green checks, missing ones with orange
hollow circles — so the reviewer can read the document against the role without
switching context.
A header with the candidate's name, a Download button and a close X.
```

**C3.4**
```
Build three more company screens, desktop 1440x1024.

Screen A — Applicants empty and loading states. Empty: "No applicants yet. Students who
apply to this role appear here, ranked by how well they fit." Loading: four grey shimmer
skeleton rows in the applicant row shape.

Screen B — Compare view. Three candidates side by side in equal columns, with aligned
rows running across: fit score rings, "Fits" skill tags, "Lacks" skill tags, projects
count, availability, preferences, and their note. Differences should read horizontally at
a glance. Each column has a "Select" button at the bottom.

Screen C — The applicants list in its reviewed state. The same ranked list, but now the
top row has a green "Selected" status tag with a muted treatment, and two lower rows are
collapsed to half height and dimmed with a small "Undo" link — showing the reviewer has
made visible progress through the list.
```

---

## FILE C4 — Selection and inbox

New file → PRIMER → then these.

**C4.1**
```
Build two selection screens, desktop 1440x1024.

Screen A — Select confirmation modal, centred over the dimmed applicants list. Heading
"Select Aarav Sharma?" and body text: "This notifies Aarav, unlocks their inbox and opens
a conversation. You'll send the first message." Two buttons: "Cancel" outlined and
"Confirm" indigo.

Screen B — Selection confirmed. A centred modal on a soft AI gradient background. The
company logo and the candidate's avatar side by side with a connecting spark. Heading
"Selected — 94% fit". Below it, an inline message composer already containing an
AI-drafted opening message the recruiter can edit: "Hi Aarav — we were impressed by your
expense tracker project and think you'd be a strong fit for our frontend team. Do you
have time this week for a short call?" Two buttons: "Send first message" indigo and "Back
to applicants" outlined. Keep it restrained — minimal or no confetti. This is a workplace
tool, not a celebration.
```

**C4.2**
```
Build the company Inbox, desktop 1440x1024, using the sidebar shell. A three-pane layout.

Left pane, 280px — the conversation list. A search field, then rows with the candidate's
avatar, their name in bold, the job title beneath in smaller grey, the last message
truncated, a timestamp, and an unread badge on one. Show 5 conversations, one selected
with an indigo tint background.

Centre pane — the active conversation. A header with the candidate's name, the role, and
a "Schedule interview" button. Then messages: the company's own messages as indigo
bubbles on the right, the candidate's as white bubbles with a soft shadow on the left.
A date divider and timestamps. An input bar at the bottom with an attachment icon and a
send button.

Right pane, 300px — a context rail so the recruiter keeps context while typing. The
candidate's avatar and name, their fit ring, a compact "Fits" list of green tags, a
compact "Lacks" list of orange tags, a resume link, and a "View full profile" button.

Also produce a variant showing a brand new conversation where the composer holds an
AI-drafted opening message, since the company always messages first.
```

---

## FILE C5 — Pipeline and the rest

New file → PRIMER → then these.

**C5.1**
```
Build the hiring pipeline board, desktop 1440x1024, using the sidebar shell.
A kanban board with seven columns: Applied, Reviewed, Selected, In conversation,
Interview, Offer, Hired. Each column header shows its name and a count badge.
Compact candidate cards in each column: a small avatar, the candidate's name, the job
title in smaller grey text, and a small fit percentage pill. Cards should look draggable.
Show one card mid-drag with a lifted shadow and rotation, and its target column
highlighted with a dashed indigo border.
```

**C5.2**
```
Build three more company screens, desktop 1440x1024, using the sidebar shell.

Screen A — Company profile, exactly as students see it, with an "Edit" button and a
"Preview as student" toggle in the corner. A cover image, logo, company name with
verified badge, tagline, an About paragraph, a meta grid (industry, size, founded,
location, website), culture tags as chips, tech stack as chips, four team member cards
with photos and roles, and a grid of open jobs.

Screen B — Analytics for one job. Statistic cards across the top: impressions, apply
rate, average applicant fit, time to first selection. A line chart of applications over
time. A horizontal bar chart of skill demand among applicants. And a highlighted insight
card with a lightbulb icon: "Docker is filtering out 8 otherwise-strong candidates.
Consider moving it to preferred." with a "Edit requirements" button.

Screen C — Settings. A tabbed layout: Team, Notifications, Billing, Verification. Show
the Team tab with a list of team members, their roles in dropdowns, a pending invitation
row, and an "Invite team member" button.
```

---

# When you're both done

1. **Screenshot every screen** you're happy with. In Figma Make, use the preview and
   capture each one.
2. **Send me the screenshots** — I'll build the real frontend from them. Send them in
   flow order and tell me which product each belongs to.
3. **Also tell me what came out badly.** If Figma refused to produce something or made a
   mess of it, I can just build that screen directly in code. Don't fight it for hours.
4. **Share the Figma file links** if you can, so I can look at the actual layouts and
   spacing rather than working from images alone.

## Coordination between the two of you

- **Both use the same primer, unedited.** This is the only thing keeping the two products
  visually consistent.
- **Agree on the fit-score visuals early.** Person A generates the fit ring on the
  student side first — screenshot it and send it to Person B so the company version
  matches. It's the component that appears most on both sides.
- **Same for the fit/gap tags.** Green filled, orange outlined, same shape and size on
  both products.
- **Check in after your first hero file** (S2 for Person A, C3 for Person B). If those
  two don't look like the same product, fix it before generating another 40 screens.

## If Figma Make isn't working out

Tell me what's happening. If it's refusing prompts, producing broken layouts, or you've
hit a usage limit, I can build any screen directly in code instead. There's no reason to
wrestle with a tool that isn't cooperating when the end goal is code anyway.
