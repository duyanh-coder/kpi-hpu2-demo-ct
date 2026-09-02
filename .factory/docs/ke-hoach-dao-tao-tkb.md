# I. Primer

## 1. TL;DR kiểu Feynman
- Trang `/kpi/domain/training-program` hiện tại chỉ để nhập **số liệu KPI** của chương trình đào tạo (nhờ component `DomainKPIPage`).
- Yêu cầu mới: biến trang này thành nơi quản lý **Kế hoạch đào tạo năm học 2026-2027** (ma trận 52 tuần theo khóa/ngành, giống Phần C của PDF) và từ đó thêm **chức năng tạo Thời khóa biểu** (TKB) theo lớp học phần.
- Ý tưởng gọn: chia trang thành **2 tab** — (1) *Kế hoạch đào tạo*: bảng tuần × khóa/ngành đọc từ data tĩnh; (2) *Thời khóa biểu*: quản lý các tiết học theo lớp học phần, có CRUD lưu vào JSON.
- Dữ liệu TKB lưu trong `src/data/timelines.json` (hoặc `timetables.json`), có API route CRUD tương tự các module sẵn có (dùng `readDb`/`writeDb`).
- Mục tiêu: chưa đụng logic cũ, thêm mới an toàn, dễ rollback.

## 2. Elaboration & Self-Explanation
Tài liệu `QD ban hanh bo KPI chinh, KHCT, KHDT 2026-2027` ở trang 134-139 chứa **PHẦN C – KẾ HOẠCH ĐÀO TẠO 2026-2027**, gồm 2 bảng:

- **Đại học chính quy** (trang 134-136): ma trận **52 tuần** (tuần 17.8.2026 → 16.8.2027) × 4 khóa (K52, K51, K50, K49) × 2 ngành (CNSP, CNKH). Mỗi ô là một hoạt động: `Học HK x`, `Thi HK x`, `KTGHK`, `TTSP (Đợt x)`, `TTCN`, `GDQP&AN`, `SHCD-SV`, `Học HK phụ`, `Nghỉ Tết Đinh Mùi`,...
- **Thạc sĩ, tiến sĩ** (trang 137-139): ma trận tuần × Thạc sĩ (K30, K29) và Tiến sĩ (NCS) với học HK, xét tuyển, nhập học, KTGHK, thi, thực hiện/bảo vệ luận văn-đề án.

"Kế hoạch đào tạo" ở đây được hiểu là **bảng lịch theo tuần của toàn bộ hệ đào tạo**. Từ bảng này, "Thời khóa biểu" (TKB) là chi tiết hóa thành **các buổi học theo lớp học phần** (lớp, giảng viên, thứ, tiết, phòng, tuần học).

Code hiện có:
- `src/app/kpi/domain/training-program/page.tsx` — dùng `DomainKPIPage` với config `{ title, keywords }`.
- `src/components/kpi/DomainKPIPage.tsx` — bảng chỉ tiêu KPI + nhập kết quả.
- Pattern backend: data JSON trong `src/data/*.json`, đọc/ghi qua `src/lib/db.ts` (`readDb`/`writeDb`/`generateId`), API CRUD trong `src/app/api/<module>/route.ts` + `src/app/api/<module>/[id]/route.ts`.
- Menu `src/components/layout/Sidebar.tsx` dòng 48 đã có entry `/kpi/domain/training-program` label "Kế hoạch đào tạo".

## 3. Concrete Examples & Analogies
**Ví dụ cụ thể:** Trong PDF, tuần 17 (07.12-13.12.2026) có `Thi HK3` cho K52, `Thi HK5` cho K51, `Thi HK7` cho K50 và K49. Trang *Kế hoạch đào tạo* hiển thị chính xác ô đó. Khi bấm sang tab *Thời khóa biểu* và chọn lớp "Toán 1 – K52", người dùng thêm buổi "Thứ 2 – Tiết 1-3 – Phòng B201 – GV Nguyễn Văn A – tuần 1-15" rồi Lưu; dữ liệu ghi vào JSON và tải lại vẫn còn.

**Analogy đời thường:** Bảng Kế hoạch đào tạo giống **lịch năm học in trên giấy** (nhìn thấy cả 52 tuần ai học gì). Thời khóa biểu giống **cuốn lịch dạy của riêng từng lớp** — chi tiết tiết, phòng, giáo viên — mà người ta tự ghi vào. Tính năng mới cho phép cả tạo lẫn sửa cuốn lịch đó trên hệ thống.

---

# II. Audit Summary (Tóm tắt kiểm tra)
Đã rà:
- Trang `/kpi/domain/training-program/page.tsx` hiện chỉ render `DomainKPIPage` (nhập KPI), **không có** phần Kế hoạch đào tạo / TKB.
- `DomainKPIPage` config có `title`, `description?`, `keywords`; không liên quan đến lịch tuần.
- Toàn bộ `src/` **không có** bất kỳ chức năng `thoi-khoa-bieu`/`timetable`/`schedule` nào (đã grep tên kèm từ khóa TKB/timetable/schedule).
- Codebase dùng pattern JSON-db + API route CRUD đều đặn (vd `units`, `scheduled-reports`, `positions`...). Có sẵn `src/lib/db.ts`.
- Sidebar đã có menu entry cho route này ở `Sidebar.tsx:48`.

