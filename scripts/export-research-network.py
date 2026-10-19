"""Export public, aggregate research metadata for the read-only rights explorer.

Run from the repository root:
python scripts/export-research-network.py --input ../output/aegora_erd_v03/exports
No case records, observational units, decisions, event records or user data are
copied. Active/public assertion IDs come from the engine's filtered graph.
"""
import argparse
import hashlib
import json
from pathlib import Path

TABLES = (
    "concept", "relation", "relation_type", "context", "context_condition", "source",
    "assertion", "assertion_evidence", "source_review", "assertion_review",
    "derivation", "derivation_premise", "rule", "module_manifest", "module_dependency",
    "condition_definition", "source_fragment", "norm", "norm_set", "norm_set_member",
    "norm_application", "norm_exception", "norm_projection",
)


def export(folder: Path, output: Path):
    snapshot = json.loads((folder / "full_snapshot.json").read_text(encoding="utf-8"))
    graph = json.loads((folder / "graph.json").read_text(encoding="utf-8"))
    if snapshot["schema_version"] != graph["schema_version"]:
        raise ValueError("Snapshot and graph schema versions differ")
    if snapshot["exported_at"] != graph["exported_at"]:
        raise ValueError("Snapshot and graph must come from the same export")
    tables = {name: snapshot["tables"][name] for name in TABLES}
    ids = {row["assertion_id"] for row in tables["assertion"]}
    active = sorted({row["assertion_id"] for row in graph["active_edges"]})
    public = sorted({row["assertion_id"] for row in graph["public_edges"]})
    if not set(public) <= set(active) <= ids:
        raise ValueError("Graph IDs do not match the exported assertion history")
    result = {"schemaVersion": snapshot["schema_version"], "activeAssertionIds": active,
              "publicAssertionIds": public, "tables": tables}
    canonical = json.dumps(result, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    result["revision"] = hashlib.sha256(canonical.encode()).hexdigest()[:20]
    result["exportedAt"] = snapshot["exported_at"]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n", encoding="utf-8")
    return {"revision": result["revision"], "activeClaims": len(active), "publicClaims": len(public),
            "tables": len(tables), "bytes": output.stat().st_size}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("lib/rights-explorer-snapshot.json"))
    args = parser.parse_args()
    print(json.dumps(export(args.input, args.output)))
