#!/usr/bin/env python3
"""
MEND - X Industrial Manual Ingestion CLI
DIMENSITY LABS [VH26-37] - VCET Hackathon 2026

Usage:
    python ingest.py --pdf sinamics_g120.pdf --machine_id sinamics_g120 --manual_name "Siemens SINAMICS G120"
    python ingest.py --pdf sinamics_s120.pdf --machine_id sinamics_s120 --manual_name "Siemens SINAMICS S120"
    python ingest.py --pdf powerflex_755.pdf --machine_id powerflex_755 --manual_name "Allen-Bradley PowerFlex 755"
"""
from __future__ import annotations

import argparse
import os
import sys
import time
import urllib.request
from pathlib import Path

# Ensure requests is available by loading from backend/.venv if needed
try:
    import requests
except ImportError:
    venv_sites = list(Path(__file__).resolve().parent.glob("backend/.venv/lib/python*/site-packages"))
    if venv_sites:
        sys.path.insert(0, str(venv_sites[0]))
    try:
        import requests
    except ImportError:
        print("❌ 'requests' library not found. Please run with backend/.venv/bin/python or pip install requests.", file=sys.stderr)
        sys.exit(1)

BASE_DIR = Path(__file__).resolve().parent

KNOWN_MACHINES = {
    "sinamics_g120": {
        "name": "Siemens SINAMICS G120",
        "model": "SINAMICS G120 / G120C",
        "manufacturer": "Siemens",
        "category": "AC Inverter Drive",
        "description": "Industrial AC drive with 500+ fault codes (F001-F999), used in 80%+ of factories globally",
        "download_url": "https://support.industry.siemens.com/cs/attachments/109817922/G120C_list_man_0223_en-US.pdf",
        "aliases": ["G120C_list_man_0223_en-US.pdf", "sinamics_g120.pdf"],
    },
    "sinamics_s120": {
        "name": "Siemens SINAMICS S120",
        "model": "SINAMICS S120 / S150",
        "manufacturer": "Siemens",
        "category": "Modular Multi-Axis Drive",
        "description": "High performance multi-axis modular drive system (cross-manual disambiguation with G120)",
        "download_url": "https://support.industry.siemens.com/cs/attachments/109781807/S120_S150_list_man_0620_en-US.pdf",
        "aliases": ["S120_S150_list_man_0620_en-US.pdf", "sinamics_s120.pdf"],
    },
    "powerflex_755": {
        "name": "Allen-Bradley PowerFlex 755",
        "model": "PowerFlex 755",
        "manufacturer": "Allen-Bradley",
        "category": "AC Inverter Drive",
        "description": "Rockwell Automation PowerFlex 750-series AC drive with 300+ numerical fault codes",
        "download_url": "https://literature.rockwellautomation.com/idc/groups/literature/documents/pm/750-pm101_-en-p.pdf",
        "aliases": ["750-pm101_-en-p.pdf", "powerflex_755.pdf"],
    },
}


def resolve_pdf(pdf_arg: str, machine_id: str) -> Path:
    """Find PDF path locally, in MainManuals, or download if absent."""
    candidate = Path(pdf_arg)
    if candidate.exists() and candidate.is_file():
        return candidate.resolve()

    # Check MainManuals directory
    main_manuals_dir = BASE_DIR / "MainManuals"
    if (main_manuals_dir / pdf_arg).exists():
        return (main_manuals_dir / pdf_arg).resolve()

    # Check known aliases
    spec = KNOWN_MACHINES.get(machine_id, {})
    aliases = spec.get("aliases", [])
    for alias in aliases:
        p1 = BASE_DIR / alias
        if p1.exists():
            return p1.resolve()
        p2 = main_manuals_dir / alias
        if p2.exists():
            return p2.resolve()

    # If missing, attempt direct download
    download_url = spec.get("download_url")
    if download_url:
        print(f"📥 PDF '{pdf_arg}' not found locally. Downloading from OEM portal:\n   {download_url}")
        dest = BASE_DIR / "MainManuals" / pdf_arg
        dest.parent.mkdir(parents=True, exist_ok=True)

        def _reporthook(block_num, block_size, total_size):
            if total_size > 0:
                percent = min(100, int(block_num * block_size * 100 / total_size))
                downloaded_mb = (block_num * block_size) / (1024 * 1024)
                total_mb = total_size / (1024 * 1024)
                sys.stdout.write(f"\r   Progress: [{percent:3d}%] {downloaded_mb:.1f} MB / {total_mb:.1f} MB")
                sys.stdout.flush()

        urllib.request.urlretrieve(download_url, str(dest), reporthook=_reporthook)
        print("\n   Download complete.")
        return dest.resolve()

    raise FileNotFoundError(f"Could not find or download PDF for {pdf_arg} (machine: {machine_id})")


