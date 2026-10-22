# Change Proposal: Samagra 1000 — A Complete Python Coding & Scholarship Platform

## Why
Samagra, in partnership with ANNAM.AI Foundation (IIT Ropar) and Vicharanashala Lab for Education Design, requires a transparent, rigorous, and automated platform to discover and qualify motivated students for free seats in the Samagra AI Crafting Program. Rather than relying on subjective interviews or arbitrary winner limits, the platform empowers students to earn their qualification through verifiable problem-solving effort across exactly 1,000 structured Python challenges.

## What
A full-stack, production-grade web application featuring:
1. **Public Landing Page**: Explaining the challenge, 1,000 questions structure, ₹1,000 assigned educational challenge value (free participation), how it works, and live leaderboard preview.
2. **Sequential Question Progression**: Exactly 1,000 questions (300 Easy, 400 Medium, 300 Hard) divided into stages, unlocking sequentially upon verified completion.
3. **Monaco Python Workspace**: Browser-based coding environment with separate "Run" (public tests) and "Submit" (private test suite).
4. **Isolated Code Judge Engine**: Sandboxed execution preventing arbitrary host destruction, enforcing time and memory bounds, and isolating private test cases from client exposure.
5. **Deterministic Leaderboard**: Real-time all-time and weekly leaderboards with transparent tie-breaking rules.
6. **Student Dashboard & Milestones**: Granular progress tracking across difficulty tiers and milestone achievements.
7. **Automatic Scholarship Qualification**: Atomic, idempotent qualification triggering when a student verifies all 1,000 required completions, generating an authoritative qualification reference code.
8. **Protected Administrator Dashboard**: Platform analytics, question bank validation, and submission audit trail.

## Impact
- **Students**: Equitable, transparent qualification path without hidden fees or subjective barriers.
- **Instructors/Admins**: Auditable, automated assessment of authentic programming proficiency.
