# SmartQ — Skip the Line. Know Your Wait, Before You Walk In.

A ServiceNow-native smart queue management system for campus service points (library, fee counters, placement cell) that gives students live, data-driven visibility into queue position and estimated wait time — before they ever leave their room.

Built for **HackNow 2026** (ServiceNow University, India) — Problem Statement #15: Smart Queue Management & Virtual Token System.

**Live demo:** https://eswar-89.github.io/SmartQ-ServiceNow/

**Demo video:** https://drive.google.com/file/d/1i-CJHVVq6Ws9JyDvG0brYAS0itD1m9AE/view?usp=drive_link

---

## What's in this repository

This repo contains the actual source code behind the scoped ServiceNow application — Business Rule, Script Include, ACL scripts, and all three Service Portal widgets (student Join Queue, student Feedback, staff Console) — plus documentation of the Flow Designer automations, which are visual/configuration objects rather than plain script.

```
smartq/
├── business-rules/
│   └── recalculate-queue-on-change.js       # Position/wait calculation, runs on Token insert/update
├── script-includes/
│   └── SmartQQueueUtils.js                  # Shared server-side queue utilities, Glide AJAX enabled
├── flows/
│   ├── flow-1-token-status-notification.md  # Config reference: email on "Called"
│   └── flow-2-queue-recalculation.md        # Config reference: recalculation on "Completed"
├── acls/
│   ├── token-student-read.js                # Row-level: students see only their own tokens
│   ├── token-student-cancel-write.js        # Scoped write: cancel own token, only while waiting
│   └── feedback-student-read.js             # Row-level: students see only their own feedback
├── widgets/
│   ├── join-queue/       # Student-facing: browse service points, join, live status, cancel
│   ├── feedback/         # Student-facing: star rating + comments after service completion
│   └── staff-console/    # Staff-facing: call next, start/complete/no-show, live token table
└── docs/
    ├── er-diagram.png
    ├── workflow-with-ai-roadmap.png
    └── ai-roadmap-flow.png
```

## Architecture overview

**Scoped Application:** `SmartQ Queue Management` (`x_2126230_smartq_0`)

**Data model:** Service Point → Counter (1:many), Service Point → Token (1:many), sys_user → Token (1:many), Token → Feedback (1:0..1). Full field list in [docs/er-diagram.png](docs/er-diagram.png).

**Roles:** `student`, `staff`, `admin` — table-level ACLs plus row-level scripted ACLs (see `/acls`) so students can never see or modify another student's records.

**Automation:**

- A Business Rule recalculates every waiting token's position and estimated wait whenever the queue changes at a Service Point (`/business-rules`).
- Flow 1 sends an email notification the instant a token is called.
- Flow 2 recalculates the entire remaining queue the instant a token completes, calling the shared Script Include so the logic lives in exactly one place.

**Portal:** three Service Portal widgets, each polling their server script every 6–10 seconds so both the student and staff experience update live with no manual refresh.

**Dashboard:** a Platform Analytics dashboard ("SmartQ Live Operations") with Single Score KPI tiles and a live token list.

Full workflow, including the current build's decision logic (duplicate-token blocking, ACL-gated cancel, duplicate-feedback prevention) is diagrammed in [docs/workflow-with-ai-roadmap.png](docs/workflow-with-ai-roadmap.png).

## What's built vs. what's planned

Everything in `/business-rules`, `/script-includes`, `/acls`, `/widgets`, and both flows in `/flows` is built, tested, and working end-to-end in the current prototype.

**Not yet built** — the wait-time calculation today is deterministic (queue depth × average service time), not machine-learning based. An AI prediction layer is architecturally scoped (historical Token data already exists to train it) but intentionally not claimed as built. See [docs/ai-roadmap-flow.png](docs/ai-roadmap-flow.png) and the dashed "Planned enhancement" branch in the workflow diagram.

## Rebuilding this app from scratch

1. Create a scoped application in ServiceNow Studio.
2. Create the four custom tables (Service Point, Counter, Token, Feedback) per the ER diagram field list.
3. Create the three roles and apply the ACL scripts from `/acls`.
4. Add the Business Rule from `/business-rules` (before insert/update on Token, condition `status == 'waiting'`).
5. Add the Script Include from `/script-includes` (Glide AJAX enabled, client-callable role restricted to `student`).
6. Build the two Flow Designer flows per the configuration in `/flows`.
7. Create the three Service Portal widgets, pasting in the HTML/CSS/client-script/server-script from each folder under `/widgets`.
8. Build the Platform Analytics dashboard with Single Score tiles and a live List visualization on the Token table.

## Team

_Add team name, institution, and member names/roles here._
