// Demo scenario: mirrors docs/demo-scenario.md. All people, companies and details are fictional.
import type { Application, Fact, Gap, Requirement, ResumeDoc, Suggestion, Trim, Version } from '../types';

export const RESUME_TEXT = `Jordan Lee
jordan.lee@example.edu | github.com/jordanlee-dev | (555) 010-2233

EDUCATION
B.S. Computer Science, State University | Expected May 2028
- GPA 3.7. Coursework: Data Structures, Operating Systems, Databases, Software Engineering
- Dean's List, Fall 2024 and Spring 2025

EXPERIENCE
Teaching Assistant, CS 101, State University | Jan 2026 – Present
- Helped students in office hours
- Graded weekly programming assignments in Python
- Wrote a short guide to setting up the course development environment
- Held a weekly review session before each exam
IT Help Desk Assistant, University Library | Sep 2024 – Dec 2025
- Answered walk-in and email questions about campus accounts and printing
- Reset passwords and set up lab computers for new semesters
- Logged recurring issues in a shared spreadsheet for the library IT lead

PROJECTS
ClubHub (Flask, PostgreSQL, Docker) | Fall 2025
- Made a web app for campus club events using Flask
- Worked with 3 other students on group project
- Wrote unit tests for the backend
- Set up GitHub Actions workflow to run tests on every push
- Packaged the app with Docker for easy setup
Pathfinder Visualizer (JavaScript) | Spring 2025
- Built an interactive visualizer for BFS, DFS and A* search on a grid
- Added adjustable animation speed and wall drawing
- Deployed on GitHub Pages
Campus Bus Tracker (Python) | Summer 2025
- Pulled the city transit feed and texted riders when their bus was five minutes away
- Cached feed responses to stay under the API's rate limit
Personal Finance Tracker (Java) | Fall 2024
- Wrote a command-line app that categorizes bank CSV exports
- Stored categories in SQLite and added monthly summary reports

ACTIVITIES
- Organized the CS department's game night for 80 students
- Member, Hackathon Club; competed in two campus hackathons
- Volunteer tutor, public library summer reading program
- Captain, intramural soccer team

SKILLS
- Languages: Java, JavaScript, Python, SQL
- Tools: Git, GitHub Actions, Docker, PostgreSQL, Linux`;

