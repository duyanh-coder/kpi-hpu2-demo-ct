import json
with open('src/data/school-kpi-catalog.json','r',encoding='utf-8') as f:
    data = json.load(f)
for item in data:
    if not item.get('strategicObjectiveId'):
        code = item['code']
        cat = item['categoryId']
        name = item['name'][:60]
        print(f"{code} | {cat} | {name}")
