import csv
import json
from pathlib import Path


MAPPING_PATH = Path(r"D:\DATA_MASTER_ Students_Staff\approved_unit_mapping_review.json")
OUTPUT_PATH = Path(r"D:\DATA_MASTER_ Students_Staff\UP_UNIT_MASTER_ADDITIONS_REVIEW_2026-05-22.csv")


def derive_unit_code(unit_id: str) -> str:
    if not unit_id:
        return ""
    return unit_id.replace("UPUNIT-", "", 1)


def infer_unit_type(name: str) -> str:
    name = name or ""
    if name.startswith("กอง"):
        return "กอง"
    if name.startswith("ศูนย์"):
        return "ศูนย์"
    if name.startswith("สำนัก") or name.startswith("สำนักงาน"):
        return "สำนักงาน"
    if name.startswith("สถาบัน"):
        return "สถาบัน"
    if "วิทยาเขต" in name:
        return "วิทยาเขต"
    if name.startswith("หน่วย"):
        return "หน่วย"
    return "อื่นๆ"


def main():
    data = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
    rows = []
    for row in data["review_rows"]:
        if row.get("proposed_action") not in ("add_active_unit", "add_inactive_unit"):
            continue
        unit_id = row.get("approved_unit_id") or row.get("proposed_unit_id") or ""
        source_name = row.get("source_unit_name") or ""
        rows.append(
            {
                "unit_id": unit_id,
                "unit_code": derive_unit_code(unit_id),
                "unit_name_th": source_name,
                "unit_name_en": "",
                "unit_type": infer_unit_type(source_name),
                "parent_unit_id": "",
                "active": "TRUE" if row.get("proposed_action") == "add_active_unit" else "FALSE",
                "sort_order": "",
                "source_type": row.get("source_type") or "",
                "source_row_count": row.get("source_row_count") or "",
                "review_note": row.get("review_note") or "",
            }
        )

    fieldnames = [
        "unit_id",
        "unit_code",
        "unit_name_th",
        "unit_name_en",
        "unit_type",
        "parent_unit_id",
        "active",
        "sort_order",
        "source_type",
        "source_row_count",
        "review_note",
    ]
    with OUTPUT_PATH.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(str(OUTPUT_PATH))
    print(f"rows {len(rows)}")


if __name__ == "__main__":
    main()
