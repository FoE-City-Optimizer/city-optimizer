# Forge of Empires City Optimizer

**Status: repository foundation, before MVP.** This project will plan a rearrangement of an existing Forge of Empires main city that minimizes road tiles while preserving connectivity and other verified constraints. It will distinguish proven optimal solutions from feasible best-known results.

The intended system has a read-only browser extension, a planner web app, an API/job coordinator, and a backend optimization worker. It will never move, sell, buy, or place anything in the game; the player applies a plan manually.

## Repository map

| Path                                                                           | Purpose                                                              |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `apps/extension`, `apps/web`, `apps/api`                                       | TypeScript component shells                                          |
| `packages/contracts`, `packages/domain`, `packages/config`, `packages/testing` | Shared TypeScript boundaries                                         |
| `services/solver`                                                              | Python worker shell                                                  |
| `docs/`                                                                        | Architecture, domain, security, development, ADRs, research, backlog |
| `tests/fixtures`, `tests/benchmarks`, `infra/`                                 | Future shared test data, benchmarks, deployment definitions          |

## Setup and checks

Use Node 24 and pnpm 11. Run `pnpm install --frozen-lockfile`, then `pnpm check`. For the Python shell, install uv, then run `cd services/solver`, `uv sync --locked`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv run pytest`. No service or infrastructure is needed for bootstrap checks. See [local development](docs/development/local-development.md).

## Project guidance

Read the [charter](docs/project/project-charter.md), [ADR index](docs/adr/README.md), and [AI operating model](docs/development/ai-engineering-operating-model.md). [Contribution guidance](CONTRIBUTING.md) and [security policy](SECURITY.md) apply to every change.
