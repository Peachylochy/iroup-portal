from __future__ import annotations

import csv
import hashlib
import re
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Contact_องค์กรต่างประเทศ_v5.xlsx"
OUT_DIR = ROOT / "data" / "imports"

ORG_HEADERS = [
    "partner_org_id",
    "org_name_en",
    "org_name_th",
    "org_type",
    "country_id",
    "country_name",
    "continent",
    "field_area",
    "website",
    "status",
    "source_note",
    "created_at",
    "updated_at",
]

CONTACT_HEADERS = [
    "partner_contact_id",
    "partner_org_id",
    "contact_name",
    "position",
    "email",
    "phone",
    "last_contact_date",
    "relationship_level",
    "occasion_note",
    "note",
    "status",
    "created_at",
    "updated_at",
]

COUNTRY_IDS = {
    "Australia": "CTRY-AU",
    "Austria": "CTRY-AT",
    "China": "CTRY-CN",
    "Czech Republic": "CTRY-CZ",
    "France": "CTRY-FR",
    "Germany": "CTRY-DE",
    "Indonesia": "CTRY-ID",
    "Japan": "CTRY-JP",
    "Laos": "CTRY-LA",
    "Mauritius": "CTRY-MU",
    "Philippines": "CTRY-PH",
    "Russia": "CTRY-RU",
    "South Korea": "CTRY-KR",
    "Taiwan": "CTRY-TW",
    "Thailand": "CTRY-TH",
    "USA": "CTRY-US",
    "United Kingdom": "CTRY-GB",
    "Vietnam": "CTRY-VN",
}


def clean(value: object) -> str:
    if pd.isna(value):
        return ""
    return re.sub(r"\s+", " ", str(value).strip())


def stable_id(prefix: str, *parts: str) -> str:
    raw = "|".join(clean(part).lower() for part in parts if clean(part))
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()[:10].upper()
    return f"{prefix}-{digest}"


def read_contacts() -> pd.DataFrame:
    raw = pd.read_excel(SOURCE, sheet_name="📋 Contact ทั้งหมด", header=None, dtype=str)
    header = [clean(value) for value in raw.iloc[3].tolist()]
    df = raw.iloc[4:].copy()
    df.columns = header
    df = df.dropna(how="all")
    df = df[df["องค์กร / หน่วยงาน"].map(clean) != ""]
    return df


def build_seed_rows(df: pd.DataFrame) -> tuple[list[dict[str, str]], list[dict[str, str]]]:
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    orgs: dict[tuple[str, str], dict[str, str]] = {}
    contacts: list[dict[str, str]] = []

    for _, row in df.iterrows():
        org_name = clean(row.get("องค์กร / หน่วยงาน"))
        country = clean(row.get("ประเทศ"))
        key = (org_name.lower(), country.lower())
        org_id = stable_id("PORG", org_name, country)

        if key not in orgs:
            orgs[key] = {
                "partner_org_id": org_id,
                "org_name_en": org_name if not re.search(r"[\u0E00-\u0E7F]", org_name) else "",
                "org_name_th": org_name if re.search(r"[\u0E00-\u0E7F]", org_name) else "",
                "org_type": clean(row.get("ประเภทองค์กร")),
                "country_id": COUNTRY_IDS.get(country, ""),
                "country_name": country,
                "continent": clean(row.get("ทวีป")),
                "field_area": clean(row.get("สาขา / ด้าน")),
                "website": "",
                "status": "active",
                "source_note": "seeded_from_contact_v5",
                "created_at": now,
                "updated_at": now,
            }

        contact_name = clean(row.get("ชื่อ-นามสกุล"))
        email = clean(row.get("อีเมล"))
        phone = clean(row.get("โทรศัพท์"))
        position = clean(row.get("ตำแหน่ง"))
        note = clean(row.get("หมายเหตุ"))
        if contact_name or email or phone:
            contacts.append({
                "partner_contact_id": stable_id("PCON", org_id, contact_name, email, phone),
                "partner_org_id": org_id,
                "contact_name": contact_name,
                "position": position,
                "email": email,
                "phone": phone,
                "last_contact_date": clean(row.get("วันที่ติดต่อล่าสุด")),
                "relationship_level": clean(row.get("ระดับความสัมพันธ์")),
                "occasion_note": clean(row.get("พบในโอกาส / การเดินทาง")),
                "note": note,
                "status": "active",
                "created_at": now,
                "updated_at": now,
            })

    return list(orgs.values()), contacts


def write_csv(path: Path, headers: list[str], rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    df = read_contacts()
    orgs, contacts = build_seed_rows(df)
    write_csv(OUT_DIR / "PARTNER_ORG_MASTER_seed.csv", ORG_HEADERS, orgs)
    write_csv(OUT_DIR / "PARTNER_CONTACT_seed.csv", CONTACT_HEADERS, contacts)
    print(f"source_rows={len(df)}")
    print(f"partner_org_rows={len(orgs)}")
    print(f"partner_contact_rows={len(contacts)}")
    print(f"output_dir={OUT_DIR}")


if __name__ == "__main__":
    main()
