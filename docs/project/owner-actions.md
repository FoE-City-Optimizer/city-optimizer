# Owner actions and settings audit

- [ ] Configure `main` ruleset or branch protection to require PR review and passing CI, block force pushes and deletion, and restrict direct pushes. The branch-protection API returned `404 Branch not protected` at bootstrap.
- [ ] After CI first runs, select its actual job names as required status checks.
- [ ] Enable the Dependency graph, Dependabot alerts/security updates, secret scanning, push protection, and private vulnerability reporting where available. The repository API reported Dependabot security updates and secret scanning/push protection disabled at bootstrap; private reporting was not verified. The first PR's Dependency Review check failed because the Dependency graph is disabled.
- [ ] Inspect the existing Project auto-add filter and saved views, decide whether Discovery needs a distinct Status or `Backlog` is sufficient, and decide whether private Project visibility is intended alongside the public repository. Auto-add was enabled and the five bootstrap Issues appeared, but the rule filter was not verified.
- [ ] Decide whether `Priority` and `Effort` need options, and whether existing `Size`/`Estimate` should be the effort measure.
- [ ] Decide milestones to create and assign; none existed at bootstrap.
- [ ] Approve the final license in ADR-009 before first public release.
- [ ] Add CODEOWNERS only after confirming maintainership and review policy; the context names `maciej-witkowski`, but review routing is an owner setting decision.