# III. Root Cause & Counter-Hypothesis (Nguyên nhân gốc & Giả thuyết đối chứng)
Đây **không phải** bug mà là **tính năng mới** (feature). Vì vậy không áp dụng root-cause theo nghĩa lỗi; xác định rõ phạm vi đề tránh đi lệch:
- Giả thuyết chính: hiện tại trang chỉ phục vụ "quản lý KPI chương trình đào tạo", chưa có khái niệm "kế hoạch đào tạo theo tuần" và "thời khóa biểu". → Cần thêm mới, bám pattern sẵn có.
- Giả thuyết đối chứng: có thể cho rằng nên làm trang **riêng** thay vì nằm chung trang training-program. → Counter: sidebar đã gắn label "Kế hoạch đào tạo" vào route này, nên đặt trong chính trang này (dạng tab) là tự nhiên nhất, ít phá vỡ navigation.

# IV. Proposal (Đề xuất)
## Cấu trúc tổng thể
Trang `/kpi/domain/training-program` giữ nguyên phần KPI hiện có và **thêm 2 tab**:
1. **Kế hoạch đào tạo** — ma trận 52 tuần × khóa/ngành (đọc từ data tĩnh).
2. **Thời khóa biểu** — CRUD tiết học theo lớp học phần.

Lưu ý: `DomainKPIPage` tự render `<h1>` riêng của nó, nên khi chuyển sang tab sẽ có 2 tầng tiêu đề. Xử lý: chỉ giữ tab hiển thị một ngăn nội dung tại một thời điểm (KPI hoặc Kế hoạch hoặc TKB), không render `DomainKPIPage` song song tiêu đề chính.

## A. Data tĩnh Kế hoạch đào tạo
Tạo `src/data/training-plan.ts` (hoặc `.json`) chứa:
- `WEEKS`: 52 tuần: `{ weekNo, start, end }` (17.8.2026 → 16.8.2027).
- `COHORTS`: định nghĩa cột: đại học `[{ code:'K52', major:'CNSP'|'CNKH' }, ...]`, thạc sĩ `[K30, K29]`, tiến sĩ `NCS`.
- `PLAN_GRID`: ma trận hoạt động `grid[weekNo][cohortKey] = 'Học HK 1' | ... | ''`. Điền dữ liệu theo PDF (ưu tiên gõ đủ 52 tuần cho từng cột; ô trống = '').
- `ABBREVIATIONS`: từ điển viết tắt (HK, DT, TTSP, TTCN, KLTN, GDQP&AN, SHCD-SV, HT.NVSP, NCS, TQĐC...).

## B. API + Data Thời khóa biểu (CRUD)
- Data: `src/data/timetables.json` — mảng `TimetableEntry`:
  ```ts
  interface TimetableEntry {
    id: string;
    cohortKey: string;   // vd 'K52_CNSP'
    semester: string;    // vd 'HK1' | 'HK2' | 'HK phụ' | 'Hè' — để lọc theo học kỳ
    className: string;   // vd 'Toán cao cấp 1'
    courseCode: string;
    teacher: string;
    room: string;
    weekday: number;     // 2..7 (Thứ 2..Chủ nhật)
    startPeriod: number;
    endPeriod: number;
    startWeek: number;
    endWeek: number;
  }
  ```
- API route mới: `src/app/api/timetables/route.ts` (GET, POST) và `src/app/api/timetables/[id]/route.ts` (PUT, DELETE) — theo đúng pattern `units`.
- Bảng khóa `cohortKey` được sinh từ danh sách cột (Hỗ trợ cả Thạc sĩ/Tiến sĩ nếu có muốn).

## C. UI – tab Kế hoạch đào tạo
- Bảng `table` với cột cố định `STT | Tuần | (từ-đến)` + 1 cột cho mỗi khóa/ngành.
- Header dòng chia theo cụm khóa (K52,K51,K50,K49) × CNSP/CNKH; tương tự Thạc sĩ/Tiến sĩ nếu có tab con.
- Ô màu nhẹ phân biệt loại hoạt động (Học HK, Thi, KTGHK, TTSP/TTCN, GDQP, Khác) để dễ đọc — giữ nhẹ nhàng, không lòe loẹt.
- Có nút chuyển loại hình (Đại học / Thạc sĩ-Tiến sĩ).

## D. UI – tab Thời khóa biểu (CRUD)
- Thanh lọc: chọn **học kỳ**, khóa/ngành, lớp học phần.
- Bảng: lớp, mã học phần, giảng viên, phòng, thứ, tiết, tuần, thao tác Sửa/Xoá.
- Form Modal (thêm/sửa): các trường trên (gồm `semester`) + `+ Thêm buổi`.
- Validate: `endPeriod >= startPeriod`, `endWeek >= startWeek`, bắt buộc teacher/room/className.
- Lưu qua API; tải lại từ JSON.