// ---------- Master resume ----------
export const MASTER_DOC: ResumeDoc = {
  name: 'Jordan Lee',
  contact: 'jordan.lee@example.edu · github.com/jordanlee-dev · (555) 010-2233',
  sections: [
    {
      id: 'edu',
      title: 'Education',
      entries: [
        {
          id: 'ed1',
          factId: 'ED1',
          title: 'B.S. Computer Science, State University',
          meta: 'Expected May 2028',
          bullets: [
            { id: 'ed1b1', factId: 'ED1', text: 'GPA 3.7. Coursework: Data Structures, Operating Systems, Databases, Software Engineering' },
            { id: 'ed1b2', factId: 'ED1', text: 'Dean’s List, Fall 2024 and Spring 2025' },
          ],
        },
      ],
    },
    {
      id: 'exp',
      title: 'Experience',
      entries: [
        {
          id: 'e1',
          factId: 'E1',
          title: 'Teaching Assistant, CS 101, State University',
          meta: 'Jan 2026 – Present',
          bullets: [
            { id: 'e1b1', factId: 'E1', text: 'Helped students in office hours' },
            { id: 'e1b2', factId: 'E1', text: 'Graded weekly programming assignments in Python' },
            { id: 'e1b3', factId: 'E1', text: 'Wrote a short guide to setting up the course development environment' },
            { id: 'e1b4', factId: 'E1', text: 'Held a weekly review session before each exam' },
          ],
        },
        {
          id: 'e2',
          factId: 'E2',
          title: 'IT Help Desk Assistant, University Library',
          meta: 'Sep 2024 – Dec 2025',
          bullets: [
            { id: 'e2b1', factId: 'E2', text: 'Answered walk-in and email questions about campus accounts and printing' },
            { id: 'e2b2', factId: 'E2', text: 'Reset passwords and set up lab computers for new semesters' },
            { id: 'e2b3', factId: 'E2', text: 'Logged recurring issues in a shared spreadsheet for the library IT lead' },
          ],
        },
      ],
    },
    {
      id: 'proj',
      title: 'Projects',
      entries: [
        {
          id: 'p1',
          factId: 'P1',
          title: 'ClubHub (Flask, PostgreSQL, Docker)',
          meta: 'Fall 2025',
          bullets: [
            { id: 'p1b1', factId: 'P1', text: 'Made a web app for campus club events using Flask' },
            { id: 'p1b2', factId: 'P1', text: 'Worked with 3 other students on group project' },
            { id: 'p1b3', factId: 'P1', text: 'Wrote unit tests for the backend' },
            { id: 'p1b4', factId: 'P1', text: 'Set up GitHub Actions workflow to run tests on every push' },
            { id: 'p1b5', factId: 'P1', text: 'Packaged the app with Docker for easy setup' },
          ],
        },
        {
          id: 'p2',
          factId: 'P2',
          title: 'Pathfinder Visualizer (JavaScript)',
          meta: 'Spring 2025',
          bullets: [
            { id: 'p2b1', factId: 'P2', text: 'Built an interactive visualizer for BFS, DFS and A* search on a grid' },
            { id: 'p2b2', factId: 'P2', text: 'Added adjustable animation speed and wall drawing' },
            { id: 'p2b3', factId: 'P2', text: 'Deployed on GitHub Pages' },
          ],
        },
        {
          id: 'p3',
          factId: 'P3',
          title: 'Campus Bus Tracker (Python)',
          meta: 'Summer 2025',
          bullets: [
            { id: 'p3b1', factId: 'P3', text: 'Pulled the city transit feed and texted riders when their bus was five minutes away' },
            { id: 'p3b2', factId: 'P3', text: 'Cached feed responses to stay under the API’s rate limit' },
          ],
        },
        {
          id: 'p4',
          factId: 'P4',
          title: 'Personal Finance Tracker (Java)',
          meta: 'Fall 2024',
          bullets: [
            { id: 'p4b1', factId: 'P4', text: 'Wrote a command-line app that categorizes bank CSV exports' },
            { id: 'p4b2', factId: 'P4', text: 'Stored categories in SQLite and added monthly summary reports' },
          ],
        },
      ],
    },
    {
      id: 'act',
      title: 'Activities',
      entries: [
        {
          id: 'acts',
          title: '',
          bullets: [
            { id: 'a1', factId: 'A1', text: 'Organized the CS department’s game night for 80 students' },
            { id: 'a2', factId: 'A2', text: 'Member, Hackathon Club; competed in two campus hackathons' },
            { id: 'a3', factId: 'A3', text: 'Volunteer tutor, public library summer reading program' },
            { id: 'a4', factId: 'A4', text: 'Captain, intramural soccer team' },
          ],
        },
      ],
    },
    {
      id: 'skills',
      title: 'Skills',
      entries: [
        {
          id: 'sk',
          title: '',
          bullets: [
            { id: 'sk1', factId: 'K-LANG', text: 'Languages: Java, JavaScript, Python, SQL' },
            { id: 'sk2', factId: 'K-TOOLS', text: 'Tools: Git, GitHub Actions, Docker, PostgreSQL, Linux' },
          ],
        },
      ],
    },
  ],
};

// ---------- Facts parsed from the resume ----------
const skill = (id: string, title: string, meta: string): Fact => ({ id, category: 'skill', title, meta, details: [], origin: 'resume' });

