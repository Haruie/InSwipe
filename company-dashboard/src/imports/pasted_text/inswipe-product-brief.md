I'm building InSwipe, an AI-powered internship matchmaking platform. Learn the design
system in PART 0 and apply it to everything. Then build PART 1 through PART 8.

════════════════════════════════════════════════
PART 0 — DESIGN SYSTEM AND PRODUCT MODEL
════════════════════════════════════════════════

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
anything else — not for stat numbers, not for status icons, not for decoration. Orange
must never look like an error and must never carry a warning-triangle icon — a gap is a
to-do, not a failure.

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
Apply the bands to every form — pills, rings and bars alike.

THE FIT / GAP SPLIT — the most important visual idea in the product
Wherever requirements appear, they split in two and the split must be immediately
obvious at a glance:
  Green filled tags     = requirements the student MEETS, with a check icon
  Orange outlined tags  = requirements the student LACKS, with a hollow circle icon
Always label the two groups in text ("Fits:" / "Lacks:", or "You meet these" /
"You're missing these") — never rely on colour alone.
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
(TechNova, Zomato, Swiggy, Nexora Labs, PixelForge, Razorpay, Zerodha). Indian cities
(Bangalore, Mumbai, Pune, Hyderabad, Delhi NCR, Chennai) and stipends in rupees
(₹20,000/month). Indian universities (IIT Delhi, IIT Bombay, BITS Pilani, NIT Trichy,
VIT Vellore, Manipal, K. J. Somaiya). Believable student names and real project
descriptions. Never "Company 1", "Test Job", or lorem ipsum.

The recurring student is Aarav Sharma, B.Tech Computer Engineering, IIT Delhi, Class of
2027, Delhi NCR. His projects are an AI Expense Tracker (Python, React, Supabase, Gemini
API) and a Campus Events App (React Native, Firebase). His fit for the recurring job —
Frontend Developer Intern at TechNova, Bangalore, Hybrid, 3 months, ₹20,000/month — is
92%.

════════════════════════════════════════════════
PART 1 — PUBLIC LANDING PAGE  (desktop, 1440 wide)
════════════════════════════════════════════════

One long scrolling page. Content max-width 1280, centred.

Navigation bar: InSwipe mark and wordmark on the left; links How it works, For students,
For companies, Pricing; then "Sign in" and an indigo "Get started" button on the right.

Hero: headline "Find the internship that fits you." at about 72px. Sub-line "AI-powered
matchmaking between students and the companies looking for their next intern." Two large
buttons side by side: "I'm a student" indigo, "I'm hiring" outlined. On the right, a
floating mockup of the student's mobile job card at a slight angle, subtly glowing.

That hero card is the product's signature image — build it exactly: white card, 20px
radius, raised shadow, a company office photo across the top half with a soft dark scrim,
a green "92% fit" pill top-right, a white rounded-square TechNova logo tile overlapping
the photo's bottom-left, "TechNova" bold with a small indigo Verified badge, a grey line
"Bangalore · Hybrid", the role "Frontend Developer Intern", then green filled tags for
React, JavaScript and REST APIs and orange outlined tags for Docker and PostgreSQL, and
a bottom row with "3 months" left and "₹20,000/month" right.

Section 2 — How it works. Two parallel columns that converge:
  Students: upload resume → AI builds profile → swipe jobs → apply
  Companies: post a job → see ranked applicants → select → talk
  Both arrows converge on one node at the bottom: "Conversation starts"

Section 3 — For students. Split layout: product mockups of the swipe deck and the fit
breakdown on one side, three benefit bullets on the other.

Section 4 — For companies. Split the other way: a mockup of the ranked applicants
dashboard, and three benefit bullets emphasising "see exactly what each applicant fits
and lacks".

Section 5 — Full-bleed statistics band on the AI gradient, four large numbers: jobs
posted, students, selections made, average time to first conversation.

Section 6 — A row of company logos.
Section 7 — A final call-to-action band, then a footer with link columns.

════════════════════════════════════════════════
PART 2 — COMPANY SIGN UP AND ONBOARDING  (desktop 1440x1024)
════════════════════════════════════════════════

Screen A — Sign up. Split screen: form on the left half, a testimonial quote with a
customer photo and logo on the right half against a soft gradient. Fields: Work email
with helper line "Use your company email — it's how you get verified", Company name,
Password. Indigo primary button and a Google SSO option. A link to sign in.