# V. Files Impacted (Tệp bị ảnh hưởng)
- `Sửa:` `src/app/kpi/domain/training-program/page.tsx` — thêm 2 tab, điều hướng giữa KPI / Kế hoạch đào tạo / TKB.
- `Thêm:` `src/data/training-plan.ts` — ma trận 52 tuần + khóa + viết tắt (dữ liệu tĩnh từ PDF).
- `Thêm:` `src/data/timetables.json` — kho chứa TKB (mảng rỗng ban đầu).
- `Thêm:` `src/app/api/timetables/route.ts` — GET/POST CRUD TKB.
- `Thêm:` `src/app/api/timetables/[id]/route.ts` — PUT/DELETE TKB.
- (Không thay đổi) `src/components/kpi/DomainKPIPage.tsx` — giữ nguyên; chỉ điều khiển hiện/ẩn ở trang cha.

# VI. Execution Preview (Xem trước thực thi)
1. Đọc `training-program/page.tsx`, `DomainKPIPage.tsx`, `Sidebar.tsx:48`, một route CRUD mẫu (`units`).
2. Tạo `src/data/training-plan.ts` (ma trận 52 tuần từ PDF).
3. Thêm UI tab "Kế hoạch đào tạo" (ma trận) vào trang.
4. Tạo `timetables.json` + 2 API route CRUD.
5. Thêm tab "Thời khóa biểu" + form CRUD.
6. Review tĩnh: typing, null-safety (ô trống ma trận, TKB rỗng), tương thích dữ liệu cũ, responsive.

# VII. Verification Plan (Kế hoạch kiểm chứng)
- Chạy `npx tsc --noEmit` (đã có thay đổi TS/TSX) — lọc output đầu.
- User (tester) kiểm tra runtime: mở trang, chuyển 3 tab, xem ma trận 52 tuần đúng dữ liệu PDF; tạo/sửa/xoá TKB rồi tải lại còn dữ liệu; lọc theo khóa/ngành hoạt động.
- Kiểm tra lưu JSON bền (timetables.json được ghi).

# VIII. Todo
- [ ] Khảo sát trước (đã xong).
- [ ] Tạo `src/data/training-plan.ts`.
- [ ] Tạo `timetables.json` + 2 API route.
- [ ] Thêm tab "Kế hoạch đào tạo" (ma trận) vào trang.
- [ ] Thêm tab "Thời khóa biểu" CRUD.
- [ ] Chạy `npx tsc --noEmit` và review tĩnh.

# IX. Acceptance Criteria (Tiêu chí chấp nhận)
- Trang `/kpi/domain/training-program` có đủ 2 tab mới (Kế hoạch đào tạo, Thời khóa biểu) bên cạnh KPI, chuyển tab mượt.
- Tab Kế hoạch đào tạo hiển thị ma trận 52 tuần, số liệu khớp Phần C PDF (nhập học, Học HK, Thi HK, KTGHK, TTSP/TTCN, GDQP, Tết,...).
- Tab Thời khóa biểu: tạo/sửa/xoá buổi học theo lớp học phần được; dữ liệu lưu bền sau reload.
- Lọc theo khóa/ngành/lớp hoạt động đúng.
- `npx tsc --noEmit` không lỗi.

# X. Risk / Rollback (Rủi ro / Hoàn tác)
- Risk: ma trận 52 tuần nhập tay dễ sai/thiếu ô so với PDF → mitigation: nhập kỹ theo từng trang, cho phép ô rỗng, không khối block.
- Risk: thay đổi trang chung có thể ảnh hưởng KPI có sẵn → mitigation: tách tab, giữ `DomainKPIPage` nguyên vẹn, chỉ thay đổi cấu trúc render trang cha.
- Rollback: xoá các file Thêm mới + revert đúng `training-program/page.tsx`; dữ liệu cũ (KPI) không bị đụng.
- Chưa có migration DB phức tạp (chỉ JSON mới).

# XI. Out of Scope (Ngoài phạm vi)
- Không tự động tạo TKB từ kế hoạch tuần (chỉ làm CRUD theo lớp học phần).
- Không xử lý xung đột phòng/giảng viên/tùng tiết (chỉ lưu dữ liệu).
- Không làm phân quyền chi tiết cho mặt TKB (giữ theo hệ thống có sẵn).
- Không import file Excel cho TKB.

# XII. Open Questions (Câu hỏi mở)
- Có cần nhập đầy đủ dữ liệu ma trận **Thạc sĩ/Tiến sĩ** ngay đợt này, hay chỉ Đại học chính quy? (Ảnh hưởng dung lượng data tĩnh.)
- TKB có cần phân biệt **học kỳ** (HK1/HK2/HK phụ) để lọc theo học kỳ không?
