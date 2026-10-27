# DESIGN.md — Hoa Ngữ Hóa Chất (học tiếng Trung ngành hóa chất & XNK)

Loại giao diện: **ứng dụng** (học hằng ngày, thẻ ghi nhớ, bài luyện) → theo `02_ThuVien_CauLenh/HuongDan_ThietKe_GiaoDien_UngDung.md`, không dùng Design Taste Sochem.
Nguồn hệ thiết kế: `ui-ux-pro-max --design-system` ("language learning app vocabulary flashcard chinese business") → gợi ý *indigo học tập + xanh tiến bộ*, font Noto Sans SC. Bỏ phần landing/hero/GSAP vì đây là app.

## 1. Token màu (đã đo bằng script WCAG, 27/10/2026)

| Token | Sáng | Tỉ lệ | Tối | Tỉ lệ |
|---|---|---|---|---|
| `--text` / `--bg` | `#0f172a` / `#f5f6fb` | 16,54 | `#e2e8f0` / `#0b1020` | 15,36 |
| `--text-2` / `--surface` | `#334155` / `#ffffff` | 10,35 | `#cbd5e1` / `#141a2e` | 11,62 |
| `--muted` / `--surface` | `#5b6b7f` / `#ffffff` | 5,45 | `#94a3b8` / `#141a2e` | 6,73 |
| `--muted` / `--bg` | `#5b6b7f` / `#f5f6fb` | 5,05 | — | — |
| `--on-primary` / `--primary` | `#ffffff` / `#4338ca` | 7,90 | `#0b1020` / `#a5b4fc` | 9,50 |
| `--primary` / `--surface` (link, chữ nhấn) | `#4338ca` | 7,90 | `#a5b4fc` | 8,66 |
| `--primary` / `--primary-soft` | `#4338ca` / `#eef2ff` | 7,07 | `#c7d2fe` / `#25295a` | 9,12 |
| `--ok` / `--surface` (đúng, đã thuộc) | `#047857` | 5,48 | `#34d399` | 8,98 |
| `--ok` / `--ok-soft` | `#065f46` / `#ecfdf5` | 7,29 | `#6ee7b7` / `#0f2f27` | 9,46 |
| `--bad` / `--surface` (sai, quên) | `#b91c1c` | 6,47 | `#f87171` | 6,24 |
| `--bad` / `--bad-soft` | `#991b1b` / `#fef2f2` | 7,60 | `#fca5a5` / `#3a1616` | 8,47 |
| `--warn` / `--warn-soft` (đến hạn ôn) | `#92400e` / `#fffbeb` | 6,84 | `#fcd34d` / `#33240a` | 10,42 |
| `--border-strong` (viền ô nhập, ≥3:1) | `#6b7a90` | 4,36 | `#64748b` | 3,63 |
| Sidebar chữ / nền | `#ffffff` / `#1e1b4b` | 15,99 | (giữ nguyên) | — |

- Một màu hành động chính mỗi màn: `--primary` (indigo). `--warn` (hổ phách) chỉ dùng cho "đến hạn ôn", khác hẳn indigo.
- Đúng/sai **luôn kèm icon + chữ** ("Đúng", "Sai — đáp án: …"), không chỉ dựa vào xanh/đỏ.
- Thanh điểm 4 mức đánh giá thẻ: Quên (bad) · Khó (warn) · Nhớ (primary) · Dễ (ok) — mỗi nút có chữ.

## 2. Chữ

- Chữ Việt/Latin: **Be Vietnam Pro** 400/500/600 (app thân thiện, đủ dấu tiếng Việt).
- Chữ Hán: **Noto Sans SC** 400/500 → dự phòng `"Microsoft YaHei", "PingFang SC", sans-serif` để vẫn chạy khi không có mạng.
- Thang cỡ: 13 · 14 · 16 (thân) · 18 · 22 · 28 (h1). Chữ Hán trên thẻ ghi nhớ 56–72px (`clamp`), trong danh sách 24px.
- Ô nhập 16px ở mọi kích thước (iOS không tự phóng to).
- Số đếm (điểm, số từ, ngày) dùng `tabular-nums`.

## 3. Khoảng cách, bo góc, chạm

- Bước 4px: 4 · 8 · 12 · 16 · 24 · 32. Bo `--r-sm 6px`, `--r-md 10px`, `--r-lg 14px`.
- Vùng bấm ≥ 44px (`--tap`), khoảng cách giữa vùng bấm ≥ 8px.

## 4. Điều hướng

- ≥1024px: **sidebar** trái nền `#1e1b4b` (logo chữ 化 trong ô indigo), 6 mục: Hôm nay · Từ vựng · Ôn thẻ · Luyện tập · Hội thoại · Cài đặt.
- <1024px: thanh trên (tên app + nút Cài đặt) + **thanh dưới 5 mục** (bỏ Cài đặt, đã có ở thanh trên). Chừa `env(safe-area-inset-bottom)`, nội dung có đệm dưới.
- Mục đang mở: `aria-current="page"`. Router hash (`#/tu-vung/bao-gia`) để mở thẳng file `index.html` không cần server.

## 5. Component

- `icon(name)` — bộ SVG nét 2px kiểu Lucide, viết tay trong `assets/icons.js`. Cấm emoji/ký tự làm icon.
- `Hanzi` — chữ Hán + pinyin (có dấu thanh) + nghĩa; nút loa `aria-label="Nghe phát âm"`.
- `Empty` — icon + câu hướng dẫn cho mọi danh sách rỗng (không có từ đến hạn, tìm không thấy…).
- `Note` — thông báo icon + chữ, lỗi `role="alert"`, còn lại `role="status"`.
- Nút: `.btn-primary`, `.btn` (viền), `.btn-ghost`; trạng thái `aria-busy` khi đang nghe giọng nói.
- Thẻ ghi nhớ: lật bằng nút "Hiện đáp án" (phím Space), đánh giá phím 1–4.

## 6. Hiệu ứng & trợ năng

- 150–200ms, chỉ opacity/transform/màu; tắt khi `prefers-reduced-motion`.
- Skip link "Bỏ qua, tới nội dung chính", `:focus-visible` viền 3px `--ring`, không xoá outline.
- Mỗi trang một `h1`; đổi trang thì chuyển focus về `h1`.
- Không tràn ngang ở 375px: bảng từ vựng là danh sách thẻ, chữ Hán dài được `overflow-wrap:anywhere`.
