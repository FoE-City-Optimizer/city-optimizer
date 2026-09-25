# Local development

Use Node 24, pnpm 11, Python 3.12 or 3.13, and uv. At the root run `pnpm install --frozen-lockfile` and `pnpm check`. For Python run `cd services/solver`, `uv sync --locked`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, and `uv run pytest`. All current TypeScript components are compilation shells; they do not start servers or browser extensions. Install toolchains from their official distributors. Do not add credentials to the repository.

## Network troubleshooting on Windows

If pnpm reports registry `ECONNREFUSED` or `gh` reports a failed login, inspect the current shell's proxy and offline settings before changing dependencies or GitHub credentials:

```powershell
Get-ChildItem Env: |
  Where-Object Name -Match 'PROXY|NPM_CONFIG_OFFLINE' |
  Select-Object Name, @{Name='BlockedLoopbackProxy'; Expression={$_.Value -eq 'http://127.0.0.1:9'}},
    @{Name='Offline'; Expression={$_.Name -eq 'NPM_CONFIG_OFFLINE' -and $_.Value -eq 'true'}}
```

A proxy pointing to `127.0.0.1:9` refuses connections, and `NPM_CONFIG_OFFLINE=true` prevents downloading packages absent from the pnpm store. When those values were injected into an agent shell and direct network access is available, clear them **in that shell only**, then retry:

```powershell
'HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','GIT_HTTP_PROXY','GIT_HTTPS_PROXY','NPM_CONFIG_OFFLINE' |
  ForEach-Object { Remove-Item "Env:$_" -ErrorAction SilentlyContinue }
pnpm install --frozen-lockfile
gh auth status
```

Do not clear a real corporate proxy. Test `gh api rate_limit` after clearing a broken proxy; an authentication error after that test may require `gh auth refresh`.
