import json, re, os

MAP = {
    "P. Đào tạo": "Phòng Đào tạo",
    "Phòng Đào tạo": "Phòng Đào tạo",
    "P. KHCN và HTQT": "Phòng Khoa học Công nghệ và Hợp tác Quốc tế",
    "P. TCCB": "Phòng Tổ chức Cán bộ",
    "Phòng TCCB": "Phòng Tổ chức Cán bộ",
    "P. Hành chính": "Phòng Hành chính",
    "P. KHTC": "Phòng Kế hoạch Tài chính",
    "P. QLCSVC": "Phòng Quản lý Cơ sở vật chất",
    "P. CTCT-HSSV": "Phòng Công tác chính trị - Học sinh sinh viên",
    "K. Toán": "Khoa Toán",
    "Khoa Toán": "Khoa Toán",
    "K. Ngữ văn": "Khoa Ngữ văn",
    "K. Lịch sử": "Khoa Lịch sử",
    "K. Sinh học": "Khoa Sinh học",
    "K. Vật lý": "Khoa Vật lý",
    "K. Hóa học": "Khoa Hóa học",
    "Khoa Hoá học": "Khoa Hóa học",
    "K. GDCT": "Khoa Giáo dục Chính trị",
    "K. Tiếng Anh": "Khoa Tiếng Anh",
    "Khoa Tiếng Anh": "Khoa Tiếng Anh",
    "K. TTQ": "Khoa Tiếng Trung Quốc",
    "K. GDTH": "Khoa Giáo dục Tiểu học",
    "K. GDMN": "Khoa Giáo dục Mầm non",
    "K. KHTDTT": "Khoa Khoa học Thể dục thể thao",
    "K. TL-GD": "Khoa Tâm lý - Giáo dục",
    "V. NCSP": "Viện Nghiên cứu Sư phạm",
    "V. NCKH&UD": "Viện Nghiên cứu Khoa học và Ứng dụng",
    "V. CNTT": "Viện Công nghệ thông tin",
    "TT. Khảo thí và ĐBCLGD": "Trung tâm Khảo thí và Đảm bảo chất lượng giáo dục",
    "TT. HL&TT": "Trung tâm Học liệu và Truyền thông",
    "TT. GDQP&AN": "Trung tâm Giáo dục Quốc phòng và An ninh",
    "TT. Tin học": "Trung tâm Tin học",
    "T. THCS và THPTSP": "Trường THCS và THPT Sư phạm",
    "ĐTN-HSV": "Đoàn Thanh niên - Hội Sinh viên",
    "ĐTN": "Đoàn Thanh niên",
    "Ban Giám hiệu": "Ban Giám hiệu",
    "Công đoàn Trường": "Công đoàn Trường",
}

def strip_parenthetical(s):
    """Remove trailing parenthetical like '(Tổ Tư vấn Tâm lý - Giáo dục)'"""
    return re.sub(r'\s*\(.*?\)\s*$', '', s).strip()

def normalize_unit(name):
    name = name.strip()
    if name in MAP:
        return MAP[name]
    base = strip_parenthetical(name)
    if base in MAP:
        return MAP[base]
    return name

def normalize_composite(value):
    if ";" not in value:
        return normalize_unit(value)
    parts = [p.strip() for p in value.split(";")]
    return "; ".join(normalize_unit(p) for p in parts)

path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "khct-catalog.json")
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

changed = 0
for item in data:
    old = item.get("responsibleUnit", "")
    new = normalize_composite(old)
    if old != new:
        item["responsibleUnit"] = new
        changed += 1

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Show final unique values
units = sorted(set(item.get("responsibleUnit","") for item in data))
print(f"Updated: {changed} records")
print(f"Unique units: {len(units)}")
for u in units:
    print(f"  {u}")
