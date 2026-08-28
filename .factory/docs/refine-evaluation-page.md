# I. Primer

## 1. TL;DR kiểu Feynman
- Trang `Đánh giá KPI Đơn vị` hiện sai nhiều chỗ vì code đang map theo một hệ dữ liệu cũ (id `c001..c004`, `ay001/002/003`), trong khi dữ liệu thật trong `src/data` dùng id khác và status khác.
- Trang hiện hiển thị: nút lọc trạng thái không khớp dữ liệu, ô "Điểm TB" chỉ có giá trị sau khi mở modal, cột "Chu kỳ" hiện id thô `c001`, cột "Mã" hiện id dài dòng, modal luôn hiện "Tỷ lệ đạt: -", nút thao tác chỉ icon 14px không nhãn.
- Sửa tất cả trong duy nhất file `src/app/kpi/evaluation/page.tsx`; không thêm route, không đổi schema data, không xóa thêm dữ liệu.
- Dữ liệu rác đã được dọn sạch trước đó (77 bản ghi orphan) bằng commit `b0a796f`; backup đầy đủ ở `C:\Users\cuscsoft\AppData\Local\Temp\opencode\kpi-data-backup_20260828_081742`.

## 2. Elaboration & Self-Explanation
Trang này đọc 3 nguồn chính: `/api/evaluation` (danh sách đánh giá đơn vị), `/api/plans` (đơn vị được đánh giá + chu kỳ), `/api/plan-items` (chỉ tiêu + nhiệm vụ con). Nó map `planId → plan → cycleId → năm học` để lọc theo tab năm.

Vấn đề gốc: dữ liệu `plans.json` dùng `cycleId = c001..c004`, nhưng `cycles.json` hiện chỉ có `cycle_hpu2_*`. Vì vậy bảng map `cycle → year` không tìm được `c001..c004`, dẫn tới:
- Lọc năm học không hoạt động (mọi đánh giá luôn được giữ).
- Tab mặc định `ay002` không tồn tại trong `academic-years.json` (`ay_hpu2_*` là id thật).

Tương tự, `evaluations.json` chỉ dùng 3 trạng thái `pending / submitted / approved`, trong khi `statusConfig` và nút lọc trong code dùng `self_evaluated / manager_review / evaluated / locked` → trạng thái luôn rơi vào fallback "Chưa bắt đầu", thẻ "Đã khóa" luôn bằng 0.

Cách sửa: giữ nguyên dữ liệu, bổ sung một bảng mapping cố định cho `c001/c004 → năm học mới`, cập nhật `statusConfig` theo status thật, tính toán thống kê từ dữ liệu đã tải (thay vì state modal), và làm rõ cột thông tin (chu kỳ = tên năm, thêm cột Xếp loại, tỷ lệ đạt trong modal tính từ `children.ratio`).

## 3. Concrete Examples & Analogies
Ví dụ thật trong data: đánh giá `EVL_plan_unit_pdt_c001` (Phòng Đào tạo) có `planId → plan_unit_pdt_c001 → cycleId c001`. Hiện tại chu kỳ hiển thị là "c001" — người dùng không hiểu. Sau sửa, hiển thị "2025-2026".

Tương tự, modal xem chi tiết Phòng Đào tạo có 12 chỉ tiêu, mỗi chỉ tiêu có `children` (như `ĐT-01.1`, `ĐT-02.3`) mang `ratio` và `status ĐẠT/CHƯA ĐẠT`. Hiện cột "Tỷ lệ đạt" luôn hiển thị "-" mặc dù dữ liệu có sẵn — giống như bạn có số liệu trong ngăn kéo nhưng lại dán giấy trắng lên bảng điểm. Sau sửa, tỷ lệ đạt tính từ số con đạt / tổng con.

Analogy đời thường: GBản đồ cũ viết tên đường bằng mã số (P.12→Q.5); dân cư mới không ai hiểu. Ta không đào lại đường, chỉ thay tấm bảng biển cho khớp với tên thật — dữ liệu gốc không đổi, hệ thống không đổi, chỉ sửa cách hiển thị.

# II. Audit Summary (Tóm tắt kiểm tra)

Kiểm tra trên dữ liệu thật trong `src/data` sau commit cleanup `b0a796f`:

