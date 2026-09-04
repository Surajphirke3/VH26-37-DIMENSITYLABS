#!/usr/bin/env python3
"""
Test script for uploading TestManuals/machine_beta_manual.pdf
Runs login, tests metadata extraction, uploads the PDF, and polls ingestion status.
"""
import sys
import time
import requests

BASE_URL = "http://localhost:8000/api/v1"
PDF_PATH = "TestManuals/machine_beta_manual.pdf"
ADMIN_EMAIL = "admin@mechmind.io"
ADMIN_PASSWORD = "Admin123!"

def main():
    print("=" * 60)
    print(" 🛠 Testing Upload: machine_beta_manual.pdf")
    print("=" * 60)

    # 1. Login
    print("\n1️⃣ Logging in as admin...")
    login_res = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    if login_res.status_code != 200:
        print(f"❌ Login failed ({login_res.status_code}): {login_res.text}")
        sys.exit(1)

    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Authenticated successfully.")

    # 2. Test metadata extraction
    print("\n2️⃣ Testing AI metadata auto-extraction...")
    with open(PDF_PATH, "rb") as f:
        extract_res = requests.post(
            f"{BASE_URL}/manuals/extract-metadata",
            headers=headers,
            files={"file": ("machine_beta_manual.pdf", f, "application/pdf")},
        )
    if extract_res.status_code == 200:
        meta = extract_res.json()
        print(f"   - Detected Title   : {meta.get('title')}")
        print(f"   - Machine Model    : {meta.get('machine_model')}")
        print(f"   - Manufacturer     : {meta.get('manufacturer')}")
        print(f"   - Manual Type      : {meta.get('manual_type')}")
        print(f"   - Revision         : {meta.get('version')}")
        print(f"   - Extraction Mode  : {meta.get('method')} (Confidence: {meta.get('confidence')})")
    else:
        print(f"⚠️  Metadata extraction preview notice ({extract_res.status_code}): {extract_res.text}")

    # 3. Upload the manual
    print("\n3️⃣ Uploading manual with auto-metadata & auto-registration...")
    with open(PDF_PATH, "rb") as f:
        upload_res = requests.post(
            f"{BASE_URL}/manuals/upload",
            headers=headers,
            files={"file": ("machine_beta_manual.pdf", f, "application/pdf")},
            data={"auto_detect_metadata": "true"},
        )

    if upload_res.status_code not in (200, 201):
        print(f"❌ Upload failed ({upload_res.status_code}): {upload_res.text}")
        sys.exit(1)

    upload_data = upload_res.json()["data"]
    manual_id = upload_data["manual_id"]
    job_id = upload_data.get("ingestion_job_id")
    print(f"✅ Manual uploaded successfully!")
    print(f"   - Manual ID : {manual_id}")
    print(f"   - Job ID    : {job_id}")

    # 4. Poll status
    print("\n4️⃣ Polling background ingestion pipeline...")
    for _ in range(30):
        status_res = requests.get(f"{BASE_URL}/manuals/{manual_id}/status", headers=headers)
        if status_res.status_code == 200:
            status_data = status_res.json()["data"]
            curr_status = status_data.get("processing_status")
            progress = status_data.get("progress_pct", 0)
            pages = status_data.get("pages_processed", 0)
            chunks = status_data.get("chunks_created", 0)
            print(f"   Status: {curr_status} | Progress: {progress}% | Pages: {pages} | Chunks: {chunks}")
            if curr_status == "completed":
                print("\n🎉 Ingestion completed successfully! Manual is indexed and ready for chat!")
                return
            if curr_status == "failed":
                print(f"\n❌ Ingestion failed: {status_data.get('error_message')}")
                return
        time.sleep(2)

    print("\n⏳ Ingestion still processing in background.")

if __name__ == "__main__":
    main()
