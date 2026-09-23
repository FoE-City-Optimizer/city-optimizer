# Local development

Use Node 24, pnpm 11, Python 3.12 or 3.13, and uv. At the root run `pnpm install --frozen-lockfile` and `pnpm check`. For Python run `cd services/solver`, `uv sync --locked`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv run pytest`. All current TypeScript components are compilation shells; they do not start servers or browser extensions. Install toolchains from their official distributors. Do not add credentials to the repository.