export const PARSED_FACTS: Fact[] = [
  { id: 'ED1', category: 'education', title: 'B.S. Computer Science, State University', meta: 'Expected May 2028', details: ['GPA 3.7', 'Dean’s List, Fall 2024 and Spring 2025'], origin: 'resume' },
  { id: 'C1', category: 'education', parentId: 'ED1', title: 'Course: Data Structures', details: [], origin: 'resume' },
  { id: 'C2', category: 'education', parentId: 'ED1', title: 'Course: Operating Systems', details: [], origin: 'resume' },
  { id: 'C3', category: 'education', parentId: 'ED1', title: 'Course: Databases', details: [], origin: 'resume' },
  { id: 'C4', category: 'education', parentId: 'ED1', title: 'Course: Software Engineering', details: [], origin: 'resume' },
  { id: 'E1', category: 'experience', title: 'Teaching Assistant, CS 101', meta: 'State University · Jan 2026 – Present', details: ['Helped students in office hours', 'Graded weekly programming assignments in Python', 'Wrote a short guide to setting up the course development environment', 'Held a weekly review session before each exam'], origin: 'resume' },
  { id: 'E2', category: 'experience', title: 'IT Help Desk Assistant', meta: 'University Library · Sep 2024 – Dec 2025', details: ['Answered walk-in and email questions about campus accounts and printing', 'Reset passwords and set up lab computers for new semesters', 'Logged recurring issues in a shared spreadsheet for the library IT lead'], origin: 'resume' },
  { id: 'P1', category: 'project', title: 'ClubHub (Flask, PostgreSQL, Docker)', meta: 'Fall 2025', details: ['Made a web app for campus club events using Flask', 'Worked with 3 other students on group project', 'Wrote unit tests for the backend', 'Set up GitHub Actions workflow to run tests on every push', 'Packaged the app with Docker for easy setup'], origin: 'resume' },
  { id: 'P2', category: 'project', title: 'Pathfinder Visualizer (JavaScript)', meta: 'Spring 2025', details: ['Built an interactive visualizer for BFS, DFS and A* search on a grid', 'Added adjustable animation speed and wall drawing', 'Deployed on GitHub Pages'], origin: 'resume' },
  { id: 'P3', category: 'project', title: 'Campus Bus Tracker (Python)', meta: 'Summer 2025', details: ['Pulled the city transit feed and texted riders when their bus was five minutes away', 'Cached feed responses to stay under the API’s rate limit'], origin: 'resume' },
  { id: 'P4', category: 'project', title: 'Personal Finance Tracker (Java)', meta: 'Fall 2024', details: ['Wrote a command-line app that categorizes bank CSV exports', 'Stored categories in SQLite and added monthly summary reports'], origin: 'resume' },
  { id: 'A1', category: 'activity', title: 'Organized CS department game night for 80 students', details: [], origin: 'resume' },
  { id: 'A2', category: 'activity', title: 'Hackathon Club member; competed in two campus hackathons', details: [], origin: 'resume' },
  { id: 'A3', category: 'activity', title: 'Volunteer tutor, public library summer reading program', details: [], origin: 'resume' },
  { id: 'A4', category: 'activity', title: 'Captain, intramural soccer team', details: [], origin: 'resume' },
  skill('K-LANG', 'Languages: Java, JavaScript, Python, SQL', 'Languages'),
  skill('K-TOOLS', 'Tools: Git, GitHub Actions, Docker, PostgreSQL, Linux', 'Tools'),
];

// ---------- Onboarding detail questions ----------
export interface DetailQuestion {
  id: string;
  question: string;
  about: string;
  demoAnswer: string;
  creates: Fact[];
}

export const DETAIL_QUESTIONS: DetailQuestion[] = [
  {
    id: 'Q1',
    about: 'ClubHub',
    question: 'ClubHub: what did you personally build?',
    demoAnswer: 'I owned the backend: the REST endpoints for events and RSVPs. I wasn’t the team lead.',
    creates: [
      { id: 'P1.a', category: 'project', parentId: 'P1', title: 'Owned the ClubHub backend', details: ['Wrote the REST endpoints for event listings and RSVPs', 'Owned the backend; was not the team lead'], origin: 'user' },
    ],
  },
  {
    id: 'Q2',
    about: 'Teaching Assistant',
    question: 'Teaching Assistant: about how many students do you help each week?',
    demoAnswer: 'About 30 in office hours. My setup guide is used by the whole course, ~200 students.',
    creates: [
      { id: 'E1.a', category: 'experience', parentId: 'E1', title: 'Office hours and setup guide reach', details: ['About 30 students a week in office hours, mostly debugging Python', 'Setup guide used by the whole course, about 200 students'], origin: 'user' },
    ],
  },
  {
    id: 'Q3',
    about: 'Campus Bus Tracker',
    question: 'Campus Bus Tracker: how many people used it?',
    demoAnswer: 'Me and 5 friends. It used the Twilio API and ran on a Raspberry Pi.',
    creates: [
      { id: 'P3.a', category: 'project', parentId: 'P3', title: 'Bus Tracker usage and setup', details: ['Used by Jordan and 5 friends', 'Sent texts with the Twilio API', 'Ran on a Raspberry Pi'], origin: 'user' },
    ],
  },
  {
    id: 'Q4',
    about: 'Other projects',
    question: 'Any projects, hackathons or course projects not on your resume?',
    demoAnswer: 'StudySpot at a hackathon (React map + Flask API), and a Unix shell in C for OS class.',
    creates: [
      { id: 'P5', category: 'project', title: 'StudySpot (React, Flask)', meta: 'Spring 2026 · campus hackathon', details: ['24-hour hackathon, team of 3', 'Built the React map view of open study rooms', 'Connected it to a teammate’s Flask API'], origin: 'user' },
      { id: 'C2.a', category: 'education', parentId: 'C2', title: 'Unix shell in C (OS course project)', details: ['Pipes, I/O redirection and background jobs'], origin: 'user' },
    ],
  },
  {
    id: 'Q5',
    about: 'Code review',
    question: 'Did you review code or work through pull requests on any team project?',
    demoAnswer: 'Yes, we reviewed each other’s PRs on ClubHub and in SE class.',
    creates: [
      { id: 'P1.d', category: 'project', parentId: 'P1', title: 'Code review on ClubHub', details: ['Reviewed teammates’ pull requests before merge', 'SE course: every change merged through a reviewed GitHub PR'], origin: 'user' },
    ],
  },
];