| Hạng mục | Kết quả kiểm tra | Evidence |
|---|---|---|
| Status thật của evaluations | `pending` (35), `approved` (32), `submitted` (4) | `evaluations.json` |
| `statusConfig` hiện tại | `pending, self_evaluated, manager_review, council_review, evaluated, locked` — chỉ khớp `pending`, thiếu `submitted/approved` | `page.tsx:82` |
| Nút lọc trạng thái | `all, pending, self_evaluated, manager_review, evaluated, locked` — 4/6 không có dữ liệu tương ứng | `page.tsx:278` |
| `plans.cycleId` | `c001..c004`; `cycles.json` chỉ có `cycle_hpu2_*` → không map được | `plans.json`, `cycles.json` |
| `academic-years.json` | chỉ có `ay_hpu2_2025_2026`, `ay_hpu2_2026_2027`; tab mặc định `'ay002'` (page.tsx:100) không tồn tại | `academic-years.json` |
| Thẻ "Đã khóa" | lọc `status === 'locked'` → luôn 0 vì data không có `locked` | `page.tsx:221` |
| Thẻ "Điểm TB" | tính từ state `scores` chỉ được nạp khi mở modal → sai trước khi mở | `page.tsx:266` |
| Cột "Chu kỳ" | hiển thị id thô `c001` | `page.tsx:302` |
| Cột "Mã" | hiển thị id dài `EVL_plan_unit_pdt_c001` | `page.tsx:300` |
| Modal cột "Tỷ lệ đạt" | hardcode `-` mặc dù dữ liệu `children.ratio` sẵn có | `page.tsx:357` |
| Nút thao tác | icon 14px không nhãn, 3 nút (đánh giá / khóa / khiếu nại) | `page.tsx:309` |
| Nút "Khóa kết quả" | set `status: 'approved'` — khớp với status thật | `page.tsx:214` |
| `GET /api/scores` không tham số | trả toàn bộ scores (707 records hiện tại) | `api/scores/route.ts:39` |

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)

Root cause chính: trang được viết trên giả định hệ dữ liệu cũ (thể hiện qua `statusConfig`, nút lọc status, tab năm `ay002`, `cycleYearMap` đọc từ `cycles.json`), nhưng dữ liệu hiện tại trong repo thuộc một hệ id/status khác.

1. Triệu chứng: trạng thái luôn "Chưa bắt đầu", thẻ "Đã khóa" = 0, lọc năm không chạy, điểm TB sai.
2. Phạm vi: riêng trang `/kpi/evaluation`; không ảnh hưởng route API.
3. Tái hiện ổn định: đúng với mọi lần tải trang, vì dữ liệu tĩnh trong `src/data`.
4. Mốc thay đổi: dữ liệu được đổi sang nhánh HPU2 (id `ay_hpu2_*`, `cycle_hpu2_*`) nhưng page chưa được cập nhật tương ứng (commit last liên quan page này là `96716f8`; sau đó data có `2843ba1`, `4c14046`).
5. Dữ liệu thiếu: không cần — xác nhận trực tiếp bằng file, không qua runtime.
6. Giả thuyết thay thế: không có nào hợp lý hơn; các mismatch đều trực quan qua đọc file.
7. Rủi ro nếu fix sai: thay đổi hiển thị nhưng không phá vỡ logic lưu (chỉ PUT score/children/status như cũ).
8. Tiêu chí pass/fail: trang hiển thị đúng status, lọc năm đúng (18 đánh giá cho 2025-2026, 15 cho 2026-2027, 0 cho năm còn lại), điểm TB không còn phụ thuộc modal, nút thao tác có nhãn, modal hiện tỷ lệ đạt thật.

Counter-hypothesis (đã loại trừ):
- Giả thuyết "data thiếu status mới cần seed lại": Sai, vì `evaluations.json` đã có đủ `pending/submitted/approved` — chỉ thiếu hiển thị (`statusConfig`).
- Giả thuyết "cần đổi cả `cycles.json`/`academic-years.json` về id cũ": Sai, nằm ngoài scope và có thể gây hồi quy các trang khác; chỉ cần mapping cục bộ.

# IV. Proposal (Đề xuất)

Chỉnh file `src/app/kpi/evaluation/page.tsx` với 6 thay đổi:

