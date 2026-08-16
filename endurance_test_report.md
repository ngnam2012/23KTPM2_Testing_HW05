# Báo cáo Kết quả Endurance Test (Phase 3)

Qua quá trình thực thi Endurance Test (duy trì tải liên tục với 22 Threads trong thời gian 15 phút), hệ thống SUT (Node.js + SQLite) thể hiện được sự ổn định tương đối về tài nguyên phần cứng nhưng lại bộc lộ rõ các giới hạn về kiến trúc. Cụ thể:

1. **Mức độ ổn định về hiệu năng (Throughput & Response Time):**
   Hệ thống duy trì mức **Max stable RPS đạt 10.82 req/s** trong suốt quá trình thử nghiệm mà không xảy ra hiện tượng suy thoái (degradation). Thời gian phản hồi (Response Time) giữ ở mức rất tốt và không bị trì hoãn sau thời gian dài.

2. **Rò rỉ bộ nhớ (Memory Leak):**
   Hệ thống **không** gặp hiện tượng rò rỉ bộ nhớ (Memory Leak). Mức tiêu thụ bộ nhớ RAM (Memory Ceiling) của tiến trình Node.js hoàn toàn ổn định và đạt ngưỡng trần là **67.6 MB** xuyên suốt 15 phút. Kiến trúc lưu trữ In-memory array tỏ ra không ngốn tài nguyên với lượng dữ liệu nhỏ.

3. **Tỷ lệ lỗi (Error Trend):**
   Tỷ lệ lỗi duy trì ổn định không đổi ở mức **11.37%** từ đầu đến cuối phiên. Điều này một lần nữa khẳng định lỗi không xuất phát từ việc cạn kiệt tài nguyên hệ thống (như tràn RAM hay quá tải CPU theo thời gian), mà bắt nguồn từ các bug logic nghiệp vụ cốt lõi (điển hình như cơ chế cộng gộp `login_attempts` dẫn đến Lockout hàng loạt, hoặc lỗi tính toán làm âm tiền coupon).
