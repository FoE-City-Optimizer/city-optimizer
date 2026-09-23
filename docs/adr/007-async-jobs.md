# ADR-007: Asynchronous long-running jobs

**Status:** Accepted

## Context

Hours may be acceptable; synchronous long HTTP requests are not the intended shape.

## Decision / proposal

Run optimization as cancellable backend jobs; expose explicit progress and proof status.

## Consequences and next evidence

Keep implementation within this scope. Any unspecified framework, schema detail, or operational choice requires evidence and a scoped Issue before acceptance. See the [charter](../project/project-charter.md).
