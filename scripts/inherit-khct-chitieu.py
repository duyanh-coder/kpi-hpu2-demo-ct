import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KHCT = ROOT / 'src' / 'data' / 'khct-catalog.json'
KPI = ROOT / 'src' / 'data' / 'school-kpi-catalog.json'

def load(p):
    with open(p, 'r', encoding='utf-8') as f:
        return json.load(f)

def save(p, data):
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    khct = load(KHCT)
    kpis = load(KPI)
    by_code = {k['code']: k for k in kpis}

    assigned = 0
    for t in khct:
        if t.get('chiTieu'):
            continue
        codes = [c.strip() for c in (t.get('kpiCodes') or '').split(';') if c.strip() and c.strip() != '—']
        targets = []
        for c in codes:
            k = by_code.get(c)
            if k and k.get('target'):
                targets.append(f"{c}: {k['target']}")
        if targets:
            t['chiTieu'] = '; '.join(targets)
            assigned += 1

    save(KHCT, khct)
    print(f'Gan chiTieu cho {assigned}/{len(khct)} task (KE THUA tu KPI truong)')
    with_chi = sum(1 for t in khct if t.get('chiTieu'))
    print(f'Tong task co chiTieu: {with_chi}')

if __name__ == '__main__':
    main()