Screen B — Onboarding step 1 of 3, with a vertical progress rail on the left showing all
three steps. Step 1 is Company profile: logo upload drop zone, Company name, a one-line
tagline, a description text area, Industry dropdown, Company size dropdown, Founded year,
Website, HQ location.

Screen C — Step 3, Verification. An explainer about domain verification, the current
"Pending" state with a spinner, a preview of the Verified badge, and a note that verified
companies receive more applicants.

════════════════════════════════════════════════
PART 3 — RESUME VIEWER  (desktop 1440x1024)
════════════════════════════════════════════════

A large modal over a dimmed background.
Left, about 65% width: an embedded PDF viewer showing a realistic one-page Indian student
resume with page controls.
Right, a 35% rail titled "This role's requirements" listing the job's required and
preferred skills as a checklist — met ones with green checks, missing ones with orange
hollow circles — so the reviewer reads the document against the role without switching
context.
Header with the candidate's name, a Download button and a close X.

════════════════════════════════════════════════
PART 4 — STUDENT APP: ONBOARDING  (mobile 390x844)
════════════════════════════════════════════════

Screen 1 — Splash. Dark violet gradient (#1B1730 to #3B2A6E). InSwipe logo mark and
wordmark top-left in white. Headline "Swipe in. Stand out." with the second line in
#A78BFA. Below, smaller semi-transparent white: "AI-powered matching between students and
the companies hiring them." At the bottom a full-width indigo "Get Started" button and a
text link "I already have an account".

Screen 2 — A 3-step intro carousel with page dots and a Skip link top-right. Each has a
large illustrative graphic, a heading and one sentence. Show all three as separate frames:
  1. "Your resume, understood" — AI reading a resume into a profile
  2. "Jobs ranked by how well you fit" — a stack of job cards
  3. "Get selected, then talk" — a padlock opening into a chat

Screen 3 — Sign up / Sign in. A segmented control at the top switching between Sign Up and
Sign In. Fields: Full name, Email, Password with a show/hide eye icon. Full-width indigo
button. A divider "or continue with", then two full-width outlined buttons with logos:
"Continue with Google" and "Continue with LinkedIn — imports your profile". A terms and
privacy footnote. No phone or SMS option. Also show two variants: primary button disabled
because fields are empty, and an email field in its error state.

Screen 4 — The profile-building fork. Heading "How would you like to build your profile?"
Two large stacked option cards filling most of the screen. The first is dominant and
clearly recommended — subtle AI gradient border, sparkle icon, title "Upload your resume",
description "We'll read it and build your profile in seconds. You can edit everything
after.", and a small badge "Fastest — about 30 seconds". The second is plain white, "Fill
it in manually", "Enter your details yourself. About 5 minutes." Make the first obviously
preferred without disabling the second.

Screen 5 — Resume upload. A large dashed-border drop zone filling most of the screen with
an upload icon, "Drop your resume here or browse", a line "PDF, DOC or DOCX · max 5MB",
and a reassurance "Your resume is sent only to companies you apply to." Also show the
uploading state with a progress bar.

Screen 6 — AI parsing. Full-screen moment on the AI gradient background. An animated
document-turning-into-profile visual centred. Below it a checklist revealing line by line
with green checks and one spinner:
  ✓ Reading your resume
  ✓ Extracting skills
  ✓ Finding your projects
  ⟳ Ranking opportunities for you
Calm and premium, not busy.

Screen 7 — Review extracted profile. The most important onboarding screen, take care.
Heading "Here's what we found", subheading "Check it over — you can change anything."
Then everything the AI extracted as editable cards, each with a small pencil icon:
  Basic info — name, email, phone, university, degree, graduation year
  Skills — extracted skills as removable chips with small x's, plus a "+ Add skill" chip
  Projects — two project cards with name, description and tech tags
  Experience — one role with company and dates
  Education
IMPORTANT: two fields must show a low-confidence state — a dotted orange underline and a
small orange "Confirm?" tag beside them, showing what the AI wasn't sure about.
A sticky footer with a full-width indigo "Looks good — continue" button.

Screens 8 to 11 — Manual profile entry, 4 steps. Each has a progress bar and back arrow
at the top and a sticky Continue button at the bottom.
  Step 1 Basic info — circular photo uploader with a camera badge, then Full name,
  University (searchable), Degree, Field of study, Graduation year.
  Step 2 Skills — a search field, popular skills as selectable chips in a wrapped grid, an
  "Add custom skill" option, a live count "6 selected", and the selected skills pinned in a
  row at the top. Show some chips selected in indigo tint and some not.
  Step 3 Projects — first the empty state: "Projects are how companies see what you can
  actually build" with an "Add project" button. Then a filled state with two project cards.
  Also show the add-project bottom sheet: Name, Description, Tech stack chips, GitHub URL,
  Live demo URL, Your contribution.
  Step 4 Preferences — role interest chips (Frontend, Backend, Full Stack, AI/ML, Data
  Science, UI/UX, Product, Marketing, Finance, Research), a 3-way segmented control for
  work mode (Remote / Hybrid / On-site), a multi-select for preferred locations, a
  segmented control for duration (1 / 2 / 3 / 6 months), and stipend chips (Unpaid, ₹5k+,
  ₹10k+, ₹20k+, ₹30k+, Flexible). Final button reads "Find my opportunities".

════════════════════════════════════════════════
PART 5 — STUDENT APP: DISCOVER  (mobile 390x844)
════════════════════════════════════════════════

This is the app's main screen. Take the most care here.

Top bar: InSwipe mark and wordmark left, a notification bell and circular avatar right.
Below: title "Opportunities for you" and a smaller grey line "Ranked by how well you fit
— best first."

Then a card stack: one card fully visible with two more peeking behind it, each scaled
down slightly (4% then 8%) and offset 8px and 16px downward with reduced opacity.

THE JOB CARD — white, 20px radius, raised shadow, about 62% of available height:
  Top half: a company office photo with a soft dark gradient scrim over the bottom
  Top-right: a fit pill "92% fit" — green tint background, dark green text
  Overlapping the photo's bottom-left: a white rounded-square company logo tile
  Company name in bold with a small indigo "Verified" badge
  A grey line with a pin icon: "Bangalore · Hybrid"
  Role title, prominent: "Frontend Developer Intern"
  One truncated line of description
  A skills row — the most important part of the card: requirements the student MEETS as
  green filled tags (React, JavaScript, REST APIs) and requirements they LACK as orange
  outlined tags (Docker, PostgreSQL)
  A bottom row: calendar icon "3 months" left, rupee icon "₹20,000/month" right
  A small grey line: "Tap for full requirements"

Below the card, three circular action buttons evenly spaced:
  Pass — red X, white background, red outline, 56px
  Save — amber star, white background, 48px, centred and slightly smaller
  Apply — white check on a green filled circle, 56px
With small uppercase caption labels beneath: PASS · SAVE · APPLY

Then three drag-state variants of the same screen:
  Variant A — dragging right. Top card shifted right ~80px, rotated +8°, translucent green
  overlay, a large green circular badge with a white check centred, "APPLY" in bold green
  beneath.
  Variant B — dragging left. Shifted left 80px, rotated -8°, translucent red overlay, a
  large red circular badge with a white X, "PASS" in bold red beneath.
  Variant C — just saved. Card in normal position, an amber toast floating above the action
  buttons reading "Saved to your list" with a star icon.

Then two more states:
  Empty — no cards left. A centred illustration, heading "You're all caught up", a line
  "New opportunities matched to your profile land here daily", and a secondary outlined
  button "Adjust preferences".
  Loading — a grey shimmer skeleton card in the stack position with skeleton blocks where
  the logo, title and tags would be. Action buttons visible but disabled.

Add a bottom navigation bar to every Discover screen: five tabs — Discover, Applications,
Saved, Inbox, Profile — with Lucide icons and labels. The active tab (Discover) is indigo
with a filled icon, the others grey. Show a small padlock badge on the Inbox tab icon.

Then a filter bottom sheet sliding up from Discover: a drag handle, title "Filter
opportunities", a close X. Sections: Role (chips), Work mode (segmented), Location
(multi-select), Duration (segmented), Stipend (chips), Minimum fit (a slider showing 70%).
At the bottom two buttons: "Reset" outlined and "Show 24 opportunities" indigo.

════════════════════════════════════════════════
PART 6 — STUDENT APP: JOB DETAIL AND APPLYING  (mobile 390x844)
════════════════════════════════════════════════

Screen A — Job detail, scrollable. Make the frame taller than 844 to show the full scroll.
Top: a company office hero image with a back arrow and a save star overlaid in translucent
circles. Then a white content area overlapping the image with rounded top corners:
  Company logo tile, company name bold, a "Verified" badge, a chevron on the right
  Role title, large: "Frontend Developer Intern"
  A meta row with icons: Bangalore · Hybrid · 3 months · ₹20,000/month

THE FIT BLOCK — visually distinct with a subtle AI gradient border and a sparkle icon,
with a small uppercase label "YOUR FIT":
  A large circular fit ring showing 92% with "Strong fit" beneath
  Four labelled horizontal progress bars: Skills Match 95% · Experience 82% ·
  Interests 94% · Preferences 100%
  A full-width outlined button: "See what you fit and what's missing"

Then, in order:
  About the role — two paragraphs
  What you'll do — four bulleted responsibilities
  Requirements — split into two clearly separated groups with headings:
      "You meet these" — green check rows: React, JavaScript, REST APIs, Git
      "You're missing these" — orange hollow circle rows: Docker, PostgreSQL
    Label each as Required or Preferred
  About the company — logo, company size, industry, and a tappable "View company profile"
  row with a chevron
A sticky bottom bar with "Save" outlined and "Apply" indigo, the Apply button wider.

Screen B — Fit breakdown bottom sheet, covering about 85% of the screen over a dimmed
version of the job detail behind it.
A drag handle. Header row: "Your fit for this role" left, a small 92% fit ring right.
Below, a small grey line with an info icon: "Based on required skills, project evidence,
your preferences and availability."
Section heading in small uppercase grey: "WHAT YOU BRING"
Four rows, each a green check icon, a bold skill name, one plain sentence beneath:
  ✓ React — "You've used React in 2 projects. It's a core requirement here."
  ✓ JavaScript — "Directly matches the primary language for this role."
  ✓ Project evidence — "Your AI Expense Tracker shows the API work this team does daily."
  ✓ Work preference — "You want hybrid. This role is hybrid in Bangalore."
A divider.
Section heading: "WHAT TO WORK ON"
Three rows, each an orange hollow circle, a bold skill name, one encouraging sentence:
  ○ Docker — "Preferred, not required. A weekend project would cover it."
  ○ PostgreSQL — "Listed as preferred. Your SQL experience already transfers."
  ○ TypeScript — "Wanted by 6 of your applications. Worth learning next."
Then a full-width outlined button "Add these to my learning list" and a small grey footer
note "Your fit updates as you add skills and projects."
The tone must feel like genuine helpful insight, never like a rejection.

Screen C — Application note sheet, appearing on swipe right or Apply. A bottom sheet
covering about half the screen over a dimmed background. It must feel quick and skippable,
never like a form.
Drag handle. Header: "Applying to Frontend Developer Intern at TechNova". A small pill with
a sparkle icon and AI gradient: "AI-drafted — edit or send as is".
A text area already filled with:
"I've built two React projects, including an expense tracker that handles a third-party
API — close to the frontend work described here. I'm available from June for three months
and I'm looking for exactly this kind of hybrid role in Bangalore."
Below it a character counter on the left and a small "Regenerate" text button with a
refresh icon on the right.
Then a compact resume row with a PDF icon: "Aarav_Sharma_Resume.pdf will be sent with your
application" and a small "Change" link.
At the bottom two buttons of EQUAL visual weight so skipping doesn't feel like the lesser
choice: "Send without note" outlined and "Send with note" indigo.
Also show a variant where the text area is empty with the placeholder "Add a note
(optional)".

Screen D — Application confirmation, a modal over a dimmed background. A green circular
check icon, heading "Applied to Frontend Developer Intern", a line "TechNova will review
your application. You'll hear here if they select you." and a smaller grey line
"12 applications active". Two buttons: "Keep swiping" indigo and "View my applications"
outlined. Deliberately calm — no confetti, no celebration.

Screen E — Company profile as the student sees it. A cover image, company logo, name with
verified badge, a one-line tagline. Then an About paragraph, a meta grid (industry, company
size, founded, location, website), culture tags as chips, tech stack as chips, three team
member cards with photos and roles, and a grid of their other open roles each showing the
student's fit percentage. A back button labelled "Back to job".

════════════════════════════════════════════════
PART 7 — STUDENT APP: APPLICATIONS, INBOX AND CHAT  (mobile 390x844)
════════════════════════════════════════════════

All with the five-tab bottom navigation.

Screen A — Applications tracking (Applications tab active).
A summary strip at the top: "12 applications · 2 selected · 1 not selected".
Filter chips in a scrollable row: All, Active, Under review, Selected, Not selected.
Then application rows, each with a company logo tile, company name, role title, a fit
percentage pill, a status tag, and a grey line "Applied 3 days ago". A small quote icon on
rows where the student sent a note.
Status tags with distinct treatments:
  Applied — grey · Under review — indigo · Shortlisted — indigo filled ·
  Selected — green · Not selected — light grey
Show 8 rows: 2 Selected, 1 Shortlisted, 3 Under review, 1 Applied, 1 Not selected.
Selected rows are elevated with a green left border and an "Open chat" button. The Not
selected row is dimmed with a small "See similar roles" link.
Also the empty state: "No applications yet. Swipe right on opportunities you want." with a
"Start swiping" button.

Screen B — Application detail, what you see tapping a row. A back arrow and the job summary
at top: company logo, name, role, fit pill. Then the note the student sent in a quoted
block. Then a resume row showing the attached PDF. Then a condensed fit breakdown as it
stood when they applied. Then a vertical status timeline with dates: "Applied 12 Sep" and
"Under review 14 Sep" completed in indigo with a connecting line, then "Shortlisted" and
"Selected" greyed out as future steps.

Screen C — Saved tab. A list of starred jobs, each with a company logo, name, role, fit
pill, a remove X and a small "Apply" button. Also the empty state: "Nothing saved. Tap the
star on any card to keep it for later."

Screen D — The LOCKED Inbox. Important — most students see this often before their first
selection, so it must feel like anticipation, not a dead end. A centred padlock
illustration, heading "Your inbox unlocks when a company selects you", a line "Companies
review everyone who applies. When one picks you, they'll message you here." Below that a
reassuring line "You have 12 active applications." and an outlined button "View
applications". Keep the padlock badge on the Inbox tab.

Screen E — Unlocked Inbox. A search field at top, then conversation rows: a company logo
with a small green online dot, company name bold, the role beneath in smaller grey, the
last message truncated, a timestamp right, and an indigo unread count badge on one row.
Show 4 conversations.

Screen F — A chat thread. Header with a back arrow, company logo, company name, the role in
smaller text beneath, and an overflow menu.
At the very top of the message area, a system card: "TechNova selected you for Frontend
Developer Intern · 92% fit" with a link to the job.
Then messages. IMPORTANT: the first message is always from the company. Incoming messages
are white bubbles with a soft shadow on the left; the student's replies are indigo bubbles
with white text on the right. Both 16px radius with one corner tightened. Show a date
divider, timestamps under grouped messages, and a typing indicator with three dots.
Above the input bar, a horizontally scrolling row of three suggested reply chips with a
small sparkle icon. The input bar has an attachment icon, a text field, and an indigo send
button.

Screen G — The selection celebration overlay. The emotional peak of the app — make it feel
earned but stay professional, not cheesy. A full-screen overlay on the AI gradient
background with sparse, small confetti pieces in brand colours — restrained, not a party
popper. Centred: heading "You've been selected!" in large white text. Below it the
student's circular avatar and the company's logo tile side by side with a small spark
between them. Then "TechNova wants to talk about Frontend Developer Intern". Then a large
white fit ring showing 92%. At the bottom a white "Read their message" button and a "Later"
text link.

════════════════════════════════════════════════
PART 8 — STUDENT APP: PROFILE AND THE REST  (mobile 390x844)
════════════════════════════════════════════════

Screen A — Student Profile, with bottom navigation. A cover gradient at the top with a
circular avatar overlapping it, then name, "B.Tech Computer Engineering", university,
"Graduating 2027", and an edit pencil button.
A "Profile strength 80%" card with a progress bar and one specific suggestion: "Add a
GitHub link — students with one get selected 2× more often."
Then sections:
  Skills — chips, with a small green dot on skills backed by a project
  Projects — two expandable cards with tech tags and GitHub links
  Experience, Education
  Preferences summary
  A resume card with the filename and View and Replace actions
  A row of GitHub, portfolio and LinkedIn links
Also produce the edit mode: same layout with fields active, chips showing remove x's, "Add"
affordances, and a sticky Save bar at the bottom.

Screen B — Learning list. Skills the student is missing, collected across all their
applications and ranked by demand. Each row: the skill name, a line like "Wanted by 6 of
your applications", a three-state toggle (Not started / Learning / Done), and a small "Find
roles that don't need this" link. Show 5 skills. Motivating and practical.

Screen C — Notifications, grouped by day with "Today" and "Yesterday" headers. Rows with
icons: "You've been selected by TechNova", "New message from Nexora Labs", "Your
application status changed", "A company viewed your profile", "5 new opportunities match
your profile". Unread ones have a subtle indigo tint background.

════════════════════════════════════════════════

Build PART 1 through PART 8. Keep every screen on the design system in PART 0 — the exact
hex values, Inter, the fit bands, and the labelled green/orange split.