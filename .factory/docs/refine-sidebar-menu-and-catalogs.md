# I. Primer

## 1. TL;DR kiểu Feynman
- Menu Sidebar đang có quá nhiều mục (toàn bộ route của hệ thống) → khó demo nghiệp vụ. Yêu cầu: gom lại 4 nhóm nghiệp vụ, ẩn các mục không cần nhưng KHÔNG xóa trang/route.
- Menu mới: Trang chủ, Mục tiêu chiến lược (Mục tiêu → Quản lý phối cảnh + Mục tiêu chiến lược, Bộ KPI, Kế hoạch công tác, Kế hoạch đào tạo), Đánh giá chất lượng (Đánh giá KPI, Xếp loại chất lượng), Quản trị (Cấu hình hệ thống, Danh mục gồm 6 danh mục con).
- Cần 2 mức con lồng nhau (Mục tiêu, Danh mục) → Sidebar phải render đệ quy.
- "Danh mục" gồm 6 trang CRUD riêng; 5 trang nằm dưới `/admin/danh-muc/*` (mới), danh mục Chu kỳ dùng lại trang có sẵn `/kpi/cycles`.

## 2. Elaboration & Self-Explanation
Menu cũ hiển thị toàn bộ route (hơn 40 mục) khiến khi demo KPI, người thao tác khó tìm chức năng đúng nghiệp vụ. Yêu cầu chỉ giữ các mục phục vụ luồng demo: chiến lược → bộ KPI → kế hoạch → đánh giá → xếp loại, cộng khối quản trị (cấu hình + danh mục). Các mục khác vẫn còn đường dẫn và trang, chỉ ẩn khỏi menu.

## 3. Concrete Examples & Analogies
- Giống dọn tủ: không vứt đồ, chỉ cất đồ chưa dùng vào ngăn kéo; menu là "ngăn kéo trưng bày" chỉ để các mục hay dùng.
- "Danh mục Lĩnh vực KPI" năm nhóm khác với "Lĩnh vực công tác" vài nhóm: Lĩnh vực KPI = `kpi-group-catalog` (7 nhóm, có trọng số), Lĩnh vực công tác = `kpi-groups` (13 nhóm, có mô tả).

# II. Audit Summary (Tóm tắt kiểm tra)
- Đọc `src/components/layout/Sidebar.tsx` (cấu trúc MenuItem 2 cấp, icon, expandedGroups), `Header.tsx`, `ClientLayout.tsx` (props isOpen/onClose).
- Đọc toàn bộ route page có sẵn để ánh xạ mục menu → path.
- Verify 5 API danh mục (GET/POST/PUT/DELETE + `[id]` route) đều tồn tại: measurement-units, grading-levels, kpi-group-catalog, kpi-groups, units.
- Đọc POST route: phát hiện `kpi-groups` POST không ghi `description/status` (khác shape data trong `kpi-groups.json`); `measurement-units` POST bỏ qua `code` (data có `code`).
- Backup data + db + Sidebar trước khi sửa: `kpi-menu-backup_20260828_094519`. Git status sạch trước khi sửa.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
- Menu dài do thiết kế cũ liệt kê toàn bộ route; không có mức phục vụ "demo nghiệp vụ".
- KHÔNG có bug ở data; vấn đề là hiển thị menu và 2 API POST chưa khớp shape data (gây dữ liệu thiếu field khi CRUD qua UI mới) → patch tối thiểu.
- Confidence: High — do đọc trực tiếp file menu, route, API.

# IV. Proposal (Đề xuất)
1. Rewrite `Sidebar.tsx`: cấu trúc `MenuItem` (icon + children lồng nhau), render đệ quy theo depth, group button toggle mở/con, submenu con (Mục tiêu, Danh mục) toggle, chỉ set active trên leaf/link thật (không dùng startsWith trên group giả), giữ chip logo + nút đóng mobile. Các route không nằm trong menu: bỏ khỏi `menuItems`.
2. Patch tối thiểu 2 API:
   - `kpi-groups` POST: lưu `description`, `status`, bỏ `academicYearId/defaultWeight/targetLevel` cho khớp `kpi-groups.json` shape.
   - `measurement-units` POST: thêm `code`.
3. Tạo component dùng chung `src/components/admin/CrudTable.tsx` (config-driven: columns + fields) để 5 trang CRUD không lặp code.
4. Tạo 5 trang `/admin/danh-muc/*`: đơn vị tính, điều kiện đánh giá, Lĩnh vực KPI, Lĩnh vực công tác, đơn vị. Danh mục chu kỳ dùng `/kpi/cycles` có sẵn.

# V. Files Impacted (Tệp bị ảnh hưởng)
- Sửa: `src/components/layout/Sidebar.tsx` — menu mới, render đệ quy 3 cấp.
- Sửa: `src/app/api/kpi-groups/route.ts` — POST lưu description/status, shape khớp data.
- Sửa: `src/app/api/measurement-units/route.ts` — POST lưu code.
- Thêm: `src/components/admin/CrudTable.tsx` — bảng CRUD + modal form dùng chung.
- Thêm (và trang wrapper 5 trang): `src/app/admin/danh-muc/don-vi-tinh/page.tsx`, `dieu-kien-danh-gia/page.tsx`, `linh-vuc-kpi/page.tsx`, `linh-vuc-cong-tac/page.tsx`, `don-vi/page.tsx`.

# VI. Execution Preview (Xem trước thực thi)
1. Sửa Sidebar (menu + đệ quy + active logic).
2. Patch 2 API POST.
3. Tạo CrudTable component.
4. Tạo 5 trang CRUD.
5. Chạy `npx tsc --noEmit` — pass.
6. Commit kèm spec.

# VII. Verification Plan (Kế hoạch kiểm chứng)
- `npx tsc --noEmit` pass (đã chạy, không lỗi).
- Verify đường dẫn 5 API `[id]` tồn tại.
- (Tester chịu trách nhiệm runtime) Mở các trang `/admin/danh-muc/*`, thêm/sửa/xóa 1 bản ghi mỗi trang; kiểm tra menu 3 cấp + chỉ mục active đúng; kiểm tra `/kpi/cycles` vẫn hoạt động.

# VIII. Todo
- [x] Backup data + db + Sidebar.
- [x] Rewrite Sidebar menu mới.
- [x] Patch POST kpi-groups + measurement-units.
- [x] Tạo CrudTable + 5 trang danh mục.
- [x] Typecheck.
- [x] Commit.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Menu chỉ còn 4 nhóm + mục Trang chủ; 3 cấp đúng (group → submenu → link).
- Mở các trang `/admin/danh-muc/*`: CRUD hoạt động, dữ liệu lưu đủ field (`code`, `description`, `status`).
- Các route cũ không nằm menu vẫn truy cập trực tiếp qua URL được.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
- Patch POST kpi-groups đổi shape tạo mới — không nơi nào trong `src` gọi `/api/kpi-groups` (đã grep), an toàn.
- Rollback: `git revert` 1 commit; dữ liệu được backup `kpi-menu-backup_20260828_094519`.

# XI. Out of Scope (Ngoài phạm vi)
- Không xóa route/trang, không thay đổi UI ngoài Sidebar và 5 trang mới, không chỉnh dữ liệu JSON bằng tay.

# XII. Open Questions (Câu hỏi mở)
- Không.