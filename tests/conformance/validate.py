"""Check the shared in-memory geometry corpus with the authoritative JSON Schema."""

import json
import sys
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator


def unique_members(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("DUPLICATE_JSON_MEMBER")
        result[key] = value
    return result


def main() -> None:
    root = Path(__file__).resolve().parents[2]
    schema_path = root / "packages/contracts/src/city-geometry.schema.json"
    schema = json.loads(schema_path.read_text(), object_pairs_hook=unique_members)
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema)
    cases = json.load(sys.stdin, object_pairs_hook=unique_members)
    assert len(cases) >= 10
    for case in cases:
        value = case["value"]
        accepted = value.get("schemaVersion") == "0.1" and validator.is_valid(value)
        assert accepted is case["valid"], case["name"]
    print(f"Python JSON Schema conformance: {len(cases)} cases passed")


if __name__ == "__main__":
    main()
