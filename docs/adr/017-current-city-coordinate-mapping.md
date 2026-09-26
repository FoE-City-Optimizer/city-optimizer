# ADR-017: Current-city coordinate mapping

**Status:** Accepted, 2026-09-26, by owner decision during [#48](https://github.com/FoE-City-Optimizer/city-optimizer/issues/48). **Evidence:** [#43 owner-matched candidate](../research/issue-43-edge-coordinate-proof.md), [#24 reviewed replay](../research/issue-24-real-city-fixture.md).

## Context

The #24 replay preserves the presence of every selected coordinate field. Exactly 21 ordinary instances and 21 unlocked rectangles omit one axis. The #43 zero-axis candidate places all 399 ordinary instances and 234 rectangles without overlap or outside occupancy, leaves all 124 roads unchanged, and matched the owner's live-city visual check. The game serializer was not independently inspected, and the 20 special/off-grid entries have only aggregate data.

## Decision

For the exact reviewed #24 current-city source variant, an omitted `x` or `y` on an ordinary placed instance or unlocked rectangle maps to grid coordinate **zero**. An explicit zero remains explicit; the source field-presence bit must survive derivation. Coordinates are integer city-grid cells with x increasing right/east and y increasing down/south in the owner-matched view. Rectangles use source `width` along x and `length` along y; generic definitions use `sizeX`/`sizeY` correspondingly. A new omission pattern, missing or invalid value on a previously explicit axis, different source fingerprint, unresolved definition, or unsupported class must fail closed.

The rule does **not** assign meaning to blocked-position records, even if they omit an axis. They remain source-presence diagnostics. It does not establish road demand, Town Hall identity beyond the reviewed candidate, special-building eligibility, solver validity, or an optimality claim. It is not a universal FoE serializer guarantee.

## Consequences

Issue #48 may derive the complete reviewed ordinary geometry and test the exact 399/234/124/419 reconciliation. A different capture, city, or source variant needs a separate compatibility review before it uses this rule. [ADR-016](016-snapshot-authority.md) governs project-owned wire shapes; this decision does not finalize Canonical City Snapshot v1.
