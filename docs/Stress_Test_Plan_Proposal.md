# Đề xuất Thiết kế Stress Test bằng JMeter cho EShop

Mục tiêu của Stress Test là tăng dần tải (load) vượt quá giới hạn thiết kế (capacity) để tìm ra điểm gãy (breaking point) của hệ thống Node.js + SQLite.

## 1. Thread count pattern (Start → Step → Max)
- **Start**: 10 Threads
- **Step**: Tăng thêm 2-5 Threads sau mỗi chu kỳ
- **Max**: **22 Threads** (Giới hạn phần cứng có thể chịu hơn, nhưng ta bị giới hạn bởi số lượng 22 accounts. Việc ép lên 100 Threads và tái sử dụng 22 accounts sẽ gây ra lỗi Race Condition trên In-memory Cart, làm sai lệch logic bài test).
*(Để ép tải gục ngã hệ thống với 22 Threads, ta phải loại bỏ hoàn toàn Think-time để đẩy Request Per Second - RPS lên cao nhất, thay vì tăng số lượng Threads ảo).*

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
**Vấn đề**: Khi hệ thống bị stress, Node.js sẽ xử lý rất chậm. Endpoint `POST /api/login` (chạy bcrypt) có thể bị Timeout. Bug của SUT lại xem mọi xử lý bất thường khi query Auth là "đăng nhập thất bại". Nếu timeout xảy ra, tài khoản sẽ bị khóa, Error Rate vọt lên 100%.

**Giải pháp đúng đắn**: KHÔNG ĐƯỢC bóc tách hay bỏ qua bước Login.
- Việc hệ thống sụp đổ vì nghẽn CPU ở hàm băm mật khẩu và dẫn tới khóa tài khoản CHÍNH LÀ **Breaking Point** thực sự của kiến trúc này.
- Bài test phải giữ nguyên `POST /api/login` trong vòng lặp. Nếu SUT tự khóa tài khoản do tải cao, đó là bằng chứng (evidence) rõ ràng nhất cho thấy SUT không chịu nổi tải, và phải báo cáo đúng như vậy vào tài liệu phân tích thay vì dùng mẹo JMeter để né lỗi.
- Cần có script độc lập (chạy ngoài JMeter) để Reset lại số lần login sai trong SQLite DB giữa các lần chạy test.
