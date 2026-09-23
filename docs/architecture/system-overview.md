# System overview

The planned flow is Forge of Empires → read-only extension → versioned Canonical City Snapshot → API and job queue → optimization worker → result → planner web app. Long jobs run asynchronously. The player performs every in-game action manually. This is a planned architecture, not a deployed system. See the [charter](../project/project-charter.md) and [ADR index](../adr/README.md).
