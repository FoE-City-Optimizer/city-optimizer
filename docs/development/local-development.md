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

A proxy pointing to `127.0.0.1:9` refuses connections, and `NPM_CONFIG_OFFLINE=true` prevents downloading packages absent from the pnpm store. In Codex's native Windows `unelevated` sandbox, these are process-level offline controls and return in each new session. First try `pnpm install --frozen-lockfile --offline` if the store already has the packages. If a network call is required, request network permission for that specific command. Only in the approved command, remove the dummy values from its process environment before retrying:

```powershell
foreach ($name in 'HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','GIT_HTTP_PROXY','GIT_HTTPS_PROXY') {
  if ([Environment]::GetEnvironmentVariable($name) -eq 'http://127.0.0.1:9') {
    Remove-Item "Env:$name"
  }
}
if ($env:NPM_CONFIG_OFFLINE -eq 'true') { Remove-Item Env:NPM_CONFIG_OFFLINE }
pnpm install --frozen-lockfile
gh api rate_limit
```

Use the same approved-command pattern for `gh` operations. Do not clear a real corporate proxy or change user or machine environment variables. If the approved network call still returns an authentication error, check `gh auth status` before considering `gh auth refresh`. If network permission is unavailable, report the blocked operation and continue with local checks. For a persistent Codex setup issue, consult the [Windows sandbox troubleshooting guidance](https://learn.chatgpt.com/docs/windows/windows-sandbox).