def authenticate(api_url: str, email: str, password: str) -> str:
    """Authenticate with backend and return access token."""
    login_url = f"{api_url}/auth/login"
    try:
        resp = requests.post(login_url, json={"email": email, "password": password}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data.get("access_token") or data.get("data", {}).get("access_token")
    except Exception as e:
        print(f"❌ Authentication failed at {login_url}: {e}", file=sys.stderr)
        sys.exit(1)


def get_or_create_machine(api_url: str, token: str, machine_id_str: str, manual_name: str) -> str:
    """Ensure machine exists in DB and return its UUID."""
    headers = {"Authorization": f"Bearer {token}"}
    spec = KNOWN_MACHINES.get(machine_id_str, {})
    target_name = spec.get("name", manual_name)
    target_model = spec.get("model", machine_id_str)
    target_mfg = spec.get("manufacturer", "OEM")
    target_cat = spec.get("category", "Industrial Machine")
    target_desc = spec.get("description", f"Target equipment for {manual_name}")

    # 1. Fetch machines list
    list_url = f"{api_url}/machines"
    try:
        res = requests.get(list_url, headers=headers, timeout=10)
        if res.status_code == 200:
            items = res.json().get("data", {}).get("items", [])
            for m in items:
                m_name = (m.get("name") or "").lower()
                m_model = (m.get("model") or "").lower()
                if (
                    target_name.lower() in m_name
                    or m_name in target_name.lower()
                    or machine_id_str.lower() in m_model
                    or machine_id_str.lower() in m_name
                ):
                    print(f"✅ Machine matched: {m.get('name')} (UUID: {m.get('id')})")
                    return m.get("id")
    except Exception as e:
        print(f"⚠️  Machine query notice: {e}")

    # 2. Create machine if not found
    print(f"⚙️  Registering new machine entity: {target_name} ({target_model})...")
    create_url = f"{api_url}/machines"
    payload = {
        "name": target_name,
        "model": target_model,
        "manufacturer": target_mfg,
        "category": target_cat,
        "description": target_desc,
    }
    try:
        create_res = requests.post(create_url, json=payload, headers=headers, timeout=10)
        create_res.raise_for_status()
        created_id = create_res.json().get("data", {}).get("id")
        print(f"✅ Machine registered successfully! ID: {created_id}")
        return created_id
    except Exception as e:
        print(f"❌ Failed to create machine: {e}", file=sys.stderr)
        sys.exit(1)


def find_existing_manual(api_url: str, headers: dict, filename: str, manual_name: str, machine_id_str: str, machine_uuid: str) -> str | None:
    """Check if manual has already been uploaded."""
    try:
        res = requests.get(f"{api_url}/manuals", headers=headers, timeout=10)
        if res.status_code == 200:
            items = res.json().get("data", {}).get("items", [])
            for m in items:
                status = str(m.get("processing_status") or "").lower()
                m_machine_id = str(m.get("machine_id") or "")
                title = (m.get("title") or "").lower()
                orig_file = (m.get("original_filename") or "").lower()

                match = False
                if m_machine_id == str(machine_uuid):
                    match = True
                elif machine_id_str == "sinamics_g120" and ("g120" in title or "g120" in orig_file):
                    match = True
                elif machine_id_str == "sinamics_s120" and ("s120" in title or "s120" in orig_file):
                    match = True
                elif machine_id_str == "powerflex_755" and ("powerflex" in title or "powerflex" in orig_file or "755" in title):
                    match = True
                elif (
                    filename.lower() in orig_file
                    or orig_file in filename.lower()
                    or manual_name.lower() in title
                    or title in manual_name.lower()
                ):
                    match = True

                if match:
                    if status in ("failed", "pending"):
                        # Delete stale/failed run to permit clean fresh upload
                        try:
                            requests.delete(f"{api_url}/manuals/{m.get('id')}", headers=headers, timeout=10)
                        except Exception:
                            pass
                        return None
                    return m.get("id")
    except Exception:
        pass
    return None


def upload_and_ingest(
    api_url: str,
    token: str,
    pdf_path: Path,
    machine_id_str: str,
    machine_uuid: str,
    manual_name: str,
    poll: bool = True,
    timeout: int = 600,
):
    """Upload PDF file via requests multipart and track background ingestion."""
    upload_url = f"{api_url}/manuals/upload"
    headers = {"Authorization": f"Bearer {token}"}

    filename = pdf_path.name
    file_size_mb = pdf_path.stat().st_size / (1024 * 1024)

    # Check if manual was already uploaded previously
    existing_id = find_existing_manual(api_url, headers, filename, manual_name, machine_id_str, machine_uuid)
    manual_id = existing_id

    if existing_id:
        print(f"\nℹ️  Manual already exists in database (Manual ID: {existing_id}).")
        print(f"   Original Filename : {filename}")
        print(f"   Connecting to existing ingestion status...")
    else:
        print(f"\n📤 Uploading '{filename}' ({file_size_mb:.2f} MB)...")
        print(f"   Manual Title       : {manual_name}")
        print(f"   Target Machine ID  : {machine_uuid}")

        try:
            with open(pdf_path, "rb") as f:
                files = {"file": (filename, f, "application/pdf")}
                data = {
                    "machine_id": machine_uuid,
                    "title": manual_name,
                    "auto_detect_metadata": "true",
                }
                res = requests.post(upload_url, headers=headers, files=files, data=data, timeout=300)

            if res.status_code in (200, 201):
                upload_info = res.json().get("data", {})
                manual_id = upload_info.get("manual_id")
                job_id = upload_info.get("ingestion_job_id")
                print(f"✅ Upload accepted!")
                print(f"   - Manual ID : {manual_id}")
                print(f"   - Job ID    : {job_id}")
            else:
                # Fallback: check if duplicate was triggered
                existing_id = find_existing_manual(api_url, headers, filename, manual_name, machine_id_str, machine_uuid)
                if existing_id:
                    manual_id = existing_id
                    print(f"ℹ️  Duplicate detected: using existing manual ID {manual_id}.")
                else:
                    print(f"❌ Upload failed ({res.status_code}): {res.text}", file=sys.stderr)
                    sys.exit(1)

        except Exception as e:
            print(f"❌ Upload network error: {e}", file=sys.stderr)
            sys.exit(1)

    if not poll or not manual_id:
        return

    # Track background pipeline progress
    print("\n⚡ Tracking Background Ingestion Pipeline:")
    status_url = f"{api_url}/manuals/{manual_id}/status"
    start_time = time.time()

    while time.time() - start_time < timeout:
        try:
            status_res = requests.get(status_url, headers=headers, timeout=10)
            if status_res.status_code == 200:
                info = status_res.json().get("data", {})
                proc_status = info.get("processing_status", "pending")
                pct = info.get("progress_pct") or 0
                pages = info.get("pages_processed") or 0
                chunks = info.get("chunks_created") or 0

                bar_len = 24
                filled = int((pct / 100.0) * bar_len)
                bar = "█" * filled + "░" * (bar_len - filled)

                sys.stdout.write(
                    f"\r   [{bar}] {pct:3d}% | Status: {proc_status:<10} | Pages: {pages:<4} | Chunks: {chunks:<5}"
                )
                sys.stdout.flush()

                if proc_status == "completed":
                    print(f"\n\n🎉 Ingestion Completed Successfully!")
                    print(f"   - Total Pages Indexed : {pages}")
                    print(f"   - Total Chunks Stored : {chunks}")
                    print(f"   - Manual ID           : {manual_id}")
                    print(f"   - Vector Database     : ChromaDB / pgvector Embeddings Ready")
                    return
                elif proc_status == "failed":
                    print(f"\n\n❌ Ingestion pipeline failed: {info.get('error_message')}")
                    return
        except Exception:
            pass

        time.sleep(2.5)

    print(f"\n\n⏳ Ingestion continues in background (Timeout {timeout}s reached).")


def main():
    parser = argparse.ArgumentParser(
        description="MEND-X Industrial Manual Ingestion CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--pdf", required=True, help="Path to PDF manual file")
    parser.add_argument("--machine_id", required=True, help="Machine identifier (e.g. sinamics_g120)")
    parser.add_argument("--manual_name", required=True, help="Human-readable manual title")
    parser.add_argument("--api_url", default="http://localhost:8000/api/v1", help="Backend API base URL")
    parser.add_argument("--email", default="admin@mechmind.io", help="Admin email")
    parser.add_argument("--password", default="Admin123!", help="Admin password")
    parser.add_argument("--no-poll", action="store_true", help="Do not wait for ingestion completion")
    parser.add_argument("--timeout", type=int, default=600, help="Polling timeout in seconds")

    args = parser.parse_args()

    print("=" * 68)
    print(" 🛠  MEND - X INDUSTRIAL MANUAL INGESTION")
    print("    DIMENSITY LABS · RAG KNOWLEDGE PIPELINE")
    print("=" * 68)

    pdf_path = resolve_pdf(args.pdf, args.machine_id)
    print(f"📄 Located PDF file  : {pdf_path}")

    print("\n1️⃣  Authenticating with local API...")
    token = authenticate(args.api_url, args.email, args.password)
    print("✅ Authenticated as administrator.")

    print("\n2️⃣  Verifying Machine Entity...")
    machine_uuid = get_or_create_machine(args.api_url, token, args.machine_id, args.manual_name)

    print("\n3️⃣  Dispatching to Ingestion Pipeline...")
    upload_and_ingest(
        api_url=args.api_url,
        token=token,
        pdf_path=pdf_path,
        machine_id_str=args.machine_id,
        machine_uuid=machine_uuid,
        manual_name=args.manual_name,
        poll=not args.no_poll,
        timeout=args.timeout,
    )


if __name__ == "__main__":
    main()
