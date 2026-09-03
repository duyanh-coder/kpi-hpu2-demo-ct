import json, os

path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "school-kpi-catalog.json")
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Mapping categoryId (from kpi-group-catalog.json) -> strategicObjectiveId
CAT_TO_SO = {
    "grp_dt":     "so001",   # Đào tạo
    "grp_ts":     "so001",   # Tuyển sinh
    "grp_dbcl":   "so001",   # Đảm bảo chất lượng
    "grp_nn":     "so001",   # Ngôn ngữ
    "grp_kh":     "so002",   # KHCN
    "grp_dmst":   "so002",   # Đổi mới sáng tạo
    "grp_doi_ngu":"so003",   # Đội ngũ
    "grp_qt":     "so004",   # Quản trị
    "grp_quan_tri":"so004",  # Quản trị (variant)
    "grp_td":     "so004",   # Thi đua
    "grp_cds":    "so005",   # Chuyển đổi số
    "grp_bd":     "so005",   # Bình dân học vụ
    "grp_ht":     "so006",   # Hợp tác
    "grp_qth":    "so006",   # Quốc tế hóa
}

mapped = 0
for item in data:
    cat = item.get("categoryId", "")
    so_id = CAT_TO_SO.get(cat, "")
    if so_id:
        item["strategicObjectiveId"] = so_id
        mapped += 1

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Mapped {mapped}/{len(data)} records")

# Show summary
from collections import Counter
so_counts = Counter(item.get("strategicObjectiveId","") for item in data)
for so, cnt in sorted(so_counts.items()):
    print(f"  {so}: {cnt}")
