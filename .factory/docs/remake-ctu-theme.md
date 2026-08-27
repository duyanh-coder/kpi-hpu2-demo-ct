# Remake Nhận diện theo Brand ĐH Cần Thơ

## TL;DR kiểu Feynman
- App KPI nội bộ (sidebar trái + dashboard), user muốn ăn theo màu/font website ĐH Cần Thơ.
- User chốt: **chỉ đổi nhận diện (màu + font), giữ layout quản trị**.
- Đổi primary `#0d47a1` → `#1f5ca9`, secondary `#e3bf00` → `#00afef`, font body `Barlow` → `Readex Pro`.
- Backup: commit khôi phục `f67f138`; lỗi thì `git revert`.

## Audit Summary
- `globals.css` là theme duy nhất (tokens + class chính).
- `layout.tsx` nạp font K2D + Barlow qua next/font/google.
- 86 file tsx; `#00afef` đã có 20 chỗ (chủ yếu màu chart), `#0d47a1` 9 chỗ ngoài globals.

## Proposal
1. `globals.css`: đổi primary/#/#light, secondary, `--font-body`.
2. `layout.tsx`: Barlow → Readex Pro.
3. Không đụng màu chart hardcode.

## Files Impacted
- `src/app/globals.css` (Sửa)
- `src/app/layout.tsx` (Sửa)

## Verification
- `npx tsc --noEmit`.
- Rollback `git reset --hard f67f138`.

## Rollback
- `git revert <commit>` hoặc `git reset --hard f67f138`.
