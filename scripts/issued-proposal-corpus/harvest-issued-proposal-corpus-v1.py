#!/usr/bin/env python3
"""Harvest issued Capital Glass proposal PDFs from Z: sample corpus.

Regenerates:
  artifacts/issued-proposal-corpus-v1/manifest.json
  artifacts/issued-proposal-corpus-v1/exclusion-phrase-library-v1.json
  artifacts/issued-proposal-corpus-v1/regression-pack-v1.json
  artifacts/issued-proposal-corpus-v1/hub-slice-preview.json
  artifacts/issued-proposal-corpus-v1/agent-build-catalog-patch-v1.json
  work-progress/intelligence-hub-slices/issued-proposal-corpus-v1.json

Requires: pdftotext, pdfinfo (poppler-utils)
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import statistics
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CORPUS_ROOT_WSL = Path(
    os.environ.get(
        "CG_ISSUED_PROPOSAL_CORPUS_ROOT_WSL",
        "/mnt/z/Capital-Glass-Dev/Computer Estimator Sample Documents/Proposals",
    )
)
CORPUS_ROOT_WIN = os.environ.get(
    "CG_ISSUED_PROPOSAL_CORPUS_ROOT_WIN",
    "Z:/Capital-Glass-Dev/Computer Estimator Sample Documents/Proposals",
)
OUT = REPO_ROOT / "artifacts" / "issued-proposal-corpus-v1"
SLICE_OUT = REPO_ROOT / "work-progress" / "intelligence-hub-slices" / "issued-proposal-corpus-v1.json"

TYPE_KEYWORDS = {
    "retail": ["HEB", "Dollar Tree", "Dhanani", "C-Store", "Retail", "Commercial Center", "Bubble Bath"],
    "healthcare": ["Hospital", "Medical"],
    "industrial": ["Industrial", "Business Park", "Self Storage", "Lookout Industrial", "North Ridge", "Parkside"],
    "hospitality": ["Echo Suites", "Hotel"],
    "fitness": ["Crunch Fitness", "Gym"],
    "collision_auto": ["Collision", "Caliber", "Crash Champions", "Classic Collision"],
    "restaurant": ["Bubba's", "Restaurant"],
    "education_ag": ["Agrilife", "College Station"],
    "religious": ["Covenant"],
    "mixed_use": ["Shopping Center", "Monroe", "Gosling", "Carmen", "Bandera", "Belltec", "Bellmead", "Anderson", "Bellaire"],
}

REGRESSION_TIERS = {
    "smoke": ["CG-1055-26", "CG-1098-26"],
    "multiBuilding": ["CG-1136-26", "CG-1105-26"],
    "alternates": ["CG-1055-26", "CG-1138-26", "CG-1137-26"],
    "specialScope": ["CG-1131-26"],
    "largeCommercial": ["CG-1061-26", "CG-1105-26", "CG-1122-26"],
}


def classify(fname: str) -> str:
    for vertical, keywords in TYPE_KEYWORDS.items():
        if any(kw.lower() in fname.lower() for kw in keywords):
            return vertical
    return "other"


def pdf_text(path: Path) -> str:
    return subprocess.run(["pdftotext", "-layout", str(path), "-"], capture_output=True, text=True).stdout


def pdf_pages(path: Path) -> int | None:
    info = subprocess.run(["pdfinfo", str(path)], capture_output=True, text=True).stdout
    match = re.search(r"Pages:\s+(\d+)", info)
    return int(match.group(1)) if match else None


def extract_executive(text: str) -> dict:
    head = text[:8000]
    bid_nums = list(dict.fromkeys(re.findall(r"CG-\d{4}-\d{2}", head)))
    prices = re.findall(r"Bid Price:\s*\$([\d,]+\.\d{2})", text)
    alt_prices = re.findall(r"ALT:\s*\$([\d,]+\.\d{2})", text, re.I)
    sf_frame = re.search(r"Approximately\s+([\d,]+\.?\d*)\s*SF of Aluminum Storefront", head, re.I)
    sf_glass = re.search(
        r"Approximately\s+([\d,]+\.?\d*)\s*(?:SF of (?:1\" )?(?:IGU|glass)|square feet of glass)",
        head,
        re.I,
    )
    openings = re.search(r"Total Glass Openings:\s*(\d+)", head, re.I)
    perimeter = re.search(r"Total Perimeter:\s*([\d,]+\.?\d*)\s*(?:LF|Ft|FT)", head, re.I)
    frames = re.search(r"Total Frames?:\s*(\d+)", head, re.I)
    system = re.search(r"(Tubelite T14000[^\n]{0,80})", head, re.I)
    finish = re.search(r"Finish:\s*([^\n]{5,120})", head, re.I)
    glass_makeup = re.search(r"(Solarban \d+[^\n]{0,120})", head, re.I)
    prepared_for = re.search(r"^\s{4,}([A-Za-z0-9 .&'\-]+)\s{20,}\d", head, re.M)
    project_line = re.search(r"^\s{4,}([^\n]{8,80})\s{10,}\d", head, re.M)
    address = re.search(r"(\d+[^\n]{10,80}(?:TX|Texas)[^\n]{0,40})", head, re.I)
    return {
        "bidId": bid_nums[0] if bid_nums else None,
        "basePriceUsd": float(prices[0].replace(",", "")) if prices else None,
        "alternatePricesUsd": [float(p.replace(",", "")) for p in alt_prices[:3]],
        "frameAreaSf": float(sf_frame.group(1).replace(",", "")) if sf_frame else None,
        "glassAreaSf": float(sf_glass.group(1).replace(",", "")) if sf_glass else None,
        "glassOpenings": int(openings.group(1)) if openings else None,
        "perimeter": float(perimeter.group(1).replace(",", "")) if perimeter else None,
        "frameUnits": int(frames.group(1)) if frames else None,
        "systemLine": system.group(1).strip() if system else None,
        "finishLine": finish.group(1).strip() if finish else None,
        "glassProductLine": glass_makeup.group(1).strip() if glass_makeup else None,
        "preparedForHint": prepared_for.group(1).strip() if prepared_for else None,
        "projectNameHint": project_line.group(1).strip() if project_line else None,
        "addressHint": address.group(1).strip() if address else None,
    }


def extract_flags(text: str) -> dict:
    lowered = text.lower()
    return {
        "hasAlternates": bool(re.search(r"\bALT:\s*\$", text, re.I)),
        "multiBuilding": bool(re.search(r"building\s+[12]", lowered)),
        "hasDemolition": "demolition" in lowered,
        "hasAccessControl": "access control" in lowered or "card reader" in lowered,
        "hasSiteProtection": "skudo" in lowered,
        "hasCurtainWall": "curtain wall" in lowered,
        "hasSteelReinforcement": "steel reinforcement" in lowered,
        "hasFieldTestingExclusion": "field testing and bonding" in lowered,
        "hasWaterproofingExclusion": "waterproofing beyond" in lowered,
        "hasGlassListTable": "Glass List:" in text or "Glass Type" in text,
        "hasFrameScheduleDetail": "Frame Set Name:" in text,
    }


def extract_exclusions(text: str) -> list[str]:
    phrases: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        lowered = stripped.lower()
        if any(
            key in lowered
            for key in [
                "exclusion",
                "is excluded",
                "waterproofing beyond",
                "field testing and bonding",
                "coordination with adjacent trades",
            ]
        ):
            if len(stripped) > 30:
                phrases.append(stripped[:240])
    seen: set[str] = set()
    out: list[str] = []
    for phrase in phrases:
        key = re.sub(r"\s+", " ", phrase.lower())[:120]
        if key not in seen:
            seen.add(key)
            out.append(phrase)
    return out[:12]


def main() -> int:
    if not CORPUS_ROOT_WSL.is_dir():
        print(f"CORPUS_MISSING: {CORPUS_ROOT_WSL}", file=sys.stderr)
        return 1

    records = []
    all_exclusions: list[str] = []
    pages_list: list[int] = []
    prices_list: list[float] = []

    for path in sorted(CORPUS_ROOT_WSL.glob("*.pdf")):
        text = pdf_text(path)
        pages = pdf_pages(path)
        executive = extract_executive(text)
        flags = extract_flags(text)
        exclusions = extract_exclusions(text)
        all_exclusions.extend(exclusions)
        if pages:
            pages_list.append(pages)
        if executive.get("basePriceUsd"):
            prices_list.append(executive["basePriceUsd"])
        digest = hashlib.sha256(text.encode("utf-8", errors="replace")).hexdigest()[:16]
        records.append(
            {
                "fileName": path.name,
                "corpusPathWsl": str(path),
                "corpusPathWin": f"{CORPUS_ROOT_WIN}/{path.name}",
                "pages": pages,
                "vertical": classify(path.name),
                "textExtractSha256Prefix": digest,
                "executiveSummary": executive,
                "flags": flags,
                "exclusionSnippetCount": len(exclusions),
            }
        )

    excl_norm: dict = {}
    for phrase in all_exclusions:
        norm = re.sub(r"\s+", " ", phrase.lower())
        if "waterproofing beyond" in norm:
            key = "waterproofing_beyond_storefront"
        elif "field testing and bonding" in norm:
            key = "field_testing_and_bonding"
        elif "coordination with adjacent trades" in norm:
            key = "adjacent_trades_coordination"
        elif norm.startswith("exclusion") or "exclusions:" in norm[:20]:
            key = "general_exclusion_block"
        else:
            key = hashlib.sha256(norm.encode()).hexdigest()[:12]
        bucket = excl_norm.setdefault(key, {"id": key, "examples": [], "count": 0})
        bucket["count"] += 1
        if len(bucket["examples"]) < 3:
            bucket["examples"].append(phrase)

    generated_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    manifest = {
        "schemaVersion": "issued-proposal-corpus-manifest-v1@1.0.0",
        "corpusId": "ce-sample-issued-proposals-v1",
        "generatedAt": generated_at,
        "corpusRootWsl": str(CORPUS_ROOT_WSL),
        "corpusRootWin": CORPUS_ROOT_WIN,
        "workPackageId": "ce-issued-proposal-corpus-v1",
        "count": len(records),
        "stats": {
            "pagesMin": min(pages_list) if pages_list else None,
            "pagesMax": max(pages_list) if pages_list else None,
            "pagesMedian": statistics.median(pages_list) if pages_list else None,
            "basePriceMinUsd": min(prices_list) if prices_list else None,
            "basePriceMaxUsd": max(prices_list) if prices_list else None,
            "basePriceMedianUsd": statistics.median(prices_list) if prices_list else None,
        },
        "dominantPatterns": {
            "bidIdPattern": "CG-{####}-26",
            "dominantSystem": 'Tubelite T14000 Thermal 2"x4.5" storefront',
            "dominantScopeType": "storefront",
            "sectionTemplate": [
                "executive_summary",
                "framing_systems",
                "entrances_and_doors",
                "glass_and_openings",
                "glazing",
                "exclusions",
                "frame_summary_table",
                "frame_schedule_detail",
            ],
        },
        "regressionTiers": REGRESSION_TIERS,
        "suiteConsumers": [
            "CapitalGlass-BidComposer",
            "Computer Estimator",
            "capital-glass-estimating-parser",
            "CG-Human-Estimator-MCP",
        ],
        "records": records,
    }

    exclusion_lib = {
        "schemaVersion": "issued-proposal-exclusion-phrase-library-v1@1.0.0",
        "corpusId": "ce-sample-issued-proposals-v1",
        "generatedAt": generated_at,
        "phraseCount": len(excl_norm),
        "phrases": list(excl_norm.values()),
    }

    regression_pack = {
        "schemaVersion": "issued-proposal-regression-pack-v1@1.0.0",
        "corpusId": "ce-sample-issued-proposals-v1",
        "generatedAt": generated_at,
        "purpose": "Bid Composer compiler parity + parser regression; read-only issued PDF corpus",
        "tiers": {},
    }
    for tier, bid_ids in REGRESSION_TIERS.items():
        regression_pack["tiers"][tier] = [
            r for r in (next((x for x in records if x["executiveSummary"].get("bidId") == bid), None) for bid in bid_ids) if r
        ]

    hub_slice = {
        "schemaVersion": "intelligence-hub-issued-proposal-corpus-slice-v1@1.0.0",
        "generatedAt": generated_at,
        "sourceAuthority": "CapitalGlass-Cross-Agent/artifacts/issued-proposal-corpus-v1/manifest.json",
        "derivedView": True,
        "machineAuthority": False,
        "corpusId": "ce-sample-issued-proposals-v1",
        "workPackageId": "ce-issued-proposal-corpus-v1",
        "corpusRootWin": CORPUS_ROOT_WIN,
        "corpusRootWsl": str(CORPUS_ROOT_WSL),
        "count": len(records),
        "stats": manifest["stats"],
        "dominantPatterns": manifest["dominantPatterns"],
        "regressionTiers": REGRESSION_TIERS,
        "suiteConsumers": manifest["suiteConsumers"],
        "artifactPointers": {
            "manifest": "CapitalGlass-Cross-Agent/artifacts/issued-proposal-corpus-v1/manifest.json",
            "exclusionLibrary": "CapitalGlass-Cross-Agent/artifacts/issued-proposal-corpus-v1/exclusion-phrase-library-v1.json",
            "regressionPack": "CapitalGlass-Cross-Agent/artifacts/issued-proposal-corpus-v1/regression-pack-v1.json",
            "knowledgeBuilds": "CapitalGlass-Cross-Agent/artifacts/issued-proposal-corpus-v1/knowledge-builds/",
            "harvestScript": "CapitalGlass-Cross-Agent/scripts/issued-proposal-corpus/harvest-issued-proposal-corpus-v1.py",
            "projectFile": "CapitalGlass-Cross-Agent/work-progress/projects/ce-issued-proposal-corpus-v1.md",
        },
        "recordsCompact": [
            {
                "bidId": r["executiveSummary"].get("bidId"),
                "fileName": r["fileName"],
                "vertical": r["vertical"],
                "pages": r["pages"],
                "basePriceUsd": r["executiveSummary"].get("basePriceUsd"),
                "flags": r["flags"],
            }
            for r in records
        ],
        "retrievalClass": "INDEXED_CORPUS_POINTER",
    }

    catalog_patch = {
        "schemaVersion": "agent-build-catalog-patch-v1@1.0.0",
        "patchId": "ce-sample-issued-proposals-z-drive-v1",
        "generatedAt": generated_at,
        "mergeTarget": "L:/Capital-Glass-Intelligence-Hub/00-master-index/AGENT_BUILD_CATALOG.json",
        "publicationNote": "Apply on next WESLEYDESK index-publication.yml run — do not hand-edit L: from Cursor",
        "entry": {
            "id": "ce-sample-issued-proposals-z-drive-v1",
            "kind": "benchmark-corpus",
            "title": "Computer Estimator sample issued proposal PDFs (Z: Proposals)",
            "verdict": "STUDY",
            "ownerRepo": "CapitalGlass-Cross-Agent",
            "workPackageId": "ce-issued-proposal-corpus-v1",
            "pointers": {
                "corpusRootWin": CORPUS_ROOT_WIN,
                "manifest": "CapitalGlass-Cross-Agent/artifacts/issued-proposal-corpus-v1/manifest.json",
                "hubSliceGit": "CapitalGlass-Cross-Agent/work-progress/intelligence-hub-slices/issued-proposal-corpus-v1.json",
            },
            "consumers": manifest["suiteConsumers"],
        },
    }

    OUT.mkdir(parents=True, exist_ok=True)
    for name, payload in [
        ("manifest.json", manifest),
        ("exclusion-phrase-library-v1.json", exclusion_lib),
        ("regression-pack-v1.json", regression_pack),
        ("hub-slice-preview.json", hub_slice),
        ("agent-build-catalog-patch-v1.json", catalog_patch),
    ]:
        (OUT / name).write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    SLICE_OUT.write_text(json.dumps(hub_slice, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"verdict": "PASS", "count": len(records), "out": str(OUT)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