a) **`statusConfig` khớp dữ liệu thật** — bổ sung `submitted` ("Đã nộp", màu xanh) và `approved` ("Đã phê duyệt", màu green); các khóa cũ không còn dữ liệu thì giữ fallback sang `pending` nếu gặp.

b) **Nút lọc trạng thái động** — thay danh sách cứng bằng `['all', 'pending', 'submitted', 'approved']`.

c) **Mapping năm học cố định** — thêm hằng số `LEGACY_CYCLE_YEAR_MAP = { c001: 'ay_hpu2_2025_2026', c004: 'ay_hpu2_2026_2027' }`; chu kỳ `c002/c003` thuộc 2024-2025, không nằm trong 2 tab hiển thị nên không gán (không hiển thị). Đổi tab mặc định thành `ay_hpu2_2025_2026` vì dữ liệu Excel đánh giá tháng 8/2026 thuộc năm học 2025-2026. Khi `selectedYearId` là vị trí đầu tiên hợp lệ trong `academic-years`.

d) **Thống kê đúng** — tải scores một lần khi mount (không chỉ khi mở modal). Thẻ "Điểm TB" = trung bình `finalScore` của các score thuộc plan-items của các plan trong năm đang lọc (nếu không có score → `-`). Thẻ "Đã khóa" đổi thành `status === 'approved'`. Thẻ "Chưa hoàn thành" = `status === 'pending'`.

e) **Bảng rõ ràng** — cột "Mã" hiển thị id rút gọn (lấy phần sau dấu `_` cuối nếu là dạng `EVL_...` ngược lại giữ nguyên); cột "Chu kỳ" hiển thị tên năm học (ví dụ "2025-2026"); thêm cột "Điểm TB / Xếp loại" tổng hợp từ scores của plan tương ứng (nếu không có score hiển thị `-`).

f) **Modal & nút thao tác** — nút thao tác đổi thành button có nhãn text nhỏ (icon + chữ "Đánh giá", "Khóa", "Khiếu nại"); cột "Tỷ lệ đạt" trong modal tính `đếm con ĐẠT / tổng con` (nếu `children` rỗng thì hiển thị `-`); nút Khóa xuất hiện khi status `evaluated` — vì data không có `evaluated`, đổi điều kiện sang `approved` (đã duyệt → cho phép khoá lại nếu cần) — giữ nguyên hành vi nhưng khớp dữ liệu.

# V. Files Impacted (Tệp bị ảnh hưởng)

## UI
- `Sửa: src/app/kpi/evaluation/page.tsx` — hiện đang render trang đánh giá đơn vị với các giả định hệ dữ liệu cũ; sẽ cập nhật statusConfig, filter, mapping năm, thống kê, bảng, modal, nút thao tác theo mô tả ở Proposal.

Các file khác không thay đổi (routes API, `src/data/*`, types, seed) — chỉ vận dụng API có sẵn.

# VI. Execution Preview (Xem trước thực thi)

Thứ tự thực hiện trên `page.tsx`:
1. Đọc lại toàn bộ file (đã đọc, 425 dòng).
2. Cập nhật `statusConfig` + gán icon/sub-màu cho `submitted`/`approved` (import sẵn CheckCircle, Clock, Star, Eye, Lock, Award — tái dùng).
3. Thêm hằng số `LEGACY_CYCLE_YEAR_MAP` và helper `getYearNameById`.
4. Sửa `useState` mặc định cho `selectedYearId`.
5. Bổ sung fetch scores trong `loadData` và tính toán thống kê bằng `useMemo`.
6. Sửa `yearFilteredEvals`, bảng, modal, nút.
7. Review tĩnh edge cases: năm không có mapping, unit không có tên (fallback id), score thiếu.
8. Chạy `bunx tsc --noEmit 2>&1 | Select-Object -First 10`.
9. Commit (kèm `.factory/docs`).

# VII. Verification Plan (Kế hoạch kiểm chứng)

