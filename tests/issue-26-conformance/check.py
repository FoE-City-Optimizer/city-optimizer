"""Disposable issue #26 Python comparison; not a production validator."""

import json
from pathlib import Path

from jsonschema import Draft202012Validator

HERE = Path(__file__).parent
CASES = json.loads((HERE / "cases.json").read_text(encoding="utf-8"))
SCHEMA = json.loads((HERE / "candidate.schema.json").read_text(encoding="utf-8"))
ZOD_SCHEMA = json.loads((HERE / "zod-generated.schema.json").read_text(encoding="utf-8"))


def manual(value: object) -> bool:
    if not isinstance(value, dict) or set(value) != {"schemaVersion", "instances"}:
        return False
    if value["schemaVersion"] != "1.0":
        return False
    instances = value["instances"]
    if not isinstance(instances, list) or not 1 <= len(instances) <= 3:
        return False
    expected = {"id", "x", "y", "width", "height", "roadRequirement"}
    for item in instances:
        if not isinstance(item, dict) or set(item) != expected:
            return False
        name = item["id"]
        if not isinstance(name, str) or not 1 <= len(name) <= 16:
            return False
        for key, lo, hi in (("x", 0, 63), ("y", 0, 63), ("width", 1, 8), ("height", 1, 8)):
            number = item[key]
            if type(number) is not int or not lo <= number <= hi:
                return False
        if item["roadRequirement"] not in ("NONE", "SINGLE", "DOUBLE"):
            return False
    return True


Draft202012Validator.check_schema(SCHEMA)
Draft202012Validator.check_schema(ZOD_SCHEMA)
schema_first = Draft202012Validator(SCHEMA)
ts_first = Draft202012Validator(ZOD_SCHEMA)
for case in CASES:
    results = {
        "schemaFirstPython": schema_first.is_valid(case["value"]),
        "tsFirstGeneratedPython": ts_first.is_valid(case["value"]),
        "manualPython": manual(case["value"]),
    }
    assert all(result == case["valid"] for result in results.values()), (case["name"], results)
    print(f"{case['name']}: {results}")
