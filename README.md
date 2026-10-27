# Hoa Ngữ Hóa Chất: học tiếng Trung ngành hóa chất & xuất nhập khẩu

Ứng dụng web chạy offline, không cần cài đặt hay máy chủ. Tiến độ học lưu ngay trên trình duyệt của máy đang dùng (localStorage).

## Mở ứng dụng

- **Dùng trên mạng (điện thoại, máy khác):** https://a2zship.github.io/HoaNguHoaChat/. Repo `a2zship/HoaNguHoaChat`. Mỗi lần push lên `main`, GitHub Actions chạy test rồi tự deploy.
- **Cách nhanh nhất:** bấm đúp `index.html` để mở bằng Chrome hoặc Edge.
- **Muốn dùng nút "Nói thử" (chấm phát âm):** micro thường bị chặn khi mở file trực tiếp, nên hãy chạy máy chủ xem thử (cổng 3261, xem `QUY_UOC_CONG_DU_AN.md`):
  ```bash
  python -m http.server 3261 --bind 127.0.0.1
  ```
  rồi mở http://localhost:3261

## Có gì trong app

| Mục | Nội dung |
|---|---|
| Hôm nay | Số thẻ đến hạn ôn, số từ đã thuộc, chuỗi ngày học, tiến độ từng chủ đề |
| Từ vựng | 215 từ trong 12 chủ đề (tên hóa chất, thông số/COA, an toàn/MSDS, đóng gói, báo giá, hợp đồng, thanh toán T/T–L/C, Incoterms, vận tải, chứng từ hải quan, khiếu nại, giao tiếp). Có 50 câu ví dụ. Tra được bằng chữ Hán, pinyin gõ không dấu, hoặc nghĩa tiếng Việt |
| Ôn thẻ | Thẻ ghi nhớ có lịch ôn ngắt quãng: Quên → 10 phút, Khó/Nhớ/Dễ → hẹn ngày tăng dần. Đặt được số từ mới mỗi ngày. Phím tắt Space để lật thẻ, 1–4 để chấm |
| Luyện tập | Bài 10 câu, 4 kiểu: Hán→Việt, Việt→Hán, Nghe→chọn, Gõ pinyin. Câu sai tự đưa vào Ôn thẻ |
| Hội thoại | 6 tình huống mua hàng từ Trung Quốc: hỏi giá Sorbitol, xin COA/MSDS/mẫu, đàm phán giá–MOQ, chốt T/T + form E, đặt tàu + telex release, khiếu nại thiếu cân/vón cục. Nghe từng câu hoặc cả bài, bật/tắt pinyin và nghĩa, chế độ đóng vai, chấm điểm câu nói |
| Cài đặt | Tốc độ đọc, số từ mới/ngày, sáng/tối, xuất/nhập tiến độ (.json) để chuyển máy |

## Phát âm và luyện nói

- **Nghe:** dùng giọng đọc có sẵn của máy (Web Speech API, `zh-CN`). Windows đã có Huihui/Kangkang/Yaoyao nếu cài gói tiếng Trung, còn Edge có sẵn giọng Xiaoxiao trực tuyến. Nếu máy chưa có giọng, app sẽ hiện hướng dẫn cài trong mục Cài đặt.
- **Nói thử:** cần Chrome hoặc Edge, có mạng Internet và cấp quyền micro. Điểm là tỉ lệ chữ Hán khớp giữa câu mẫu và câu máy nghe được. Điểm này chỉ để luyện, không đánh giá thanh điệu chính xác.

## Thêm nội dung

- Từ vựng: `data/tuvung.js`. Mỗi dòng có dạng `["chữ Hán", "pīnyīn", "nghĩa", "ví dụ Hán|pinyin|nghĩa"]`, phần ví dụ có thể bỏ. **Chỉ thêm vào cuối mỗi chủ đề**, vì mã từ được đánh theo vị trí; chèn vào giữa sẽ làm lệch tiến độ đã lưu.
- Hội thoại: `data/hoithoai.js`, mỗi câu có dạng `["A" hoặc "B", chữ Hán, pinyin, nghĩa]`.
- Sau khi sửa, chạy test để bắt lỗi dữ liệu như thiếu trường, pinyin có ký tự lạ, hoặc từ bị trùng:
  ```bash
  node --test tests/core.test.js
  ```

## Lưu ý

- Nội dung là **bản soạn đầu**. Trước khi dùng để dạy rộng, nên nhờ người thạo tiếng Trung trong ngành rà lại thuật ngữ và pinyin.
- Tiến độ chỉ nằm trên một máy/trình duyệt. Xoá dữ liệu trình duyệt sẽ mất tiến độ, nên thỉnh thoảng hãy dùng "Xuất tiến độ" để sao lưu.
- Font Be Vietnam Pro và Noto Sans SC tải từ Google Fonts. Khi không có mạng, app tự dùng font của máy (Microsoft YaHei, Segoe UI).

## Cấu trúc

```
index.html          khung trang, sidebar/thanh dưới
assets/app.css      token màu sáng/tối (xem DESIGN.md) + component
assets/app.js       router, các trang, phát âm, nhận dạng giọng nói
assets/core.js      lịch ôn SRS, so pinyin, chấm câu nói, chuỗi ngày học (kiểm thử được bằng Node)
assets/icons.js     bộ icon SVG
data/tuvung.js      từ vựng 12 chủ đề
data/hoithoai.js    6 hội thoại
tests/core.test.js  12 test dữ liệu + logic
```