export const ALL_DETAIL_FACTS: Fact[] = DETAIL_QUESTIONS.flatMap((q) => q.creates);

export const CHAT_FACT: Fact = {
  id: 'P1.f',
  category: 'project',
  parentId: 'P1',
  title: 'Deployed ClubHub on AWS EC2',
  details: ['Launched an EC2 instance and ran the Docker Compose setup', 'Up for about two weeks for the final demo'],
  origin: 'user',
};

// ---------- Posting ----------
export const POSTING = {
  company: 'Lumen Labs',
  role: 'Software Engineering Intern, Summer 2027',
  link: 'https://jobs.example.com/lumen-labs/swe-intern',
  text: `We're looking for an intern to join our platform team and help build the APIs behind our scheduling product.

Required
- Proficiency in Python or Java
- Experience building REST APIs
- Working knowledge of SQL and relational databases
- Experience writing automated tests
- Comfortable with Git and code review through merge requests (we use GitLab)
- Able to explain technical ideas clearly to teammates

Nice to have
- Docker or other container tools
- CI/CD experience (we use GitLab CI)
- Frontend experience with React
- Exposure to AWS or another cloud provider
- Familiarity with Kubernetes`,
};

export const REQUIREMENTS: Requirement[] = [
  { id: 'R1', short: 'Python or Java', text: 'Proficiency in Python or Java', type: 'required', base: 'on', evidence: ['E1', 'P3', 'P4', 'K-LANG'], resolvedBy: [], note: 'Python in your TA role and Bus Tracker; Java in Finance Tracker.' },
  { id: 'R2', short: 'REST APIs', text: 'Experience building REST APIs', type: 'required', base: 'clearer', evidence: ['P1', 'P1.a'], resolvedBy: ['S-1'], note: 'ClubHub says “made a web app”; your bank says you wrote the REST endpoints.' },
  { id: 'R3', short: 'SQL / relational DBs', text: 'Working knowledge of SQL and relational databases', type: 'required', base: 'on', evidence: ['P1', 'P4', 'K-LANG', 'K-TOOLS'], resolvedBy: [], note: 'PostgreSQL in ClubHub, SQLite in Finance Tracker.' },
  { id: 'R4', short: 'Automated tests', text: 'Experience writing automated tests', type: 'required', base: 'on', evidence: ['P1'], resolvedBy: [], note: 'Unit tests for the ClubHub backend.' },
  { id: 'R5', short: 'Git + code review', text: 'Comfortable with Git and code review through merge requests (we use GitLab)', type: 'required', base: 'clearer', evidence: ['K-TOOLS', 'P1.d'], resolvedBy: ['S-6'], note: 'Git is listed; your bank has PR reviews. GitHub pull requests and GitLab merge requests are the same practice.' },
  { id: 'R6', short: 'Explain technical ideas', text: 'Able to explain technical ideas clearly to teammates', type: 'required', base: 'clearer', evidence: ['E1', 'E1.a', 'P1'], resolvedBy: ['S-4'], note: 'Your TA role shows this, but “helped students” undersells it.' },
  { id: 'R7', short: 'Docker', text: 'Docker or other container tools', type: 'nice', base: 'on', evidence: ['P1', 'K-TOOLS'], resolvedBy: [], note: 'ClubHub is packaged with Docker.' },
  { id: 'R8', short: 'CI/CD', text: 'CI/CD experience (we use GitLab CI)', type: 'nice', base: 'clearer', evidence: ['P1'], resolvedBy: ['S-3', 'S-8'], note: 'GitHub Actions does the same job as GitLab CI; the term “CI/CD” is missing.' },
  { id: 'R9', short: 'React', text: 'Frontend experience with React', type: 'nice', base: 'bank', evidence: ['P5'], resolvedBy: ['S-5'], needs: ['P5'], fallback: 'none', note: 'StudySpot (hackathon) is in your bank but not on this resume.' },
  { id: 'R10', short: 'AWS / cloud', text: 'Exposure to AWS or another cloud provider', type: 'nice', base: 'none', evidence: ['P1.f'], resolvedBy: ['S-9'], unlockedBy: 'P1.f', note: 'Nothing in your resume or bank yet.' },
  { id: 'R11', short: 'Kubernetes', text: 'Familiarity with Kubernetes', type: 'nice', base: 'none', evidence: [], resolvedBy: [], note: 'Nothing in your resume or bank yet.' },
];

