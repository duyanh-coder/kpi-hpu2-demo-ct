# Baseline changes

## Menu
- Removed the entire "Nghiệp vụ KPI" menu group.
- Removed all /kpi/domain routes from src/app/kpi/domain.
- Removed src/components/kpi/DomainKPIPage.tsx.
- Moved "Bộ chỉ tiêu KPI" (/admin/kpi-data) into "① Thiết lập", directly below "Danh mục chỉ tiêu KPI".
- Removed "Bộ chỉ tiêu KPI" from "② Mục tiêu & KPI".
- Updated active-menu detection for /admin/kpi-data to expand "① Thiết lập".

## Note
No HPU2 business data restructuring was performed in this baseline cleanup.
