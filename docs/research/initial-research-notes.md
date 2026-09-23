# Initial Research Notes — Forge of Empires Data Acquisition

**Status:** historical discovery input  
**Purpose:** preserve evidence and design observations collected before repository bootstrap.  
**Important:** these notes are not a stable API contract. The first data-acquisition research work in M1 must revalidate current game behavior before production implementation.

## 1. Primary architectural conclusion

A dedicated read-only browser extension is preferred over making FoE Helper JSON export the primary ingestion path.

The extension should:

- observe only the game data required for city optimization,
- convert external game responses through a narrow adapter,
- emit a versioned Canonical City Snapshot,
- avoid retaining raw unrelated payloads,
- never automate gameplay.

A normalization boundary is still necessary because Forge of Empires is an external system whose schema may change. The goal is a small game-data adapter rather than a large post-processing layer over a broad third-party export.

## 2. Prior FoE Helper observations

Prior research of the public FoE Helper implementation indicated:

- current city instances are available from city-map/startup responses,
- unlocked city areas are available separately,
- building metadata includes footprint and street-connection information,
- FoE Helper's exported meta information contains broad metadata that is larger than our optimizer needs.

Observed FoE Helper concepts included:

```text
CityMapData
UnlockedAreas
CityEntities
```

and startup handling corresponding to city entities / unlocked areas / blocked areas.

These observations are useful evidence but must be revalidated against the current game and current extension/browser environment.

## 3. Building metadata observations

Prior public-source inspection indicated that building footprint data may exist through both legacy and component-oriented representations.

Likewise, road/street requirements have appeared in metadata forms corresponding to a required street connection level.

The future canonical domain model should not infer street requirements from current adjacency.

Preferred semantic model:

```text
roadRequirement:
  NONE
  SINGLE
  DOUBLE
```

MVP may support NONE and SINGLE while retaining DOUBLE in the domain contract for forward compatibility.

## 4. City geometry

The solver-facing city representation should be a set/mask of available 1×1 cells.

Source data may arrive as rectangles/expansions, but solver code should not depend directly on expansion concepts.

This supports irregular orthogonal city boundaries.

Optional blocked areas/cells should be representable even if not required by the initial main-city MVP.

## 5. Current roads

Existing road placement is useful for:

- before/after metrics,
- current road tile count,
- later move instructions.

The optimizer itself should be free to construct a new road network rather than treating existing roads as fixed.

## 6. Screenshot approach

Screenshot/computer-vision import is not recommended as the primary v1 source.

It can potentially recover:

- grid geometry,
- building footprints,
- roads,
- city boundary,

but cannot reliably infer semantic road requirements from visual adjacency alone.

It may become a fallback or validation tool later.

## 7. Alternative ingestion methods considered

### FoE Helper JSON

Accurate and useful for fixtures/debugging, but overly broad as the primary product interface.

### HAR / DevTools capture

Potentially accurate but poor UX; useful as research/debug fallback.

### Own passive extension

Preferred product direction.

### Manual input

Fallback/editor only.

## 8. Read-only boundary

The project should remain analytical.

No automatic clicking, placing, moving, selling or otherwise performing gameplay actions.

The product output is a plan that the user manually applies in Forge of Empires.

## 9. Recommended first M1 research target

Before production collector code:

1. verify current main-city network/data sources,
2. capture a sanitized reference fixture,
3. document observed schema,
4. define Canonical City Snapshot v1 from verified evidence,
5. only then implement the collector adapter.

## 10. License note

FoE Helper is AGPL-licensed.

Avoid copying its implementation into this project unless the project deliberately accepts the licensing consequences.

Independent implementation based on externally observed data structures/protocol behavior is the preferred direction.

This is an engineering note, not legal advice.
