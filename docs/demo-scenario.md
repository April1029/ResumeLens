# ResumeLens Demo Scenario (draft v1)

Every prototype screen and every usability-test task runs on this one scenario. The person, the companies and all details are made up.

**Facts marked `BANK ONLY` were added by us.** They are not on Jordan's resume. They exist to show the "in your bank, not on this resume" evidence state. Check that each one sounds realistic for a second-year CS student.

---

## 1. The user

**Jordan Lee.** Second-year B.S. CS student at State University, graduating May 2028. Looking for a Summer 2027 software engineering internship. Has a master resume (pasted below in section 2) and one role version ("Backend"). Has applied to 3 internships so far.

---

## 1b. First-time onboarding

**Flow:** Welcome + upload → Parsing → Review facts → Add detail (optional) → Paste job posting → Tailor workspace.
Returning users land on **Profile** and start from "New tailoring."

### Step 1: Welcome + upload
- One action: upload a resume (PDF/DOCX) or paste the text. The prototype uses Jordan's resume.
- Privacy line: "Your resume and facts are stored in your account only. You can delete them anytime. We only send the text needed for each analysis to our AI provider."
- The uploaded resume becomes **Master** automatically.

### Step 2: Parsing (simulated in the prototype)
Progress messages appear one at a time:
1. "Reading your resume…"
2. "Found 1 degree and 4 courses"
3. "Found 2 roles"
4. "Found 4 projects"
5. "Found 4 activities and 9 skills"

### Step 3: Review facts
Parsed facts are shown grouped by category (Education, Experience, Projects, Activities, Skills). Each group has **Looks right** or **Fix**. Editing a fact is done inline.
Parsed from Jordan's resume (only what is on the resume; the `BANK ONLY` facts in section 2 don't exist yet):

| Category | Parsed facts |
|---|---|
| Education | ED1 B.S. CS, State University; C1–C4 course names (no project details) |
| Experience | E1 Teaching Assistant (4 bullets, no numbers); E2 IT Help Desk (3 bullets) |
| Projects | P1 ClubHub (5 bullets); P2 Pathfinder; P3 Bus Tracker; P4 Finance Tracker |
| Activities | A1–A4 |
| Skills | Java, JavaScript, Python, SQL, Git, GitHub Actions, Docker, PostgreSQL, Linux |

Footer: "Saved as your **Master** resume. Your master never changes when you tailor."

### Step 4: Add detail (optional)
Targeted questions about facts that look thin. Each one has a text box and **Skip**. Answers become new facts (they are what creates the `BANK ONLY` facts).

| # | Question | Jordan's answer in the demo | Creates |
|---|---|---|---|
| Q1 | "ClubHub: what did you personally build?" | "I owned the backend: the REST endpoints for events and RSVPs. I wasn't the team lead." | P1.a, owner/not-lead note on P1 |
| Q2 | "Teaching Assistant: about how many students do you help each week?" | "About 30 in office hours. My setup guide is used by the whole course, ~200 students." | E1 numbers |
| Q3 | "Campus Bus Tracker: how many people used it?" | "Me and 5 friends." | P3 user count |
| Q4 | "Any projects, hackathons or course projects not on your resume?" | "StudySpot at a hackathon (React map + Flask API); a Unix shell in C for OS class." | P5, C2 project |
| Q5 | "Did you review code or work through pull requests on any team project?" | "Yes, we reviewed each other's PRs on ClubHub and in SE class." | P1.d, C4 details |

Footer actions: **Continue to tailoring** and "I'll add more later." Both go to step 5. The fact bank stays editable in Profile.

### Step 5: Paste job posting
- Fields: job link (optional, saved for the Applications log), posting text (required), company and role (pre-filled from the text, editable).
- Note under the link field: "Many job sites block automatic reading, so paste the posting text too."
- Start from: **Master ▾** (or a role version).
- Button: **Analyze posting** → analyzing progress → Tailor workspace.

---

## 2. Profile: fact bank

Each fact has an ID, a short title, details, and whether it appears on the master resume. Suggestions cite these IDs.

### Education
| ID | Fact | Details | On master? |
|---|---|---|---|
| ED1 | B.S. Computer Science, State University | Expected May 2028. GPA 3.7. Dean's List Fall 2024, Spring 2025. | ✅ |
| C1 | Course: Data Structures | | ✅ (listed) |
| C2 | Course: Operating Systems | Built a Unix shell in C with pipes, I/O redirection and background jobs. | ✅ listed / project `BANK ONLY` |
| C3 | Course: Databases | Designed a normalized schema for a library system; wrote joins, views and indexes in PostgreSQL. | ✅ listed / project `BANK ONLY` |
| C4 | Course: Software Engineering | Team of 4, two-week sprints; every change merged through a GitHub pull request reviewed by a teammate. | ✅ listed / details `BANK ONLY` |