- Typecheck: `bunx tsc --noEmit 2>&1 | Select-Object -First 10` (không lỗi TS).
- Data review tĩnh (không runtime): kiểm tra `evaluations.json` có 63 bản ghi `level=unit`, tất cả `planId` hợp lệ; `plans.json` 60 bản ghi, `cycleIds` là `c001..c004`.
- Kiểm tra mapping bằng đọc file: `c001 → ay_hpu2_2025_2026` (18 evaluations), `c004 → ay_hpu2_2026_2027` (15 evaluations), `c002/c003 → 2024-2025` (30 evaluations, không có tab).
- Tester runtime: tải trang, chọn từng tab năm, mở modal Phòng Đào tạo (12 chỉ tiêu, tỷ lệ đạt hiển thị số thay vì `-`), nhấn các nút có nhãn.

# VIII. Todo

- [x] Backup toàn bộ `src/data` + `db.ts` → `C:\Users\cuscsoft\AppData\Local\Temp\opencode\kpi-data-backup_20260828_081742`
- [x] Dọn 77 bản ghi orphan (plan-items/scores/evidences/approvals/evaluations) — commit `b0a796f`
- [ ] Cập nhật `statusConfig` + nút lọc trạng thái khớp `pending/submitted/approved`
- [ ] Thêm mapping năm học cố định `c001/c004` + đổi tab mặc định
- [ ] Tải scores khi mount + tính thẻ thống kê (Điểm TB, Đã khóa, Chưa hoàn thành)
- [ ] Cột Chu kỳ/Mã rõ ràng + thêm cột Xếp loại
- [ ] Modal hiển thị Tỷ lệ đạt thật; nút thao tác có nhãn
- [ ] Review tĩnh + `bunx tsc --noEmit`
- [ ] Commit (kèm `.factory/docs/refine-evaluation-page.md`)

# IX. Acceptance Criteria (Tiêu chí chấp nhận)

Pass nếu tất cả:
- Target 1: Trạng thái mỗi cột hiển thị đúng nhãn Việt (Chưa bắt đầu / Đã nộp / Đã phê duyệt); không còn trạng thái luôn "Chưa bắt đầu".
- Target 2: Lọc năm hoạt động: tab 2025-2026 hiện 18 đánh giá, tab 2026-2027 hiện 15 đánh giá; chuỗi `c002/c003` không lọt vào tab nào đang hiển thị.
- Target 3: Thẻ "Điểm TB" không đổi khi mở/đóng modal, và có giá trị khi dữ liệu scores của năm hiện tại tồn tại; thẻ "Đã khóa" = số `approved` của năm đang chọn.
- Target 4: Cột "Chu kỳ" hiển thị dạng "2025-2026" thay vì `c001`; cột "Mã" ngắn gọn.
- Target 5: Modal Phòng Đào tạo hiển thị "Tỷ lệ đạt" có giá trị (tính từ children) thay vì `-`; ví dụ `pi_TS07_c001` có 2/3 con ĐẠT → 67%.
- Target 6: Các nút thao tác hiển thị nhãn chữ; thao tác lưu điểm/khóa vẫn ghi đúng qua API như trước.
- Target 7: `bunx tsc --noEmit` sạch lỗi.

Fail nếu: trang vỡ layout, dữ liệu hiển thị sai chu kỳ/status, hoặc bất kỳ PUT/POST nào bị thay đổi ngữ nghĩa so với trước.

# X. Risk / Rollback (Rủi ro / Hoàn tác)

- Rủi ro thấp: chỉ sửa hiển thị trong 1 file, không đụng routes/dữ liệu.
- Rollback dễ: `git revert` commit cuối, hoặc khôi phục `page.tsx` từ git; backup dữ liệu vẫn còn nếu cần.
- Lưu ý: nếu sau này thêm tab 2024-2025 thì cần bổ sung `c002/c003` vào `LEGACY_CYCLE_YEAR_MAP` + thêm năm vào `academic-years.json` (ngoài scope hiện tại).

# XI. Out of Scope (Ngoài phạm vi)

- Không sửa routes API, không thêm/sửa schema dữ liệu (78 file JSON/TS riba `no`).
- Không sửa `individual-evaluations.json` (error sai unitId tiền tố `u_` thuộc dữ liệu Đánh giá cá nhân, đã báo nhưng không thuộc trang này).
- Không thêm tab "Đánh giá cá nhân" nội tuyến; vẫn dùng link điều hướng hiện có.
- Không thêm tính năng mới (export, dashboard).
- Không chạy lint/test runtime — theo AGENTS.md, verification runtime do tester đảm nhận.