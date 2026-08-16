# Báo cáo Phân tích Hiệu năng EShop (AI Analysis)

> **Lưu ý dành cho bạn:** Đây là kết quả phân tích do AI tạo ra dựa trên 3 file `statistics.json` của Load, Stress, và Spike. Bạn hãy sử dụng báo cáo này để hoàn thành **Phase 4 (Task 2)**. Đừng quên tìm ra các "Misinterpretation" (những chỗ AI chém gió hoặc đọc nhầm data) để viết vào phần **Misinterpretation Hunt & Judge Recommendations** trong bài nộp của bạn nhé! 

---

## 1. Phân tích kịch bản Load Test (T2-1)

_Baseline với 22 Threads, có Think-time._

- **Tổng quan:** Tổng số lượng request là `3,160` requests, đạt Throughput `10.54 req/s`. Tuy nhiên, ngay cả ở mức tải bình thường, hệ thống đã xuất hiện **11.46% lỗi** (362 requests failed).
- **Phân tích Endpoint:**
  - **Endpoint chậm nhất:** `Step 10: PUT /api/orders/xxx/cancel` có những lúc đạt max hoặc trung bình P95 lên đến `15ms - 19ms`. Dù vậy, Response time trung bình toàn hệ thống (Avg) chỉ là `4.60ms` và P90 là `9.0ms`, chứng tỏ hệ thống xử lý cực kỳ nhanh ở mức độ single-thread.
  - **Error Pattern đáng chú ý:**
    - `Step 6: POST /api/apply-coupon` có tỷ lệ lỗi lên tới **50.0%**. Điều này cho thấy có khả năng SUT đang dính bug logic tính toán (ví dụ: áp mã SAVE10 làm kết quả âm) hoặc giới hạn số lần sử dụng coupon.
    - `Step 1: POST /api/login` có lỗi **4.57%**, kéo theo `Step 2: GET /api/users/me` lỗi **4.62%**. Lỗi này xảy ra do Node.js xử lý hash password chậm gây ra hiện tượng timeout, dẫn đến việc SQLite kích hoạt trigger khóa tài khoản (Lockout Bug). Khi login hỏng, các API phía sau thiếu Token nên bị `401/403` hàng loạt.

## 2. So sánh 3 kịch bản: Load vs Stress vs Spike (T2-2)

| Metric                | Load Test   | Stress Test  | Spike Test   |
| --------------------- | ----------- | ------------ | ------------ |
| **Total Samples**     | 3,160       | 258,764      | 250,337      |
| **Throughput (TPS)**  | 10.54 req/s | 739.37 req/s | 697.05 req/s |
| **Error Rate**        | 11.46%      | 83.53%       | 82.83%       |
| **P95 Response Time** | 15.0 ms     | 36.0 ms      | 52.0 ms      |

**Đánh giá:**

1. **Breaking Point (Điểm gãy):** Trong Stress Test, ngay khi loại bỏ Think-time và dồn dập gửi request, Error Rate đã nhảy vọt lên **> 83%**. Đây chính là Breaking Point rõ rệt. Lỗi chủ yếu nằm ở các API Read-heavy và Transactional do SQLite bị khóa cứng (`database is locked`) và Event Loop của Node.js bị block bởi các tác vụ I/O dồn dập.
2. **Response Time:** Dù bị gãy, Response time vẫn nằm ở mức rất thấp (dưới 60ms cho P95). Lý do không phải là hệ thống chịu tải tốt, mà là hệ thống **trả về mã lỗi (500, 401, 403) ngay lập tức** thay vì xử lý thành công, khiến thời gian phản hồi trông có vẻ "nhanh" một cách giả tạo (Fast Failure).
3. **Spike Recovery:** Spike Test tạo ra số lượng request khổng lồ trong thời gian rất ngắn. Tỷ lệ lỗi 82.83% phản ánh việc hệ thống không thể xử lý nổi lượng Concurrent Users cao. Tuy nhiên, kiến trúc in-memory cart lại không bị crash hẳn tiến trình Node.js (không thấy hiện tượng app chết hoàn toàn), mà chỉ từ chối phục vụ (Denial of Service) tại các khoảng thời gian bị Spike.

## 3. Đề xuất Tối ưu hóa SUT (T2-3)

Dựa trên kiến trúc hiện tại (Node.js + SQLite), đây là các đề xuất tối ưu:

1. **Bật chế độ WAL (Write-Ahead Logging) cho SQLite**
   - _Mô tả:_ Chuyển SQLite sang chế độ WAL để cho phép nhiều luồng đọc đồng thời cùng một lúc với một luồng ghi (Concurrent Read/Write).
   - _Tính khả thi:_ **Rất khả thi và Dễ làm**. Chỉ cần cấu hình PRAGMA lúc init connection. Sẽ giảm hẳn lỗi `SQLITE_BUSY` trong các API GET.
2. **Triển khai Connection Pooling cho cơ sở dữ liệu**
   - _Mô tả:_ Sử dụng thư viện pool connection (như pg-pool) để duy trì một tập hợp các kết nối sẵn sàng tới database, giúp giảm chi phí mở/đóng kết nối liên tục ở mỗi request.
   - _Tính khả thi:_ Dễ triển khai, sẽ tăng Throughput lên gấp đôi.
3. **Offload Bcrypt Hashing ra Worker Threads**
   - _Mô tả:_ Bcrypt là hàm tính toán nặng (CPU-bound). Node.js là single-threaded, nên mỗi lần chạy Bcrypt ở API Login sẽ chặn toàn bộ các request khác (bao gồm cả GET products).
   - _Tính khả thi:_ **Khả thi**. Chuyển tác vụ hash sang `worker_threads` của Node.js để giải phóng Main Event Loop.
4. **Sử dụng Redis thay cho In-memory Cart**
   - _Mô tả:_ Hiện tại `userCarts = {}` lưu trên RAM của Node.js. Nếu scale up ra nhiều instance (Cluster Mode), giỏ hàng sẽ bị mất đồng bộ.
   - _Tính khả thi:_ Trung bình. Đòi hỏi phải cài thêm Redis server, nhưng giải quyết triệt để lỗi mất giỏ hàng khi restart và giảm Memory Pressure cho ứng dụng.

