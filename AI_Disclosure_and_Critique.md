# AI Disclosure & Critique

## 1. AI Critique (200-300 words)

Trong quá trình sử dụng AI (Gemini) để tự động sinh các kịch bản kiểm thử hiệu năng (Load, Stress, Spike) cho HW05, tôi nhận thấy AI hỗ trợ cực tốt trong việc dựng bộ khung cấu hình ban đầu, lựa chọn Plugin phù hợp (Ultimate/Concurrency Thread Group) và giải thích cặn kẽ các giới hạn (bottleneck) của Node.js kết hợp SQLite. 

Tuy nhiên, AI đã bộc lộ những sai lệch (hallucinations) và thiếu sót đáng kể khi áp dụng vào Business Logic thực tế của hệ thống:
- **Thiếu sót về bối cảnh (Context Flaws):** AI không tự nhận thức được cơ chế Account Lockout của EShop (khóa tài khoản sau 3 lần sai mật khẩu). Việc đề xuất một lượng lớn Thread đẩy vào Ramp-up ngắn mà không có cơ chế bypass Login đã khiến hàng loạt tài khoản bị khóa, trả về lỗi `403/401`, làm hỏng toàn bộ luồng kiểm thử phía sau.
- **Ramp-up và Think-time ảo:** Ban đầu, AI bỏ qua hoàn toàn `Think-time`, khiến kịch bản Load Test vô tình trở thành Stress Test do tần suất Request bắn ra liên tục không phản ánh đúng hành vi người dùng thật.
- **Tại sao AI thất bại?** Mặc dù AI hiểu cú pháp XML của JMeter (.jmx), nó lại thiếu khả năng suy luận trạng thái động của hệ thống (Stateful). Nó thường ưu tiên sinh ra các config mang tính "phá hoại" tĩnh thay vì dò dẫm tìm điểm gãy.

**Bài học hợp tác với AI (Collaboration Principle):** Qua quá trình này, tôi học được nguyên tắc **AI-Assisted, Human-Validated**: Không bao giờ phó mặc hoàn toàn tham số môi trường cho AI. Chúng ta chỉ nên dùng AI như một trợ lý viết boilerplate, giải thích Metrics và kiến trúc; còn việc quyết định thông số tải, gắn CSV Data-Driven, và xử lý luồng Logic phải do con người trực tiếp cấu hình dựa trên Endurance Threshold thực tế.

---

## 2. Mandatory Disclosure

*"Các Test Plan, kịch bản JMeter, và tài liệu phân tích mô hình Continuous Performance Testing trong báo cáo này được sinh phiên bản đầu bởi công cụ Gemini 3.1 Pro; tôi đã rà soát và chỉnh sửa phần cấu hình Timer, Ramp-up, bổ sung Data-Driven qua file CSV và điều chỉnh Stepping Thread Group để xử lý lỗi Account Lockout; phần chạy thực tế, thu thập log (.jtl) và tổng hợp Dashboard hoàn toàn do tôi tự thực hiện. AI Audit Report chi tiết đính kèm ở file `AI_Audit_Report.md`. Tôi cam đoan không dùng AI để sinh bất kỳ artifact nào thuộc danh mục bị cấm."*

**Chữ ký xác nhận**

| Họ tên sinh viên (in hoa): | NGUYỄN NHẬT NAM |
| :---- | :---- |
| **MSSV:** | 23127092 |
| **Lớp / Khoá:** | 23KTPM2 |
| **Môn học:** | CS423 / CSC13003 – Kiểm chứng Phần mềm |
| **Ngày:** | 17/08/2026 |
