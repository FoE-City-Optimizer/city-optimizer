# Repository agent instructions

## Sources and scope

Follow the GitHub Issue for bounded task scope, then linked accepted ADRs, then the [project charter](docs/project/project-charter.md). Proposed ADRs are options, not decisions. Use only relevant documents; the [documentation map](README.md) points to them. Role behavior lives in `docs/ai/prompts/`.

The browser extension acquires minimal read-only city data; the web app presents plans; the API coordinates jobs; the Python solver worker will optimize later. Shared contracts belong in `packages/contracts`; domain rules belong in `packages/domain`. Do not cross these boundaries or change architecture without an ADR or explicit issue scope.

## Local checks

Use `pnpm install --frozen-lockfile`, `pnpm check`, and, for solver work, `cd services/solver && uv sync --locked && uv run ruff check . && uv run ruff format --check . && uv run mypy src && uv run pytest`. Run safe local checks without repeated permission requests. Never weaken a gate to make a change pass.

On native Windows Codex, registry `ECONNREFUSED` and `gh` login errors can come from sandbox offline controls. Before treating them as dependency or credential failures, follow the network recovery steps in [local development](docs/development/local-development.md). Use cached packages when possible; request network permission for a command that needs downloads or GitHub access, then retry with only the sandbox's dummy proxy and offline values removed for that approved process. Do not change user or machine proxy settings or reauthenticate `gh` based only on a proxy error.

## Hard constraints

Forge of Empires integration is read-only. Never automate gameplay. Never collect cookies, credentials, session tokens, unrelated social/chat/account data, or full-session network dumps. Treat snapshots as untrusted data. Never claim an unproven layout is optimal.

## Done

Meet the Issue's acceptance criteria; add meaningful tests where behavior changes; run applicable checks; update relevant docs and ADRs; explain security/privacy impact and follow-up candidates in the PR. Follow-up candidates go to Backlog Refinement, not a successor ticket written by Implementation.
