# Testing strategy

Current CI checks formatting, lint, TypeScript types/build, and a Python package import smoke test. Future behavior requires unit and contract tests at trust boundaries, an exhaustive tiny-instance oracle for solver correctness, property tests for occupancy/connectivity, sanitized golden fixtures, and a non-PR benchmark corpus. A solver result is valid only after independent constraint checking. Heavy benchmarks should run separately from ordinary PR checks. See [charter](../project/project-charter.md#23-testing-strategy).
