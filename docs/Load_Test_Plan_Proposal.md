# Đề xuất Thiết kế Load Test bằng JMeter cho EShop

Dựa trên các đặc tả của hệ thống (SUT) và workflow đã cho, dưới đây là đề xuất chi tiết cho kịch bản Load Test trên JMeter kèm theo giải thích (justify) cho từng thông số.

## 1. Thread Count (Số lượng người dùng đồng thời)
**Đề xuất:** **20 hoặc tối đa 22 threads.**
**Justify:**
- **Ràng buộc về dữ liệu (22 accounts):** Hệ thống chỉ có 22 tài khoản test. Nếu thiết lập số Thread lớn hơn 22, các Thread sẽ phải dùng chung tài khoản. Việc dùng chung tài khoản có thể gây ra race condition đối với giỏ hàng in-memory (Cart có thể bị ghi đè hoặc tăng vọt số lượng không kiểm soát do không dùng DB) và gây ra các ngoại lệ không mong muốn ở luồng Checkout/Cancel.
- **Rủi ro lỗi "Login lockout bug":** Lỗi SUT khiến tài khoản bị khóa ngay khi sai mật khẩu 1 lần (do logic đếm +2 thay vì +1). Nếu nhiều Thread cùng truy cập vào 1 account và có vấn đề về đồng bộ, rủi ro bị khóa tài khoản hàng loạt là rất cao. Cấu hình tốt nhất là dùng **CSV Data Set Config** (Sharing mode: Current thread) để map 1-1 mỗi Thread với 1 account duy nhất và đảm bảo credentials hoàn toàn chính xác.
- **Sức chịu đựng của SUT:** Backend Node.js (single-threaded) và SQLite3 (single-writer lock) có khả năng xử lý concurrency kém đối với các request Transactional. 22 threads chạy liên tục (với loop) là đủ để tạo ra áp lực (Load) đánh giá giới hạn ghi của SQLite và sự phình to của in-memory Cart mà không làm crash server ngay lập tức.

## 2. Ramp-up Period (Thời gian khởi động các threads)
**Đề xuất:** **10 - 22 giây** (trung bình 0.5 - 1 giây cho mỗi thread).
**Justify:**
- **Tránh thắt cổ chai ở bước Login (Auth-heavy):** Endpoint `POST /api/login` thường sử dụng thuật toán hash mật khẩu (như bcrypt). Hàm này ngốn rất nhiều CPU và có thể gây block event-loop của Node.js (vốn chỉ có 1 thread).
- Nếu Ramp-up = 0, toàn bộ 22 threads sẽ đồng loạt gửi request Login. Node.js sẽ bị nghẽn event-loop, làm tăng vọt Response Time của tất cả các request, thậm chí gây ra lỗi timeout trước khi test thực sự bắt đầu.
- Ramp-up rải rác (vd 22 giây cho 22 threads) giúp hệ thống có thời gian "thở" để cấp phát token và xử lý auth, mô phỏng đúng hành vi người dùng truy cập từ từ vào hệ thống.

## 3. Loop Count hoặc Duration
**Đề xuất:** Chọn **Duration (thời gian chạy) là 5 đến 10 phút** thay vì Loop Count.
**Justify:**
- **Mục tiêu của Load Test:** Load Test cần duy trì một lượng tải ổn định trong một khoảng thời gian đủ dài để quan sát tính ổn định của hệ thống, đặc biệt là tài nguyên hệ thống (CPU, RAM).
- **Phát hiện Memory Leak (In-memory Cart):** Vì SUT lưu Cart in-memory (JS Object) mà không persist vào DB, nếu có bug không dọn dẹp Cart sau khi Checkout hoặc Cancel order, bộ nhớ Heap của Node.js sẽ tăng liên tục theo thời gian. Chạy test trong 5-10 phút sẽ giúp biểu đồ giám sát bộ nhớ (thông qua công cụ monitor) hiện rõ xu hướng leak này.
- **Quan sát Single-writer lock của SQLite:** Trong thời gian chạy liên tục, các Thread sẽ thi nhau gọi các endpoint Transactional (`PUT /api/users/me`, `POST /api/checkout`, `PUT /cancel`). Duration dài giúp ghi nhận tần suất và số lượng lỗi "database is locked" (do SQLite chỉ cho phép 1 kết nối ghi tại 1 thời điểm).

## 4. Think-time giữa các bước (Timers)
**Đề xuất:** Thêm **Uniform Random Timer** (hoặc Gaussian Random Timer) với Base delay khoảng **2000ms - 3000ms** và Random delay khoảng **1000ms - 2000ms** vào giữa các request (đặc biệt là sau các request Read).
**Justify:**
- **Mô phỏng hành vi thật:** Người dùng thực tế luôn cần thời gian để đọc thông tin sau khi nhận response (ví dụ: xem danh sách sản phẩm, chọn coupon, nhập địa chỉ) trước khi bấm nút chuyển qua bước tiếp theo.
- **Bảo vệ hệ thống khỏi Stress Test không mong muốn:** Nếu không có Think-time, kịch bản JMeter sẽ bắn request liên tục với tốc độ tối đa của máy khách. Với phần cứng cực mạnh (i7-1260P, 32GB RAM) làm Load Generator, việc thiếu Think-time sẽ biến Load Test thành Stress/Spike Test. Hệ thống Node.js/SQLite sẽ ngay lập tức bị quá tải (queue đầy, DB locked liên tục) và báo lỗi hàng loạt, không đem lại ý nghĩa đánh giá hiệu năng (Load Testing) ở mức sử dụng bình thường.
- Cấu hình đề xuất (VD: 2000ms + 1000ms random) nghĩa là giữa mỗi bước, Thread sẽ "nghỉ" ngẫu nhiên từ 2 đến 3 giây, tạo ra pacing (nhịp độ) hợp lý để SQLite kịp release lock và Node.js kịp clear call stack.

---

### Tóm tắt Khuyến nghị cho Kịch bản JMeter:
1. **Thread Group:**
   - Number of Threads: 22
   - Ramp-up period: 22 (giây)
   - Loop Count: Forever (Tích chọn Use Scheduler)
   - Duration: 300 - 600 (giây)
2. **CSV Data Set Config:** Load file chứa 22 user/pass. Recycle on EOF = False, Stop thread on EOF = True (hoặc cho loop lại tuỳ logic, nhưng nên map cứng mỗi thread 1 user).
3. **Timers:** Đặt ở Thread Group level hoặc từng Transaction Controller.
4. **Assertions:** Bắt buộc có JSON Assertion cho `token`, `orderId` và các field quan trọng.
5. **Listeners:** View Results Tree (dành cho debug), Summary Report, và Backend Listener (nếu cần đẩy data ra Grafana/InfluxDB).