### Experience
| ID | Fact | Details | On master? |
|---|---|---|---|
| E1 | Teaching Assistant, CS 101 (Jan 2026 – present) | Office hours for about 30 students a week, mostly debugging Python. Grades weekly Python assignments. Wrote an environment-setup guide used by the whole course (about 200 students). Runs a weekly exam review session. | ✅ (bullets are vague; the numbers are `BANK ONLY`) |
| E2 | IT Help Desk Assistant, University Library (Sep 2024 – Dec 2025) | About 25 walk-in and email tickets a week. Password resets, lab computer setup each semester. Logged recurring issues in a spreadsheet for the IT lead. | ✅ (ticket count `BANK ONLY`) |

### Projects
| ID | Fact | Details | On master? |
|---|---|---|---|
| P1 | ClubHub: Flask, PostgreSQL, Docker (Fall 2025) | Web app for campus club events, built in a team of 4. Jordan **owned the backend** but was **not the team lead**. | ✅ |
| P1.a | ↳ REST API | Jordan wrote the REST endpoints for event listings and RSVPs. | `BANK ONLY` |
| P1.b | ↳ Tests | About 45 pytest unit tests for the backend. | ✅ ("wrote unit tests"; count and pytest `BANK ONLY`) |
| P1.c | ↳ CI | GitHub Actions workflow runs the tests on every push. | ✅ |
| P1.d | ↳ Code review | Reviewed teammates' pull requests before merge. | `BANK ONLY` |
| P1.e | ↳ Docker | Packaged the app with Docker Compose (app + database). | ✅ |
| P2 | Pathfinder Visualizer: JavaScript (Spring 2025) | BFS, DFS and A* on a grid, adjustable speed, wall drawing, deployed on GitHub Pages. | ✅ |
| P3 | Campus Bus Tracker: Python (Summer 2025) | Pulled the city transit feed and sent texts with the Twilio API when a bus was 5 minutes away. Cached responses to stay under the rate limit. Ran on a Raspberry Pi. **Used by Jordan and 5 friends.** | ✅ (Twilio, Pi, user count `BANK ONLY`) |
| P4 | Personal Finance Tracker: Java (Fall 2024) | Command-line app that sorts bank CSV exports into categories, stores categories in SQLite, prints monthly summaries. | ✅ |
| P5 | StudySpot, hackathon project (Spring 2026) | 24-hour campus hackathon, team of 3. Map of open study rooms. Jordan built the React map view and connected it to a teammate's Flask API. | `BANK ONLY` |

### Activities
| ID | Fact | On master? |
|---|---|---|
| A1 | Organized CS department game night for 80 students | ✅ |
| A2 | Hackathon Club member; competed in two campus hackathons | ✅ |
| A3 | Volunteer tutor, public library summer reading program | ✅ |
| A4 | Captain, intramural soccer team | ✅ |

### Skills
| ID | Skill | Evidence facts | On master? |
|---|---|---|---|
| S1 | Python | E1, P1, P3 | ✅ |
| S2 | Java | P4 | ✅ |
| S3 | JavaScript | P2, P5 | ✅ |
| S4 | SQL / PostgreSQL / SQLite | P1, P4, C3 | ✅ |
| S5 | Git, GitHub Actions | P1.c, C4 | ✅ |
| S6 | Docker | P1.e | ✅ |
| S7 | Linux | E2, C2 | ✅ |
| S8 | C | C2 | `BANK ONLY` |
| S9 | React (basic) | P5 | `BANK ONLY` |
| S10 | Flask, pytest | P1 | `BANK ONLY` |

### Resume versions
| Version | Notes |
|---|---|
| **Master** (default) | The resume as given. |
| Backend | Same as Master but ClubHub listed first, Pathfinder removed. |

---

## 3. Target posting

**Lumen Labs: Software Engineering Intern, Summer 2027** (link saved for reference; the text is pasted in)

> We're looking for an intern to join our platform team and help build the APIs behind our scheduling product.
>
> **Required**
> - Proficiency in Python or Java
> - Experience building REST APIs
> - Working knowledge of SQL and relational databases
> - Experience writing automated tests
> - Comfortable with Git and code review through merge requests (we use GitLab)
> - Able to explain technical ideas clearly to teammates
>
> **Nice to have**
> - Docker or other container tools
> - CI/CD experience (we use GitLab CI)
> - Frontend experience with React
> - Exposure to AWS or another cloud provider
> - Familiarity with Kubernetes

