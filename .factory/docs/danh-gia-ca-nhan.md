# I. Primer

## 1. TL;DR kiểu Feynman

- Hiện hệ thống KPI đã có **Kế hoạch công tác** (bảng nhiệm vụ năm) nhưng **chưa có cơ chế đánh giá riêng cho từng cá nhân** bám theo một nhiệm vụ.
- Yêu cầu: thêm menu **"Đánh giá cá nhân"** (trong nhóm **Đánh giá chất lượng**), lấy **nhiệm vụ STT 1** của Kế hoạch công tác làm mẫu để đánh giá **mức độ hoàn thành** của từng cá nhân.
- Ta chỉ làm một luồng demo gọn: nhiệm vụ "Rà soát chuẩn đầu ra các CTĐT..." (4 việc con) → giao 3 nhân sự Phòng Đào tạo → mỗi người tự chấm + quản lý chấm → ra kết quả + xếp loại.
- Đổi tối thiểu: thêm 1 menu, thêm 1 API POST, thêm dữ liệu mẫu, thêm 1 trang. Không đụng các trang/API cũ.
- Mục đích: để khách hàng nhìn thấy trọn vòng "nhiệm vụ → cá nhân → đánh giá → kết quả".

## 2. Elaboration & Self-Explanation

Hệ thống hiện có bảng `WORK_PLAN` (trong `src/data/annual-work-plan.ts`) chứa các nhiệm vụ năm. Nhiệm vụ đầu tiên (code `1`) là "Rà soát chuẩn đầu ra các CTĐT theo hướng bổ sung năng lực số, AI, ĐMST", của Phòng Đào tạo (`u101`). Nhiệm vụ này có **4 việc con**: ĐT-01.1, ĐT-01.2, ĐT-01.3, ĐT-01.4 (mỗi việc ghi người chủ trì + hạn + đơn vị phối hợp).

Muốn "đánh giá cá nhân", ta gán mỗi việc con cho **một nhân sự cụ thể** trong `users.json` của Phòng Đào tạo (u003 Trần Thu Hà, u007 Phạm Thị Lan, u008 Đỗ Minh Châu). Một cá nhân có thể phụ trách nhiều việc con.

Mỗi cá nhân sẽ có một bản ghi đánh giá trong `individual-evaluations.json`, gồm: `selfScore` (tự chấm), `selfComment`, `managerScore` (quản lý chấm), `managerComment`, rồi hệ thống tính `finalScore` + `grade` (xếp loại) theo mức hoàn thành. Người quản lý bấm **"Khởi tạo đánh giá"** để tạo sẵn bản ghi dang dở cho các cá nhân được giao (nếu chưa có), tránh tạo trùng.

## 3. Concrete Examples & Analogies

Ví dụ bám sát repo:
- Nhiệm vụ STT 1 (`code: '1'`) trong `src/data/annual-work-plan.ts:50-59` có việc con `ĐT-01.1` "Thành lập tổ công tác rà soát CĐR..." → gán cho `u003 Trần Thu Hà`.
- Trên trang **Đánh giá cá nhân**, hàng `ĐT-01.1` hiển thị: Người được giao = Trần Thu Hà · Hạn 2026-08-10 · Tự chấm 9 · Quản lý chấm 8 · Kết quả 8 · Xếp loại "Hoàn thành".
- Người quản lý xem một bảng tổng hợp, mỗi dòng là một việc con + người phụ trách + điểm.

Analogy đời thường: giống **bảng chấm công/đánh giá nhân viên cuối kỳ** — mỗi nhân viên có một đầu việc được giao, tự đánh giá, cấp trên đánh giá, rồi tổng kết xếp loại. Dữ liệu được lưu thành "phiếu đánh giá" cho từng người.

# II. Audit Summary (Tóm tắt kiểm tra)

- `src/data/annual-work-plan.ts:48-59` chứa `WORK_PLAN`; nhiệm vụ code `1` (Phòng Đào tạo `u101`) có 4 việc con ĐT-01.1..4 (evidence: đã đọc file).
- `src/data/individual-evaluations.json` có 200 record mẫu, cấu trúc gồm `selfScore/managerScore/councilScore/finalScore/grade/status` (evidence: đọc mẫu record `unit_pdt`).
- `src/app/api/evaluation/individual/route.ts` **chỉ có GET** — chưa có POST để khởi tạo đánh giá mới (evidence: đọc file, 34 dòng, không có handler POST).
- `src/app/api/evaluation/individual/[id]/route.ts` có PUT với whitelist field (evidence: đã đọc).
- `src/components/layout/Sidebar.tsx:52-61` menu cha "Đánh giá chất lượng" (`/quality`) hiện có 2 mục: "Đánh giá KPI", "Xếp loại chất lượng" (evidence: đã đọc).
- `src/data/units.json`: `u101` = Phòng Đào tạo; `src/data/users.json`: `u003` Trần Thu Hà, `u007` Phạm Thị Lan, `u008` Đỗ Minh Châu đều thuộc `u101` (evidence: đã đọc).

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)

Không phải là sửa bug; đây là **thiếu tính năng**. Nguyên nhân "gốc" của việc chưa đánh giá được cá nhân:
1. Sidebar thiếu menu truy cập "Đánh giá cá nhân".
2. API `individual-evaluations` thiếu POST để khởi tạo.
3. Chưa có trang UI tổng hợp đánh giá cá nhân theo nhiệm vụ công tác.
4. `individual-evaluations.json` chưa có record khớp đơn vị `u101` + người `users.json` để demo.

