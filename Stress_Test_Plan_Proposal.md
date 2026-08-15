# Đề xuất Thiết kế Stress Test bằng JMeter cho EShop

Mục tiêu của Stress Test là tăng dần tải (load) vượt quá giới hạn thiết kế (capacity) để tìm ra điểm gãy (breaking point) của hệ thống Node.js + SQLite.

## 1. Thread count pattern (Start → Step → Max)
Vì chúng ta đã thiết lập Baseline Load Test ở mức 22 Threads, Stress Test cần đẩy cao hơn nhiều để ép hệ thống gục ngã.
- **Start**: 10 Threads
- **Step**: Tăng thêm 10 Threads sau mỗi chu kỳ
- **Max**: 100 đến 150 Threads (với hardware i7-1260P, số lượng này thừa sức khiến SQLite và Node.js event-loop bị block).
*(Chú ý: Bắt buộc phải Recycle tài khoản vì Max > 22)*

## 2. Implement stepping: Dùng Plugin
**Đề xuất:** Cài đặt và sử dụng Plugin **`bzm - Concurrency Thread Group`** (nằm trong bộ JMeter Plugins Manager / Custom Thread Groups).
- **Lý do**: Đây là Thread Group chuẩn mực cho Stress Test, cho phép cấu hình Target Concurrency, Ramp Up Time, và quan trọng nhất là **Ramp-Up Steps Count** dễ dàng ngay trên giao diện mà không phải copy-paste nhiều Thread Group truyền thống.
- *(Nếu không cài được plugin: Có thể tạo 5-10 Thread Group truyền thống, thiết lập Startup Delay tăng dần, nhưng khó maintain và báo cáo bị phân mảnh).*

## 3. Duration mỗi step (Hold Target Rate Time)
**Đề xuất:**
- **Step Duration (Hold Time)**: **1 - 2 phút** mỗi Step (ví dụ: mỗi khi tăng thêm 10 threads, giữ nguyên mức đó trong 1 phút).
- **Lý do**: Cần 1-2 phút ở mỗi mức tải để hệ thống "ngấm đòn". SQLite cần thời gian để dồn queue (hàng đợi) ghi dữ liệu, và Node.js cần thời gian để Heap Memory tăng lên hoặc Event Loop bị quá tải rõ rệt.

## 4. Think-time (Timers)
**Đề xuất:** **Giảm Think-time xuống cực thấp (0ms - 500ms)** hoặc loại bỏ hoàn toàn.
- **Lý do**: Khác với Load Test cần mô phỏng tải thực tế (2-3s think time), Stress Test cần tạo áp lực tối đa (Spike/Stress). Bằng cách gỡ bỏ Timer, ngay khi nhận response từ Bước 1, Thread lập tức bắn request Bước 2. Điều này sẽ đẩy số lượng Request Per Second (RPS) lên rất cao, ép kiến trúc Single-thread của Node.js bộc lộ giới hạn xử lý CPU (đặc biệt khi bcrypt hash token) và SQLite sinh lỗi `SQLITE_BUSY`.

## 5. Tiêu chí xác định Breaking Point
Điểm gãy của SUT này sẽ xuất hiện qua 2 tín hiệu (threshold):
1. **Error Rate vượt quá 5%**: Khi SQLite không kịp giải quyết queue, các giao dịch Ghi sẽ bị timeout ở cấp DB và ném ra lỗi `database is locked`. Error Rate sẽ vọt từ 0% lên >5% rất nhanh tại điểm này.
2. **Response Time Degradation (Độ trễ suy giảm nghiêm trọng)**:
   - Các API Read (thông thường < 300ms) bất ngờ tăng vọt lên > **3000ms - 5000ms**.
   - Các API Transactional (POST/PUT) đạt mức Timeout (thường API sẽ bị ngắt kết nối hoặc Client/JMeter tự ngắt).
   - *Kết luận Breaking Point*: Hệ thống bị coi là "gãy" khi Response Time trung bình ở percentiles thứ 90 (90th PCT) của toàn workflow vượt qua ngưỡng 5 giây hoặc Error rate > 5%.

## 6. Xử lý rủi ro "Lockout xảy ra do Timeout"
**Vấn đề cực kỳ nguy hiểm**: Khi hệ thống bị stress, Node.js sẽ xử lý rất chậm. Endpoint `POST /api/login` (chạy bcrypt) có thể bị Timeout. Bug của SUT lại xem mọi xử lý bất thường (như timeout giữa chừng hoặc DB lỗi) khi query Auth là "đăng nhập thất bại" và cộng dồn bộ đếm. Do ta tái sử dụng (recycle) 22 accounts song song liên tục, nếu 1 account bị kẹt timeout 3 lần, nó sẽ bị khóa vĩnh viễn, dẫn đến toàn bộ Stress Test sụp đổ (Error rate đạt 100% không phải do tải SUT, mà do khóa tài khoản).

**Giải pháp (Workaround): Bóc tách bước Login ra khỏi Stress Loop**
Để thực sự đo lường tải của các tính năng cốt lõi (Cart, Checkout, Profile) mà không bị "chết yểu" bởi hệ thống Auth tồi:
1. **Tạo `setUp Thread Group`**: Chạy 1 vòng duy nhất (Loop = 1) với 22 Threads.
2. Thực hiện `POST /api/login` cho 22 accounts từ CSV.
3. Trích xuất `${token}` bằng JSON Extractor.
4. Ghi các token này ra một file phụ hoặc đẩy vào `JMeter Properties` (dùng cấu trúc `${__setProperty(token_${user_id}, ${token},)}`).
5. **Trong `bzm - Concurrency Thread Group` (Stress Test Loop)**: Xóa bước `POST /api/login`. Các Thread chỉ đọc token đã được lưu (ví dụ từ CSV token hoặc properties) và bắn trực tiếp các request từ Bước 2 đến Bước 10.

*Cách này đảm bảo SUT chịu stress chính xác vào các chức năng kinh doanh (Cart, Order, Products) và DB Locks, đồng thời né hoàn toàn việc bị hỏng test giữa chừng do Bug Lockout tài khoản.*