---

## 4. Evidence map

Each requirement gets one of four states. The UI shows each state as an icon and a text label, never as color alone.

- ● **On resume:** clear evidence on this version
- ◐ **Could be clearer:** evidence is on the resume but the wording is weak or uses a different term
- ◆ **In your bank:** evidence exists in the fact bank but not on this version
- ○ **No evidence yet:** nothing anywhere, so the app shows gap options

| # | Requirement | Type | State | Evidence | Action |
|---|---|---|---|---|---|
| R1 | Python or Java | Required | ● | E1, P3, P4 | none needed |
| R2 | REST APIs | Required | ◐ | P1 says "made a web app"; P1.a has the detail | S-1 |
| R3 | SQL / relational DBs | Required | ● | P1, P4 | none needed |
| R4 | Automated tests | Required | ● | P1.b | S-8 (adds pytest to skills) |
| R5 | Git + merge request review (GitLab) | Required | ◐ | Git listed; P1.d and C4 have the review detail; GitHub ≈ GitLab | S-6 |
| R6 | Explain technical ideas | Required | ◐ | E1 says "helped students" | S-4 |
| R7 | Docker | Nice | ● | P1.e | none needed |
| R8 | CI/CD (GitLab CI) | Nice | ◐ | GitHub Actions is equivalent | S-3 |
| R9 | React | Nice | ◆ | P5 hackathon | S-5 |
| R10 | AWS / cloud | Nice | ○ | — | Gap G-1 |
| R11 | Kubernetes | Nice | ○ | — | Gap G-2 |

**Summary line on screen:** "All 6 required items have evidence. 5 could be shown more clearly, 1 is in your bank, 2 are things to explore."
It is framed as next steps, with no percentage, and it starts with what Jordan already has (P2, P4 in the research).

---

## 5. Suggestions (review cards)

Each card shows: the requirement, the source fact(s), current text, suggested text, why it helps, a flag if there is one, and Accept / Edit / Skip.

**Risk** decides batch behavior. Only *low* cards with no flag can be accepted with "Accept all low-risk." Flagged cards always need their own decision, and accepting one asks: "Could you explain this in an interview?"

| ID | Req | Source | Current | Suggested | Why | Flag | Risk |
|---|---|---|---|---|---|---|---|
| S-1 | R2 | P1.a | "Made a web app for campus club events using Flask" | "Built REST endpoints in Flask for club event listings and RSVPs" | The posting requires REST APIs; your bank says you wrote these endpoints. | none | normal |
| S-2 | R6 | P1, P1.a | "Worked with 3 other students on group project" | "**Led** a team of 4 students to build ClubHub" | Teamwork and ownership signal. | ⚠ **Stronger than your facts:** P1 says you owned the backend but were not the lead. Safer option: "Owned the backend in a 4-person team" | normal |
| S-3 | R8 | P1.c | "Set up GitHub Actions workflow to run tests on every push" | "Set up a CI pipeline (GitHub Actions) that runs the test suite on every push" | The posting says "CI/CD." GitHub Actions and GitLab CI do the same job, so you don't need to name GitLab. | none | low |
| S-4 | R6 | E1 | "Helped students in office hours" | "Explained Python and debugging to about 30 students a week in office hours" | Shows you explain technical ideas; the number comes from E1. | none | normal |
| S-5 | R9 | P5 | Pathfinder Visualizer project block | Swap in **StudySpot**: "Built a React map view of open study rooms and connected it to a Flask API (24-hour hackathon, team of 3)" | React is nice-to-have; Pathfinder doesn't match anything in this posting. Swapping keeps the resume on one page. | ◆ from bank | normal |
| S-6 | R5 | P1.d, C4 | (no bullet) | Add to ClubHub: "Reviewed teammates' pull requests before merge" | Required: code review through merge requests. Pull requests are GitHub's name for the same thing. | ◆ from bank | normal |
| S-7 | R1 | P3 | "Pulled the city transit feed and texted riders when their bus was five minutes away" | "Built a Python service that sent real-time bus alerts to **hundreds of riders**" | Shows scale. | ⚠ **Number not in your facts:** P3 says 6 users. Safer option: "Built a Python service using the Twilio API to text bus arrival alerts" | normal |
| S-8 | R2, R8 | P1, P1.a | Skills line | "Tools: Git, GitHub Actions (CI/CD), Docker, PostgreSQL, Linux, Flask, REST APIs" | Matches posting terms, and each one has a fact behind it. | none | low |
| S-9 | R10 | P1.f | (no bullet) | Add to ClubHub: "Deployed the app to AWS EC2 using Docker Compose" | Only appears after the chat in section 7 creates P1.f. | ◆ from bank | normal |