Giả thuyết đối chứng:
- Có thể tận dụng trang `/kpi/evaluation` hiện có → NHƯNG nó đọc `kpi-evaluation.ts` (hardcode) và thuộc phạm vi khác; giữ nguyên để tránh vỡ.
- Có thể chỉ thêm bảng hiển thị mà không cần API POST → NHƯNG cần nút "Khởi tạo đánh giá" tạo bản ghi, nên POST cần thiết.

Kết luận: thêm menu + POST + seed + trang là hướng tối thiểu, đúng yêu cầu demo.

# IV. Proposal (Đề xuất)

Thực hiện tối thiểu theo 4 thay đổi:

a) **Menu**: thêm mục "Đánh giá cá nhân" (`/kpi/individual-evaluation`) vào children của `Đánh giá chất lượng` trong `Sidebar.tsx`.

b) **API**: thêm handler `POST` vào `src/app/api/evaluation/individual/route.ts` để khởi tạo bản ghi đánh giá mới (UPSERT theo `personId` để không trùng), sinh `id` theo pattern `EVL_i_...`.

c) **Seed data**: thêm 4 record demo (cho ĐT-01.1..4) vào `individual-evaluations.json` với `unitId/personUnitId = u101`, `personId/personName` = u003/u007/u008. Không ghi đè record cũ.

d) **Trang**: tạo `/kpi/individual-evaluation/page.tsx`:
- Lấy `WORK_PLAN[0]` (nhiệm vụ STT 1) + `users.json` + `units.json`.
- Header: tên nhiệm vụ + đơn vị + nút "Khởi tạo đánh giá".
- Bảng đánh giá: mỗi hàng = 1 việc con (ĐT-01.x), hiện người được giao, hạn, tự chấm, quản lý chấm, kết quả, xếp loại; cho phép nhập điểm (self/manager).
- Tính `finalScore`/`grade` đơn giản theo thang mức hoàn thành.

# V. Files Impacted (Tệp bị ảnh hưởng)

- `Sửa: src/components/layout/Sidebar.tsx` — hiện định nghĩa menu; thêm 1 mục con "Đánh giá cá nhân".
- `Sửa: src/app/api/evaluation/individual/route.ts` — hiện chỉ GET; thêm handler POST khởi tạo.
- `Sửa: src/data/individual-evaluations.json` — hiện 200 record mẫu; thêm 4 record demo cho u101.
- `Thêm: src/app/kpi/individual-evaluation/page.tsx` — trang đánh giá cá nhân mới (hiện chưa tồn tại).

# VI. Execution Preview (Xem trước thực thi)

1. Đọc lại các file liên quan (đã đọc).
2. Sửa Sidebar thêm menu.
3. Sửa API thêm POST.
4. Seed JSON thêm 4 record.
5. Tạo trang mới.
6. Chạy `npx tsc --noEmit`; review tĩnh.
7. Commit.

# VII. Verification Plan (Kế hoạch kiểm chứng)

- `npx tsc --noEmit` (sau khi đổi code/TS) — không lỗi type.
- JSON `individual-evaluations.json` hợp lệ, có record u101, không ghi đè record cũ (kiểm tra count 200 → 204).
- Review tĩnh: mapping việc con→người, tính điểm/grade null-safe, lọc đúng u101.
- Runtime/integration do tester phụ trách (theo AGENTS.md, không tự chạy lint/build/dev).

# VIII. Todo

- [ ] Thêm menu Sidebar
- [ ] Thêm API POST individual-evaluations
- [ ] Seed 4 record demo
- [ ] Tạo trang /kpi/individual-evaluation
- [ ] tsc + review
- [ ] Commit

# IX. Acceptance Criteria (Tiêu chí chấp nhận)

- Menu "Đánh giá chất lượng" hiển thị thêm mục "Đánh giá cá nhân", bấm vào mở được trang.
- Trang hiển thị nhiệm vụ STT 1 "Rà soát chuẩn đầu ra..." + 4 việc con với người được giao (u003/u007/u008).
- Nút "Khởi tạo đánh giá" tạo bản ghi trong `individual-evaluations.json` (không trùng).
- Cá nhân nhập `selfScore`/`selfComment`; quản lý nhập `managerScore`/`managerComment`; hiển thị `finalScore` + `grade`.
- Không ảnh hưởng trang/API cũ; `package.json` và file lock không đổi.

# X. Risk / Rollback (Rủi ro / Hoàn tác)

- Rủi ro thấp: thay đổi diện hẹp (menu + 1 API + 1 trang + seed). Rollback đơn giản: bỏ commit `git revert` hoặc xóa file mới + gỡ menu.
- Seed thêm record — nếu không muốn, xóa record thêm; không ảnh hưởng 200 record gốc.

# XI. Out of Scope (Ngoài phạm vi)

- Sửa trang `/kpi/evaluation`, `/kpi/task-assignment`, `/kpi/my-kpi`.
- Triển khai toàn bộ nhiệm vụ (chỉ demo nhiệm vụ STT 1).
- Công thức 70/30 / tính phức tạp; chỉ tính điểm đơn giản theo mức hoàn thành.
- Push lên remote (chỉ commit local).
