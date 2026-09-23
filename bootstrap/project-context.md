# Bootstrap Project Context

This file contains **environment coordinates and owner-controlled facts** needed by the one-time Repository Bootstrap Agent.

It is intentionally small. Do not put secrets, tokens, cookies, passwords or personal credentials here.

## GitHub

Organization:

```text
FoE-City-Optimizer
```

Repository:

```text
city-optimizer
```

Full repository:

```text
FoE-City-Optimizer/city-optimizer
```

Default branch:

```text
main
```

Repository visibility:

```text
public
```

## GitHub Project

Project title:

```text
Forge of Empires City Optimizer — Engineering
```

Project number:

```text
1
```

Project owner:

```text
FoE-City-Optimizer
```

Project already exists:

```text
yes
```

Repository already exists:

```text
yes
```

Codex project/environment already configured:

```text
yes
```

## Existing Project configuration

Fill only what you have actually configured. If unknown, write `unknown` and let the Bootstrap Agent audit it.

Issue Types configured:

```text
Task, Bug, Feature, Epic, Research
```

Project Status values:

```text
Backlog, Needs Refinement, Ready, In Progress, In Review, Blocked, Done
```

Other Project fields:

```text
Priority / Effort / Risk / Workstream | unknown
```

Auto-add workflow configured:

```text
yes
```

Milestones already created:

```text
none
```

## Owner decisions already made

- Project is open source: yes.
- Final license: pending unless explicitly decided elsewhere.
- Forge of Empires integration must be read-only.
- No gameplay automation.
- Browser target for initial release: Chrome/Chromium + Firefox.
- Browser component should focus on data acquisition.
- Optimization should run on backend workers.
- Solver may run for tens of minutes or hours.
- Mathematical optimality is preferred over a short fixed runtime.
- Product must distinguish proven optimum from feasible/best-known.
- MVP optimizes buildings already placed in the city.
- Inventory intelligence is future scope.
- AI-first engineering workflow is required.

## Maintainer identity

Do not infer CODEOWNERS entries.

Primary maintainer GitHub login:

```text
maciej-witkowski
```

If `unknown`, Bootstrap Agent must not create CODEOWNERS with an invented identity.

## Notes for Agent 00

- Use these coordinates; do not create a second repository or Project.
- Audit existing GitHub Project configuration before changing it.
- Preserve existing configuration when compatible.
- If an account/organization setting requires owner action, document the exact step instead of pretending it was configured.
