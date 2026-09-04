#!/usr/bin/env python3
"""Auto-Metadata Extractor & Registry CLI for MEND - X.

Scans PDF manuals, automatically extracts machine metadata (manufacturer, model,
category, manual type, version, error codes) using AI and heuristics, and updates
the master metadata.json registry.

Usage:
    python scripts/auto_metadata.py
    python scripts/auto_metadata.py --dir ../TestManuals
    python scripts/auto_metadata.py --dir ../TestManuals --seed-db
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys

# Ensure backend app is in path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.ingestion.auto_metadata import AutoMetadataExtractor


async def scan_and_generate_metadata(target_dir: str, output_file: str, seed_db: bool = False):
    print("=================================================================")
    print(" 🤖 MEND - X Automated Manual Metadata Extractor")
    print("=================================================================")
    print(f"📁 Scanning directory: {target_dir}")

    if not os.path.exists(target_dir):
        print(f"❌ Error: Directory '{target_dir}' does not exist.")
        return

    # Find all PDFs
    pdf_files = [f for f in os.listdir(target_dir) if f.lower().endswith(".pdf")]
    if not pdf_files:
        print("⚠️ No PDF files found in directory.")
        return

    print(f"📄 Found {len(pdf_files)} PDF manual(s): {', '.join(pdf_files)}\n")

    extractor = AutoMetadataExtractor()
    extracted_manuals = []

    for idx, pdf_name in enumerate(sorted(pdf_files), 1):
        pdf_path = os.path.join(target_dir, pdf_name)
        file_size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
        print(f"[{idx}/{len(pdf_files)}] 🔍 Analyzing {pdf_name} ({file_size_mb:.1f} MB)...")

        try:
            meta = await extractor.aextract_from_pdf_path(pdf_path)
            data = meta.to_dict()
            data["filename"] = pdf_name
            data["manual_id"] = f"man-auto-{idx:03d}"
            extracted_manuals.append(data)

            print(f"      ✅ Title: {meta.title}")
            print(f"      🏷️  Machine: {meta.machine_name} ({meta.machine_model})")
            print(f"      🏭 OEM: {meta.manufacturer} | Type: {meta.manual_type} | Ver: {meta.version or 'N/A'}")
            print(f"      📊 Pages: {meta.page_count} | Error Codes Detected: {len(meta.detected_error_codes)}")
            print(f"      🎯 Confidence: {meta.confidence * 100:.0f}% (via {meta.extraction_method})\n")
        except Exception as e:
            print(f"      ❌ Error analyzing {pdf_name}: {e}\n")

    # Build master registry JSON
    registry = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "version": "1.1",
        "project": "MEND - X",
        "team": "DIMENSITY LABS [VH26-37]",
        "generated_by": "AutoMetadataExtractor",
        "description": "Master metadata registry automatically extracted from industrial manuals.",
        "manuals": extracted_manuals,
    }

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2)

    print("=================================================================")
    print(f"🎉 Success! Extracted metadata saved to: {output_file}")
    print("=================================================================")

    if seed_db:
        await seed_to_database(extracted_manuals, target_dir)


async def seed_to_database(manuals: list[dict], target_dir: str):
    print("\n🐘 Seeding auto-detected machines & manuals into PostgreSQL...")
    try:
        from app.db.session import AsyncSessionLocal
        from app.models.machine import Machine
        from app.models.manual import Manual
        from sqlalchemy import select

        async with AsyncSessionLocal() as db:
            for item in manuals:
                # Check if machine exists
                model = item.get("machine_model") or "Model"
                name = item.get("machine_name") or f"{item.get('manufacturer')} {model}"
                stmt = select(Machine).where(Machine.model == model)
                res = await db.execute(stmt)
                m = res.scalars().first()

                if not m:
                    m = Machine(
                        name=name,
                        model=model,
                        manufacturer=item.get("manufacturer") or "OEM",
                        category=item.get("category") or "CNC Machining",
                        description=f"Auto-registered from {item.get('filename')}",
                        is_active=True,
                    )
                    db.add(m)
                    await db.flush()
                    print(f"  [created machine] {m.name} ({m.model}) id={m.id}")
                else:
                    print(f"  [found machine] {m.name} ({m.model}) id={m.id}")

            await db.commit()
            print("✅ Database seeding complete!")
    except Exception as e:
        print(f"⚠️ Database seed error: {e}")


def main():
    parser = argparse.ArgumentParser(description="Auto metadata extractor for MEND - X manuals")
    parser.add_argument("--dir", default="../TestManuals", help="Directory containing PDF manuals")
    parser.add_argument("--out", default=None, help="Output metadata.json path")
    parser.add_argument("--seed-db", action="store_true", help="Auto-register extracted machines in database")
    args = parser.parse_args()

    target_dir = os.path.abspath(args.dir)
    output_file = os.path.abspath(args.out) if args.out else os.path.join(target_dir, "metadata.json")

    asyncio.run(scan_and_generate_metadata(target_dir, output_file, seed_db=args.seed_db))


if __name__ == "__main__":
    main()
