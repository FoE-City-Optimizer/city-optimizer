# AI engineering operating model

Use Evidence → Planning → Refinement → Implementation → Review → Verification/Security → Merge, with the role prompts in [docs/ai/prompts](../ai/prompts/README.md). Each implementation Issue is a bounded contract with explicit acceptance criteria, tests, dependencies, and privacy impact. The Implementation Agent reports structured **Follow-up Candidates**; Backlog Refinement decides whether to create and write successor Issues. No role bypasses PR review, CI, ADR governance, or security rules. Read `AGENTS.md`, one role prompt, the Issue, and only linked references relevant to the task.

Candidate format: **Observation; Evidence; Impact; Suggested owner/role; Dependency; Urgency.**
