"use strict";

(() => {
  const ORIGIN = "https://pl4.forgeofempires.com";
  const TYPE = "foe40/summary";
  if (
    location.origin !== ORIGIN ||
    !location.pathname.startsWith("/game/") ||
    window !== window.top
  )
    return;

  const knownClasses = new Set([
    "generic_building",
    "greatbuilding",
    "main_building",
    "military",
    "street",
    "hub_main",
    "hub_part",
    "friends_tavern",
    "off_grid",
    "outpost_ship",
  ]);
  const own = (item, name) => Object.hasOwn(item, name);
  const safeKey = (value) =>
    (typeof value === "string" && value.length > 0 && value.length <= 128) ||
    (typeof value === "number" && Number.isSafeInteger(value));
  let startupIds = null;
  let emitted = 0;

  function message(event) {
    if (emitted >= 32) return;
    emitted++;
    window.postMessage({ type: TYPE, version: 1, ...event }, ORIGIN);
  }
  function validPosition(item) {
    return (
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      (!own(item, "x") || Number.isSafeInteger(item.x)) &&
      (!own(item, "y") || Number.isSafeInteger(item.y))
    );
  }
  function summarizeStartup(city) {
    startupIds = null;
    if (
      !city ||
      typeof city !== "object" ||
      !Array.isArray(city.entities) ||
      !Array.isArray(city.unlocked_areas) ||
      !Array.isArray(city.blocked_areas) ||
      city.entities.length > 10000 ||
      city.unlocked_areas.length > 10000 ||
      city.blocked_areas.length > 10000
    ) {
      message({
        source: "startup",
        state: "unsupported",
        reason: "shape",
        entities: 0,
        roads: 0,
        areas: 0,
        blocked: 0,
        missingEntityPosition: 0,
        missingAreaPosition: 0,
        missingBlockedPosition: 0,
        updateEntries: 0,
        changedPositions: 0,
      });
      return;
    }
    const ids = new Map();
    let roads = 0;
    let missingEntityPosition = 0;
    for (const entity of city.entities) {
      if (
        !validPosition(entity) ||
        !safeKey(entity.id) ||
        !knownClasses.has(entity.type) ||
        !safeKey(entity.cityentity_id) ||
        ids.has(String(entity.id))
      ) {
        message({
          source: "startup",
          state: "unsupported",
          reason: "entity",
          entities: 0,
          roads: 0,
          areas: 0,
          blocked: 0,
          missingEntityPosition: 0,
          missingAreaPosition: 0,
          missingBlockedPosition: 0,
          updateEntries: 0,
          changedPositions: 0,
        });
        return;
      }
      ids.set(String(entity.id), {
        type: entity.type,
        entity: String(entity.cityentity_id),
        xPresent: own(entity, "x"),
        x: own(entity, "x") ? entity.x : null,
        yPresent: own(entity, "y"),
        y: own(entity, "y") ? entity.y : null,
      });
      roads += entity.type === "street" ? 1 : 0;
      missingEntityPosition += !own(entity, "x") || !own(entity, "y") ? 1 : 0;
    }
    for (const area of city.unlocked_areas)
      if (
        !validPosition(area) ||
        !Number.isSafeInteger(area.width) ||
        area.width <= 0 ||
        !Number.isSafeInteger(area.length) ||
        area.length <= 0
      ) {
        message({
          source: "startup",
          state: "unsupported",
          reason: "area",
          entities: 0,
          roads: 0,
          areas: 0,
          blocked: 0,
          missingEntityPosition: 0,
          missingAreaPosition: 0,
          missingBlockedPosition: 0,
          updateEntries: 0,
          changedPositions: 0,
        });
        return;
      }
    if (!city.blocked_areas.every(validPosition)) {
      message({
        source: "startup",
        state: "unsupported",
        reason: "blocked",
        entities: 0,
        roads: 0,
        areas: 0,
        blocked: 0,
        missingEntityPosition: 0,
        missingAreaPosition: 0,
        missingBlockedPosition: 0,
        updateEntries: 0,
        changedPositions: 0,
      });
      return;
    }
    startupIds = ids;
    message({
      source: "startup",
      state: "partial",
      reason: "definitions-unobserved",
      entities: city.entities.length,
      roads,
      areas: city.unlocked_areas.length,
      blocked: city.blocked_areas.length,
      missingEntityPosition,
      missingAreaPosition: city.unlocked_areas.filter(
        (area) => !own(area, "x") || !own(area, "y"),
      ).length,
      missingBlockedPosition: city.blocked_areas.filter(
        (area) => !own(area, "x") || !own(area, "y"),
      ).length,
      updateEntries: 0,
      changedPositions: 0,
    });
  }
  function summarizeMove(rows) {
    if (
      !Array.isArray(rows) ||
      rows.length > 10000 ||
      !rows.every(
        (row) =>
          validPosition(row) &&
          safeKey(row.id) &&
          knownClasses.has(row.type) &&
          safeKey(row.cityentity_id),
      )
    ) {
      message({
        source: "move",
        state: "unsupported",
        reason: "shape",
        entities: 0,
        roads: 0,
        areas: 0,
        blocked: 0,
        missingEntityPosition: 0,
        missingAreaPosition: 0,
        missingBlockedPosition: 0,
        updateEntries: 0,
        changedPositions: 0,
      });
      return;
    }
    if (!startupIds) {
      message({
        source: "move",
        state: "stale",
        reason: "no-startup",
        entities: 0,
        roads: 0,
        areas: 0,
        blocked: 0,
        missingEntityPosition: 0,
        missingAreaPosition: 0,
        missingBlockedPosition: 0,
        updateEntries: rows.length,
        changedPositions: 0,
      });
      return;
    }
    const updated = new Map();
    let changed = 0;
    for (const row of rows) {
      const id = String(row.id);
      const previous = startupIds.get(id);
      if (
        !previous ||
        updated.has(id) ||
        previous.type !== row.type ||
        previous.entity !== String(row.cityentity_id)
      ) {
        message({
          source: "move",
          state: "stale",
          reason: "unknown-id",
          entities: 0,
          roads: 0,
          areas: 0,
          blocked: 0,
          missingEntityPosition: 0,
          missingAreaPosition: 0,
          missingBlockedPosition: 0,
          updateEntries: rows.length,
          changedPositions: 0,
        });
        return;
      }
      const next = {
        type: previous.type,
        entity: previous.entity,
        xPresent: own(row, "x"),
        x: own(row, "x") ? row.x : null,
        yPresent: own(row, "y"),
        y: own(row, "y") ? row.y : null,
      };
      changed +=
        next.xPresent !== previous.xPresent ||
        next.yPresent !== previous.yPresent ||
        next.x !== previous.x ||
        next.y !== previous.y
          ? 1
          : 0;
      updated.set(id, next);
    }
    for (const [id, next] of updated) startupIds.set(id, next);
    message({
      source: "move",
      state: "partial",
      reason: "partial-update",
      entities: 0,
      roads: 0,
      areas: 0,
      blocked: 0,
      missingEntityPosition: 0,
      missingAreaPosition: 0,
      missingBlockedPosition: 0,
      updateEntries: rows.length,
      changedPositions: changed,
    });
  }
  function inspect(response) {
    if (!Array.isArray(response)) return;
    for (const row of response) {
      if (
        row?.requestClass === "StartupService" &&
        row.requestMethod === "getData"
      )
        summarizeStartup(row.responseData?.city_map);
      if (
        row?.requestClass === "CityMapService" &&
        row.requestMethod === "moveEntities"
      )
        summarizeMove(row.responseData);
    }
  }
  function target(url) {
    try {
      const parsed = new URL(url, location.href);
      return parsed.origin === ORIGIN && parsed.pathname === "/game/json";
    } catch {
      return false;
    }
  }
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  const targets = new WeakMap();
  XMLHttpRequest.prototype.open = function (...args) {
    targets.set(this, target(args[1]));
    return Reflect.apply(originalOpen, this, args);
  };
  XMLHttpRequest.prototype.send = function (...args) {
    if (targets.get(this)) {
      this.addEventListener(
        "loadend",
        () => {
          if (this.status !== 200) return;
          try {
            if (this.responseType === "json") inspect(this.response);
            else if (
              (this.responseType === "" || this.responseType === "text") &&
              this.responseText.length <= 6_000_000
            )
              inspect(JSON.parse(this.responseText));
          } catch {
            message({
              source: "xhr",
              state: "unsupported",
              reason: "parse",
              entities: 0,
              roads: 0,
              areas: 0,
              blocked: 0,
              missingEntityPosition: 0,
              missingAreaPosition: 0,
              missingBlockedPosition: 0,
              updateEntries: 0,
              changedPositions: 0,
            });
          }
        },
        { once: true },
      );
    }
    return Reflect.apply(originalSend, this, args);
  };
})();
