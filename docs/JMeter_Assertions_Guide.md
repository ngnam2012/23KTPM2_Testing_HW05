# Hướng dẫn thiết lập Assertions cho JMeter Test Plan (EShop SUT)

Việc cấu hình Assertions là vô cùng quan trọng để JMeter xác định xem request có thực sự thành công hay không, chứ không chỉ đơn thuần là nhận được HTTP Status 200. Dưới đây là hướng dẫn chi tiết thiết lập Assertions cho 10 bước trong workflow.

---

## 1. Đề xuất Duration Assertion (Ngưỡng thời gian phản hồi)
Vì SUT chạy trên localhost (i7-1260P, NVMe, 32GB RAM), mạng vòng lặp (loopback) gần như độ trễ = 0. Tuy nhiên:
- SUT dùng **Node.js (Single-thread)** và **SQLite (Single-writer lock)**.
- Khi tải tăng (20-22 threads đồng thời), các request **Read (GET)** vẫn rất nhanh (< 100ms), nhưng các request **Transactional (POST/PUT/DELETE)** sẽ bị đưa vào hàng đợi do SQLite bị lock.

**Đề xuất cấu hình Duration Assertion:**
- **Nhóm Read-heavy (GET)** (Bước 2, 4, 5, 9): `Threshold = 300ms`. Nếu quá 300ms, nghĩa là Event Loop của Node.js đã bị block trầm trọng.
- **Nhóm Transactional (POST/PUT)** (Bước 3, 6, 7, 8, 10): `Threshold = 2000ms`. SQLite mặc định sẽ chờ release lock trong một khoảng thời gian trước khi ném lỗi `SQLITE_BUSY`. Việc chờ đến 2s trong điều kiện Load Test là bình thường.
- **Nhóm Auth-heavy (POST /login)** (Bước 1): `Threshold = 1500ms`. Thuật toán hash (bcrypt) sẽ tốn CPU và block event loop, thời gian phản hồi sẽ tăng mạnh.

*(Cách thêm: Click chuột phải vào HTTP Request > Add > Assertions > Duration Assertion. Nhập `Duration in milliseconds`).*

---

## 2. Cấu hình Assertions chi tiết cho từng Bước

Để JMeter đánh giá chính xác, mỗi HTTP Request cần 2 Assertions:
- **Response Assertion**: Kiểm tra HTTP Status Code.
- **JSON Assertion**: Kiểm tra tính hợp lệ của dữ liệu JSON trả về.

### Bước 1: POST /api/login
- **Response Assertion**: Field to Test = `Response Code`. Pattern Matching Rules = `Equals`. Patterns to Test = `200`.
- **JSON Assertion**: JSON Path = `$.token`. Đánh dấu `[x] Assert JSON Path exists` (Kiểm tra token phải xuất hiện).

### Bước 2: GET /api/users/me
- **Response Assertion**: Code `200`.
- **JSON Assertion**: JSON Path = `$.email`.

### Bước 3: PUT /api/users/me
- **Response Assertion**: Code `200`.
- **JSON Assertion**: JSON Path = `$.message`. Expected Value = `Profile updated`.

### Bước 4: GET /api/products?search=<keyword>
- **Response Assertion**: Code `200`.
- **JSON Assertion**: JSON Path = `$`. Đánh dấu `[x] Assert JSON Path exists` (Kiểm tra trả về có phải một mảng hay không).

### Bước 5: GET /api/products/<id>
**Lưu ý Bug SUT**: Product id=2,4 trả về `price` dạng string. Do đó, ta **KHÔNG** nên dùng kiểu kiểm tra strict type (integer) cho giá trị này để tránh JMeter báo fail oan (trừ khi chủ đích muốn bắt lỗi SUT này).
- **Response Assertion**: Code `200`.
- **JSON Assertion**: JSON Path = `$.id`. (Chỉ kiểm tra có trả về đúng object hay không). Không validate type của field `price`.

### Bước 6: POST /api/apply-coupon
**Lưu ý**: Endpoint này KHÔNG dùng Authorization.
*(Cách xử lý: Để Authorization header manager ở tầng Thread Group. Trong HTTP Request Bước 6, tạo một HTTP Header Manager con và set `Authorization` = trống, hoặc di chuyển cái Header Manager chung kia vào từng Request 2-5 và 7-10 thay vì tầng Thread Group).*
- **Response Assertion**: Code `200`.
- **JSON Assertion**: JSON Path = `$.success`. Expected Value = `true`.

### Bước 7: POST /api/cart
- **Response Assertion**: Code `200`.
- **JSON Assertion**: JSON Path = `$.message`. Expected Value = `Added to cart`.

### Bước 8: POST /api/checkout
- **Response Assertion**: Code `200`.
- **JSON Assertion**: JSON Path = `$.orderId`. Đánh dấu `[x] Assert JSON Path exists` (Bắt buộc phải trả về mã order).

### Bước 9: GET /api/orders/my-orders
- **Response Assertion**: Code `200`.
- **JSON Assertion**: JSON Path = `$`. (Kiểm tra trả về một mảng/danh sách order).

### Bước 10: PUT /api/orders/<id>/cancel
- **Response Assertion**: Code `200`.
- **JSON Assertion**: JSON Path = `$.message`. Expected Value = `Order canceled successfully`.