export const SUGGESTIONS: Suggestion[] = [
  {
    id: 'S-1', reqIds: ['R2'], sources: ['P1.a'], kind: 'detail', claimCheck: 'Did you write the event and RSVP endpoints yourself?',
    op: { kind: 'replace', bulletId: 'p1b1' },
    current: 'Made a web app for campus club events using Flask',
    suggested: 'Built REST endpoints in Flask for club event listings and RSVPs',
    why: 'The posting requires REST APIs. Your bank says you wrote these endpoints, but the resume only says “made a web app.”',
  },
  {
    id: 'S-2', reqIds: ['R6'], sources: ['P1', 'P1.a'], kind: 'detail',
    op: { kind: 'replace', bulletId: 'p1b2' },
    current: 'Worked with 3 other students on group project',
    suggested: 'Led a team of 4 students to build ClubHub',
    why: 'Shows teamwork and ownership, which supports working with teammates.',
    flag: {
      kind: 'stronger',
      message: '“Led” is stronger than your facts. P1.a says you owned the backend but were not the team lead.',
      saferText: 'Owned the backend in a 4-person team building ClubHub',
    },
  },
  {
    id: 'S-3', reqIds: ['R8'], sources: ['P1'], kind: 'wording',
    op: { kind: 'replace', bulletId: 'p1b4' },
    current: 'Set up GitHub Actions workflow to run tests on every push',
    suggested: 'Set up a CI pipeline (GitHub Actions) that runs the test suite on every push',
    why: 'The posting says “CI/CD.” GitHub Actions and GitLab CI do the same job, so you don’t need to name GitLab.',
  },
  {
    id: 'S-4', reqIds: ['R6'], sources: ['E1.a'], kind: 'detail', claimCheck: 'Do you help about 30 students a week in office hours?',
    op: { kind: 'replace', bulletId: 'e1b1' },
    current: 'Helped students in office hours',
    suggested: 'Explained Python and debugging to about 30 students a week in office hours',
    why: 'Shows you explain technical ideas. The number comes from your own fact E1.a.',
  },
  {
    id: 'S-5', reqIds: ['R9'], sources: ['P5'], kind: 'detail', claimCheck: 'Did you build the React map view yourself?', fromBank: true,
    op: { kind: 'swap', removeEntryId: 'p2', entryTitle: 'StudySpot (React, Flask)', entryMeta: 'Spring 2026', factId: 'P5' },
    current: 'Pathfinder Visualizer (JavaScript): 3 bullets',
    suggested: 'Built a React map view of open study rooms and connected it to a Flask API (24-hour hackathon, team of 3)',
    why: 'React is a nice-to-have, and Pathfinder doesn’t match anything in this posting. Swapping keeps the resume on one page.',
  },
  {
    id: 'S-6', reqIds: ['R5'], sources: ['P1.d'], kind: 'detail', claimCheck: 'Did you review teammates’ pull requests on ClubHub?', fromBank: true,
    op: { kind: 'add', entryId: 'p1' },
    current: '(no bullet yet)',
    suggested: 'Reviewed teammates’ pull requests before merge',
    why: 'Code review through merge requests is required. Pull requests are GitHub’s name for the same thing.',
  },
  {
    id: 'S-7', reqIds: ['R1'], sources: ['P3', 'P3.a'], kind: 'detail',
    op: { kind: 'replace', bulletId: 'p3b1' },
    current: 'Pulled the city transit feed and texted riders when their bus was five minutes away',
    suggested: 'Built a Python service that sent real-time bus alerts to hundreds of riders',
    why: 'Puts Python up front and makes the project easier to scan.',
    flag: {
      kind: 'unsupported',
      message: '“Hundreds of riders” isn’t in your facts. P3.a says 6 people used it.',
      saferText: 'Built a Python service that texted riders bus arrival alerts using the Twilio API',
    },
  },
  {
    id: 'S-8', reqIds: ['R8', 'R2'], sources: ['P1'], kind: 'wording',
    op: { kind: 'replace', bulletId: 'sk2' },
    current: 'Tools: Git, GitHub Actions, Docker, PostgreSQL, Linux',
    suggested: 'Tools: Git, GitHub Actions (CI/CD), Flask, Docker, PostgreSQL, Linux',
    why: 'Uses the posting’s “CI/CD” term and lists Flask, which is already in your ClubHub project. Nothing new is claimed.',
  },
  {
    id: 'S-10', reqIds: ['R4'], sources: ['P1'], kind: 'detail',
    op: { kind: 'replace', bulletId: 'p1b3' },
    current: 'Wrote unit tests for the backend',
    suggested: 'Wrote [number] unit tests covering the Flask backend’s API endpoints',
    why: 'A specific count is easier to talk about in an interview than “unit tests.” Fill in the number only if you know it; otherwise delete that part.',
  },
];

