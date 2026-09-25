# ADR-013: Extension framework choice

**Status:** Proposed

## Context

Choose after a minimal read-only collector spike and browser compatibility evidence. The 2026-09-25 M1 evidence review narrows the initial delivery target to Google Chrome; Firefox and other Chromium browsers require separate live verification before support is claimed.

## Decision / proposal

Compare raw WebExtensions with a framework for the verified Google Chrome path, including exact-field projection, document-start timing, minimum permissions, and the untrusted page-message boundary. Preserve a documented route to later Firefox and other Chromium research. This record remains Proposed; the research probe does not choose a framework or approve a production collector.

## Consequences and next evidence

Keep implementation within this scope. Any unspecified framework, schema detail, or operational choice requires evidence and a scoped Issue before acceptance. See the [charter](../project/project-charter.md).