| S-10 | R4 | P1 | "Wrote unit tests for the backend" | "Wrote **[number]** unit tests covering the Flask backend's API endpoints" | A count is easier to discuss in an interview. Accept stays blocked until the placeholder is filled in or removed. | none | normal |

**Kinds and truth checks.** S-3 and S-8 are **Wording only**; only these can be accepted in bulk. Every other card is **Adds detail**. Unflagged "Adds detail" cards (S-1, S-4, S-5, S-6, S-9) carry a yes/no question that must be ticked before Accept works, for example S-6: "Did you review teammates' pull requests on ClubHub?" Confirmed answers, filled-in placeholders and flags the user kept are listed under **Be ready to explain** on the Summary.

**Make room (one-page fit).** The resume is measured on a fixed Letter-size page (12px ≈ 11pt type, 0.5in margins). The master fits with about 2 lines to spare and the screen says "You're good." Accepting every suggestion except the StudySpot swap still fits; adding the AWS line from the chat (S-9) pushes it over by about 1 line, which is when **Make room** appears. Hiding one line brings it back to "You're good." Lines the user can hide from this copy only: a4 soccer captain, a3 volunteer tutor, e2b2 password resets, e2b3 issue logging, p2b2 animation speed.

S-2 and S-7 are the deliberate traps for usability testing: the "supported → led" case from P5's concept probe and an invented metric. We can measure whether participants catch them.

---

## 6. Gaps (○ no evidence)

The three options are always the same: **Reframe a related skill · Add a real experience · Plan to learn it.** Gaps never produce a suggestion card unless the user adds a fact.

| ID | Req | Reframe | Add experience | Learn |
|---|---|---|---|---|
| G-1 | AWS / cloud | Nothing equivalent. GitHub Pages is hosting, not cloud, and the app says so instead of stretching it. | Opens chat (see section 7) | "Deploy ClubHub to an AWS free-tier EC2 instance" (about a weekend; reuses your Docker setup) |
| G-2 | Kubernetes | Related but **not equivalent**: you use Docker (P1.e). The app keeps the Docker bullet and does not claim Kubernetes. | Opens chat | "Run ClubHub's Docker containers on minikube" |

"Plan to learn" items go to a learning list in Profile. They never go onto the resume.

---

## 7. Chat demo script (adding a fact)

Jordan selects **R10 AWS** and clicks *Add a real experience*.

> **Jordan:** We actually put ClubHub on AWS for our final demo.
> **ResumeLens:** Got it. What did you do yourself: launch the server, set up the database, or something else? And how long did it run?
> **Jordan:** I launched an EC2 instance and ran our Docker Compose setup on it. It was up for about two weeks.
> **ResumeLens:** Saved to your bank as **P1.f: Deployed ClubHub on AWS EC2 with Docker Compose (about 2 weeks, for final demo)**. R10 is now ◆. Here's a suggestion based on it ↓
> *(new card)* Add to ClubHub: "Deployed the app to AWS EC2 using Docker Compose"

The chat produced exactly two things, a fact and a card. It never edits the resume directly.

---

## 8. Applications (outcome log)

| Company | Role | Applied | Version sent | Status |
|---|---|---|---|---|
| Harbor Analytics | Data Engineering Intern | Sep 12, 2026 | Master | Rejected |
| Kestrel Systems | Backend Intern | Sep 28, 2026 | Backend | **Interview** |
| Brightline Software | SWE Intern | Oct 15, 2026 | Master | No reply (prompt: "It's been 5 weeks. Any update?") |
| Lumen Labs | SWE Intern | — | *Lumen Labs copy (in progress)* | Draft |

**Per-version view:** "Backend: 1 sent, 1 interview · Master: 2 sent, 0 interviews."
Caption: "Based on 3 applications. This is a record of what happened, not a prediction."

---

## 9. Open items for the team

- [ ] Are the `BANK ONLY` facts realistic for Jordan?
- [ ] Is the Lumen Labs posting realistic? Should it have more or fewer requirements?
- [ ] Do we want a second, harder posting (an ML role with weak fit) to test the low-coverage framing?
- [ ] Usability tasks to draft from this: (1) review all cards, (2) handle the AWS gap, (3) find which version got an interview.