export const CHAT_SUGGESTION: Suggestion = {
  id: 'S-9', reqIds: ['R10'], sources: ['P1.f'], kind: 'detail', claimCheck: 'Did you set up the EC2 instance yourself?', fromBank: true,
  op: { kind: 'add', entryId: 'p1' },
  current: '(no bullet yet)',
  suggested: 'Deployed the app to AWS EC2 using Docker Compose',
  why: 'AWS is a nice-to-have. You just told us you did this; it’s now fact P1.f.',
};

export const GAPS: Gap[] = [
  { reqId: 'R9', reframe: { possible: true, text: 'JavaScript (Pathfinder) is related but isn’t React. Keep it as JavaScript rather than calling it React.' }, learn: 'Rebuild the Pathfinder UI as a small React app' },
  { reqId: 'R10', reframe: { possible: false, text: 'Nothing equivalent. GitHub Pages is static hosting, not a cloud provider, so we won’t stretch it.' }, learn: 'Deploy ClubHub to an AWS free-tier EC2 instance (about a weekend; reuses your Docker setup)' },
  { reqId: 'R11', reframe: { possible: true, text: 'Related but not equivalent: you use Docker (ClubHub). Keep the Docker bullet; don’t claim Kubernetes.' }, learn: 'Run ClubHub’s Docker containers on minikube' },
];

// Lines that earn the least space for this posting (hide from this copy only)
export const TRIMS: Trim[] = [
  { bulletId: 'a4', reason: 'Doesn’t relate to any requirement in this posting.' },
  { bulletId: 'a3', reason: 'Doesn’t relate to this posting; your TA role already shows teaching.' },
  { bulletId: 'e2b2', reason: 'Help-desk tasks don’t map to this role; the other bullets keep the job visible.' },
  { bulletId: 'e2b3', reason: 'Admin task that doesn’t map to this role.' },
  { bulletId: 'p2b2', reason: 'Feature detail on a project that doesn’t match this posting.' },
];

// ---------- Returning-user extras ----------
export const BACKEND_VERSION: Version = {
  id: 'v-backend',
  name: 'Backend',
  kind: 'role',
  note: 'ClubHub first, Pathfinder removed',
  doc: {
    ...MASTER_DOC,
    sections: MASTER_DOC.sections.map((s) => (s.id === 'proj' ? { ...s, entries: s.entries.filter((e) => e.id !== 'p2') } : s)),
  },
};

export const PAST_APPLICATIONS: Application[] = [
  { id: 'app1', company: 'Harbor Analytics', role: 'Data Engineering Intern', date: '2026-09-12', versionName: 'Master', status: 'rejected' },
  { id: 'app2', company: 'Kestrel Systems', role: 'Backend Intern', date: '2026-09-28', versionName: 'Backend', status: 'interview' },
  { id: 'app3', company: 'Brightline Software', role: 'SWE Intern', date: '2026-10-15', versionName: 'Master', status: 'no-reply' },
];
